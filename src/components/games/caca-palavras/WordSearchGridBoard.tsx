'use client';

import { useCallback, useRef } from 'react';
import { WordSearchGrid } from '@/types/word-search';

interface FoundCells {
  cells: Array<{ row: number; col: number }>;
  wordIndex: number;
  color: string;
}

interface WordSearchGridProps {
  grid: WordSearchGrid;
  foundCells: FoundCells[];
  foundWordIndexes: Set<number>;
  selectionPreviewCells: Array<{ row: number; col: number }>;
  wrongFlash: boolean;
  onCellMouseDown: (row: number, col: number) => void;
  onCellMouseEnter: (row: number, col: number) => void;
  onCellMouseUp: (row: number, col: number) => void;
  onGridMouseLeave: () => void;
}

export function WordSearchGridBoard({
  grid,
  foundCells,
  foundWordIndexes,
  selectionPreviewCells,
  wrongFlash,
  onCellMouseDown,
  onCellMouseEnter,
  onCellMouseUp,
  onGridMouseLeave,
}: WordSearchGridProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Build lookup maps for fast cell-state resolution
  const previewSet = new Set(selectionPreviewCells.map((c) => `${c.row},${c.col}`));

  // Map each cell to its found highlight color (last found wins for overlaps)
  const foundColorMap = new Map<string, string>();
  for (const fc of foundCells) {
    for (const cell of fc.cells) {
      foundColorMap.set(`${cell.row},${cell.col}`, fc.color);
    }
  }

  // Touch support — convert touch position to cell
  const getTouchCell = useCallback(
    (touch: React.Touch): { row: number; col: number } | null => {
      const el = document.elementFromPoint(touch.clientX, touch.clientY);
      if (!el) return null;
      const rowAttr = el.getAttribute('data-row');
      const colAttr = el.getAttribute('data-col');
      if (rowAttr === null || colAttr === null) return null;
      return { row: parseInt(rowAttr), col: parseInt(colAttr) };
    },
    []
  );

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault();
      const cell = getTouchCell(e.touches[0]);
      if (cell) onCellMouseDown(cell.row, cell.col);
    },
    [getTouchCell, onCellMouseDown]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault();
      const cell = getTouchCell(e.touches[0]);
      if (cell) onCellMouseEnter(cell.row, cell.col);
    },
    [getTouchCell, onCellMouseEnter]
  );

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault();
      const cell = getTouchCell(e.changedTouches[0]);
      if (cell) onCellMouseUp(cell.row, cell.col);
    },
    [getTouchCell, onCellMouseUp]
  );

  // Compute cell size based on grid size (smaller grid = bigger cells)
  const cellSizeClass =
    grid.size <= 12
      ? 'w-8 h-8 text-sm sm:w-9 sm:h-9 sm:text-base'
      : grid.size <= 15
      ? 'w-6 h-6 text-xs sm:w-8 sm:h-8 sm:text-sm'
      : 'w-5 h-5 text-[10px] sm:w-6 sm:h-6 sm:text-xs';

  return (
    <div
      ref={containerRef}
      role="grid"
      aria-label="Grade do caça-palavras"
      className={`inline-block select-none rounded-2xl border-2 p-2 sm:p-3 shadow-xl transition-all duration-200 ${
        wrongFlash
          ? 'border-rose-400 bg-rose-50 shadow-rose-200'
          : 'border-brand-200 bg-white shadow-brand-100/50'
      }`}
      onMouseLeave={onGridMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div
        className="grid gap-0.5"
        style={{ gridTemplateColumns: `repeat(${grid.size}, minmax(0, 1fr))` }}
      >
        {grid.cells.map((row, r) =>
          row.map((cell, c) => {
            const key = `${r},${c}`;
            const isFoundHighlight = foundColorMap.has(key);
            const foundColor = foundColorMap.get(key) || '';
            const isPreview = previewSet.has(key);
            const isPartOfWord = cell.wordIndexes.length > 0;

            // Determine if this cell is part of a word that's been FOUND
            const isCellWordFound = cell.wordIndexes.some((wi) => foundWordIndexes.has(wi));

            return (
              <button
                key={key}
                type="button"
                data-row={r}
                data-col={c}
                aria-label={`Letra ${cell.letter}, linha ${r + 1}, coluna ${c + 1}`}
                onMouseDown={() => onCellMouseDown(r, c)}
                onMouseEnter={() => onCellMouseEnter(r, c)}
                onMouseUp={() => onCellMouseUp(r, c)}
                className={[
                  cellSizeClass,
                  'flex items-center justify-center rounded font-mono font-bold cursor-pointer transition-all duration-100 select-none',
                  isFoundHighlight
                    ? 'text-white scale-105 shadow-md ring-2 ring-white/80 z-10'
                    : isPreview
                    ? 'bg-brand-800 text-white scale-110 z-10 shadow-md ring-1 ring-brand-700'
                    : isCellWordFound
                    ? 'text-brand-900'
                    : isPartOfWord
                    ? 'text-brand-900 hover:bg-brand-100'
                    : 'text-gray-500 hover:bg-gray-100',
                ]
                  .filter(Boolean)
                  .join(' ')}
                style={isFoundHighlight ? { backgroundColor: foundColor } : undefined}
              >
                {cell.letter}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
