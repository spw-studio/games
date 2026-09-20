import { GameDifficulty } from './game';

export type WordDirection =
  | 'horizontal'
  | 'vertical'
  | 'diagonal-down'
  | 'diagonal-up'
  | 'horizontal-rev'
  | 'vertical-rev'
  | 'diagonal-down-rev'
  | 'diagonal-up-rev';

export interface PlacedWord {
  word: string;           // Original word (may contain spaces/accents)
  normalized: string;     // Uppercased, no accents, no spaces
  startRow: number;
  startCol: number;
  direction: WordDirection;
  found: boolean;
}

export interface GridCell {
  letter: string;
  row: number;
  col: number;
  isPartOfWord: boolean;
  wordIndexes: number[];  // which placed words this cell belongs to
}

export interface WordSearchGrid {
  size: number;           // NxN grid
  cells: GridCell[][];
  placedWords: PlacedWord[];
  totalWords: number;
}

export interface WordSearchSelection {
  start: { row: number; col: number } | null;
  end: { row: number; col: number } | null;
  current: Array<{ row: number; col: number }>;
  isSelecting: boolean;
}

export interface WordSearchMetrics {
  totalWords: number;
  foundWords: number;
  missedWords: number;
  wrongAttempts: number;
  hintsUsed: number;
  bestStreak: number;
  durationSeconds: number;
  [key: string]: unknown;
}

export interface WordSearchScoringBreakdown {
  baseScore: number;
  speedBonus: number;
  streakBonus: number;
  wrongAttemptPenalty: number;
  hintPenalty: number;
  difficultyMultiplier: number;
  finalScore: number;
}

export interface WordSearchConfigState {
  difficulty: GameDifficulty;
  category: string;
}
