import { GridCell, PlacedWord, WordDirection, WordSearchGrid } from '@/types/word-search';

const DIRECTIONS: WordDirection[] = [
  'horizontal',
  'vertical',
  'diagonal-down',
  'diagonal-up',
  'horizontal-rev',
  'vertical-rev',
  'diagonal-down-rev',
  'diagonal-up-rev',
];

const DIRECTION_DELTAS: Record<WordDirection, { dr: number; dc: number }> = {
  horizontal: { dr: 0, dc: 1 },
  vertical: { dr: 1, dc: 0 },
  'diagonal-down': { dr: 1, dc: 1 },
  'diagonal-up': { dr: -1, dc: 1 },
  'horizontal-rev': { dr: 0, dc: -1 },
  'vertical-rev': { dr: -1, dc: 0 },
  'diagonal-down-rev': { dr: 1, dc: -1 },
  'diagonal-up-rev': { dr: -1, dc: -1 },
};

// Portuguese alphabet characters for filling empty cells
const PT_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

/**
 * Removes accents and converts to uppercase for grid placement.
 * Spaces are removed so multi-word ingredients fit in the grid.
 */
export function normalizeForGrid(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/[^A-Z]/g, '');
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function canPlace(
  grid: string[][],
  size: number,
  word: string,
  row: number,
  col: number,
  direction: WordDirection
): boolean {
  const { dr, dc } = DIRECTION_DELTAS[direction];
  for (let i = 0; i < word.length; i++) {
    const r = row + dr * i;
    const c = col + dc * i;
    if (r < 0 || r >= size || c < 0 || c >= size) return false;
    if (grid[r][c] !== '' && grid[r][c] !== word[i]) return false;
  }
  return true;
}

function placeWord(
  grid: string[][],
  word: string,
  row: number,
  col: number,
  direction: WordDirection
): void {
  const { dr, dc } = DIRECTION_DELTAS[direction];
  for (let i = 0; i < word.length; i++) {
    grid[row + dr * i][col + dc * i] = word[i];
  }
}

/**
 * Builds a word search grid of `size x size` cells containing the given words.
 * Words that cannot fit after MAX_ATTEMPTS are skipped (will be noted as unplaced).
 */
export function buildWordSearchGrid(words: string[], size: number): WordSearchGrid {
  const MAX_ATTEMPTS = 200;

  // Raw letter grid (empty string = unfilled)
  const rawGrid: string[][] = Array.from({ length: size }, () => Array(size).fill(''));

  const placedWords: PlacedWord[] = [];

  // Sort by length descending — longer words placed first
  const sortedWords = [...words].sort((a, b) => b.length - a.length);

  for (const word of sortedWords) {
    const normalized = normalizeForGrid(word);
    if (normalized.length === 0 || normalized.length > size) continue;

    let placed = false;
    const shuffledDirections = shuffle(DIRECTIONS);

    for (let attempt = 0; attempt < MAX_ATTEMPTS && !placed; attempt++) {
      const direction = shuffledDirections[attempt % shuffledDirections.length];
      const { dr, dc } = DIRECTION_DELTAS[direction];

      // Compute valid start range for this direction
      let rowMin = 0, rowMax = size - 1;
      let colMin = 0, colMax = size - 1;

      if (dr > 0) rowMax = size - normalized.length;
      if (dr < 0) rowMin = normalized.length - 1;
      if (dc > 0) colMax = size - normalized.length;
      if (dc < 0) colMin = normalized.length - 1;

      if (rowMin > rowMax || colMin > colMax) continue;

      const row = rowMin + Math.floor(Math.random() * (rowMax - rowMin + 1));
      const col = colMin + Math.floor(Math.random() * (colMax - colMin + 1));

      if (canPlace(rawGrid, size, normalized, row, col, direction)) {
        placeWord(rawGrid, normalized, row, col, direction);
        placedWords.push({
          word,
          normalized,
          startRow: row,
          startCol: col,
          direction,
          found: false,
        });
        placed = true;
      }
    }
  }

  // Fill remaining cells with random letters
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (rawGrid[r][c] === '') {
        rawGrid[r][c] = PT_LETTERS[Math.floor(Math.random() * PT_LETTERS.length)];
      }
    }
  }

  // Build cell objects with word membership info
  const cellWordMap: number[][][] = Array.from({ length: size }, () =>
    Array.from({ length: size }, () => [] as number[])
  );

  for (let wi = 0; wi < placedWords.length; wi++) {
    const pw = placedWords[wi];
    const { dr, dc } = DIRECTION_DELTAS[pw.direction];
    for (let i = 0; i < pw.normalized.length; i++) {
      const r = pw.startRow + dr * i;
      const c = pw.startCol + dc * i;
      cellWordMap[r][c].push(wi);
    }
  }

  const cells: GridCell[][] = rawGrid.map((rowArr, r) =>
    rowArr.map((letter, c) => ({
      letter,
      row: r,
      col: c,
      isPartOfWord: cellWordMap[r][c].length > 0,
      wordIndexes: cellWordMap[r][c],
    }))
  );

  return {
    size,
    cells,
    placedWords,
    totalWords: placedWords.length,
  };
}

/**
 * Given a selection from (r1, c1) to (r2, c2), returns all cells on the line.
 * Only returns cells if the line is horizontal, vertical, or diagonal (45°).
 */
export function getCellsOnLine(
  r1: number,
  c1: number,
  r2: number,
  c2: number,
  size: number
): Array<{ row: number; col: number }> {
  const dr = r2 - r1;
  const dc = c2 - c1;

  const absDr = Math.abs(dr);
  const absDc = Math.abs(dc);

  // Must be axis-aligned or 45°
  const isDiagonal = absDr === absDc;
  const isAxisAligned = dr === 0 || dc === 0;

  if (!isDiagonal && !isAxisAligned) return [];

  const steps = Math.max(absDr, absDc);
  const stepDr = steps === 0 ? 0 : dr / steps;
  const stepDc = steps === 0 ? 0 : dc / steps;

  const cells: Array<{ row: number; col: number }> = [];
  for (let i = 0; i <= steps; i++) {
    const r = r1 + Math.round(stepDr * i);
    const c = c1 + Math.round(stepDc * i);
    if (r >= 0 && r < size && c >= 0 && c < size) {
      cells.push({ row: r, col: c });
    }
  }
  return cells;
}

/**
 * Given selected cells, checks if they match any unplaced word (in order).
 * Returns the index of the matched word, or -1.
 */
export function checkSelectionForWord(
  selectedCells: Array<{ row: number; col: number }>,
  grid: WordSearchGrid
): number {
  if (selectedCells.length < 2) return -1;

  // Build selected string
  const selectedLetters = selectedCells
    .map((c) => grid.cells[c.row][c.col].letter)
    .join('');

  for (let wi = 0; wi < grid.placedWords.length; wi++) {
    const pw = grid.placedWords[wi];
    if (pw.found) continue;
    if (pw.normalized === selectedLetters) {
      // Verify by checking start cell and direction match
      const { dr, dc } = DIRECTION_DELTAS[pw.direction];
      const firstCell = selectedCells[0];
      const expectedFirstRow = pw.startRow;
      const expectedFirstCol = pw.startCol;
      const expectedLastRow = pw.startRow + dr * (pw.normalized.length - 1);
      const expectedLastCol = pw.startCol + dc * (pw.normalized.length - 1);

      const lastCell = selectedCells[selectedCells.length - 1];

      const matchesForward =
        firstCell.row === expectedFirstRow &&
        firstCell.col === expectedFirstCol &&
        lastCell.row === expectedLastRow &&
        lastCell.col === expectedLastCol;

      // Also allow reverse selection (user drew from end to start)
      const matchesBackward =
        firstCell.row === expectedLastRow &&
        firstCell.col === expectedLastCol &&
        lastCell.row === expectedFirstRow &&
        lastCell.col === expectedFirstCol;

      if (matchesForward || matchesBackward) {
        return wi;
      }
    }
  }

  return -1;
}
