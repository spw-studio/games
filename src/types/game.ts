export type GameDifficulty = 'facil' | 'medio' | 'dificil';

export interface GameDefinition {
  id: string;
  nome: string;
  descricao: string;
  rota: string;
  ativo: boolean;
  dificuldadePadrao?: GameDifficulty;
  icone: string;
  categoria?: string;
}

export type MemoryCardType = 'image' | 'description';

export interface MemoryCard {
  id: string;          // ID único da carta no tabuleiro (ex: "camarao-mucuripe-image-1")
  pairId: string;      // ID do par (ex: "camarao-mucuripe")
  productId: string;   // ID do produto original
  type: MemoryCardType;
  isFlipped: boolean;
  isMatched: boolean;
}

export interface MemoryMetrics {
  totalPairs: number;
  totalCards: number;
  matches: number;
  errors: number;
  moves: number;
  bestStreak: number;
  avgTimePerMatch: number;
  efficiencyBonus: number;
  speedBonus: number;
  [key: string]: unknown;
}

export interface GameResult<TMetrics = unknown> {
  id: string;
  gameId: string;
  playerId: string;
  score: number;
  accuracy: number;
  durationSeconds: number;
  difficulty: GameDifficulty;
  category: string; // "todas" ou id específico
  playedAt: string; // ISO string
  metrics: TMetrics;
}

export interface MemoryScoringBreakdown {
  baseScore: number;
  difficultyMultiplier: number;
  streakBonus: number;
  speedBonus: number;
  errorPenalty: number;
  efficiencyBonus: number;
  finalScore: number;
}

export interface LocalRecord {
  gameId: string;
  bestScore: number;
  bestTime: number;
  highestAccuracy: number;
  bestStreak: number;
  totalGames: number;
  updatedAt: string;
}
