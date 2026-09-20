import { GameDifficulty } from '@/types/game';
import { DrinkAssemblyScoringBreakdown } from '@/types/grouping';

export interface DrinkAssemblyScoreInput {
  isPerfectMatch: boolean;
  correctCount: number;
  incorrectCount: number;
  missingCount: number;
  totalRequired: number;
  streak: number;
  elapsedSeconds: number;
  difficulty: GameDifficulty;
}

const DIFFICULTY_MULTIPLIERS: Record<GameDifficulty, number> = {
  facil: 1.0,
  medio: 1.5,
  dificil: 2.0,
};

const BASE_PERFECT_MATCH_POINTS = 150;
const POINTS_PER_CORRECT_INGREDIENT = 30;
const PENALTY_INCORRECT_INGREDIENT = 25;
const PENALTY_MISSING_INGREDIENT = 20;
const TARGET_SECONDS_PER_DRINK = 12;

/**
 * Motor Matemático de Pontuação para a montagem de drinks.
 * Totalmente desacoplado da interface gráfica.
 */
export function calculateDrinkAssemblyScore(
  input: DrinkAssemblyScoreInput
): DrinkAssemblyScoringBreakdown {
  const {
    isPerfectMatch,
    correctCount,
    incorrectCount,
    missingCount,
    streak,
    elapsedSeconds,
    difficulty,
  } = input;

  // 1. Pontuação base por acerto 100% perfeito
  const baseScore = isPerfectMatch ? BASE_PERFECT_MATCH_POINTS : 0;

  // 2. Pontos pelos ingredientes corretos incluídos
  const correctIngredientsScore = correctCount * POINTS_PER_CORRECT_INGREDIENT;

  // 3. Penalidades por ingredientes incorretos selecionados
  const incorrectPenalty = incorrectCount * PENALTY_INCORRECT_INGREDIENT;

  // 4. Penalidades por ingredientes que faltaram
  const missingPenalty = missingCount * PENALTY_MISSING_INGREDIENT;

  // 5. Bônus por sequência de acertos (streak)
  let streakBonus = 0;
  if (isPerfectMatch) {
    if (streak >= 5) {
      streakBonus = 100 + (streak - 5) * 25;
    } else if (streak === 4) {
      streakBonus = 75;
    } else if (streak === 3) {
      streakBonus = 50;
    } else if (streak === 2) {
      streakBonus = 25;
    }
  }

  // 6. Bônus de velocidade (apenas se acertou perfeitamente e dentro da meta)
  let speedBonus = 0;
  if (isPerfectMatch && elapsedSeconds > 0 && elapsedSeconds < TARGET_SECONDS_PER_DRINK) {
    const timeSaved = TARGET_SECONDS_PER_DRINK - elapsedSeconds;
    speedBonus = Math.round(timeSaved * 6);
  }

  // 7. Multiplicador de dificuldade
  const difficultyMultiplier = DIFFICULTY_MULTIPLIERS[difficulty] || 1.0;

  // 8. Cálculo final com aplicação do multiplicador
  const preScore =
    baseScore +
    correctIngredientsScore +
    streakBonus +
    speedBonus -
    incorrectPenalty -
    missingPenalty;

  const finalScore = Math.max(0, Math.round(preScore * difficultyMultiplier));

  return {
    baseScore,
    correctIngredientsScore,
    incorrectPenalty,
    missingPenalty,
    streakBonus,
    speedBonus,
    difficultyMultiplier,
    finalScore,
  };
}

/**
 * Calcula a precisão percentual (0 a 100).
 */
export function calculateDrinkAccuracy(correct: number, total: number): number {
  if (total <= 0) return 100;
  return Math.min(100, Math.max(0, Math.round((correct / total) * 100)));
}
