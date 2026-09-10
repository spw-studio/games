export interface GameStatsSummary {
  totalGames: number;
  completedGames: number;
  bestScore: number;
  avgScore: number;
  bestTime: number; // in seconds
  avgAccuracy: number; // 0 to 100
  bestStreak: number;
  totalMatches: number;
  totalErrors: number;
}

export interface ScoreEvolutionPoint {
  matchIndex: number;
  date: string;
  score: number;
  gameId: string;
}

export interface AccuracyEvolutionPoint {
  matchIndex: number;
  date: string;
  accuracy: number;
  gameId: string;
}

export interface TimeEvolutionPoint {
  matchIndex: number;
  date: string;
  durationSeconds: number;
  gameId: string;
}
