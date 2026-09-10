import { GameDifficulty } from '@/types/game';

export const GAME_CONFIG = {
  DEFAULT_DIFFICULTY: 'medio' as GameDifficulty,
  DEFAULT_PRODUCT_COUNT: 6,
  AVAILABLE_PAIR_COUNTS: [4, 6, 8, 10, 12],
  MAX_HISTORY: 100,
  MEMORY_CARD_DELAY: 800, // milissegundos para esconder cartas após erro
  ANIMATION_DURATION: 300, // ms da animação flip
  SCORING: {
    BASE_MATCH_POINTS: 100,
    ERROR_PENALTY: 50,
    DIFFICULTY_MULTIPLIERS: {
      facil: 1.0,
      medio: 1.5,
      dificil: 2.0,
    } as Record<GameDifficulty, number>,
    STREAK_BONUSES: [
      { minStreak: 5, bonus: 100 },
      { minStreak: 4, bonus: 75 },
      { minStreak: 3, bonus: 50 },
      { minStreak: 2, bonus: 25 },
      { minStreak: 1, bonus: 0 },
    ],
    // Parâmetro de velocidade: tempo de referência por par (segundos)
    TARGET_SECONDS_PER_PAIR: 8,
  },
} as const;
