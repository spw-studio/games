import { GAME_CONFIG } from '@/config/game-config';
import { GameDifficulty, MemoryScoringBreakdown } from '@/types/game';

export interface MemoryScoreInput {
  matches: number;
  errors: number;
  moves: number;
  elapsedSeconds: number;
  difficulty: GameDifficulty;
  totalPairs: number;
  bestStreak: number;
}

/**
 * Motor de Pontuação Isolado para o Jogo da Memória.
 * Mantém todas as regras matemáticas de cálculo desacopladas da interface.
 */
export function calculateMemoryScore(input: MemoryScoreInput): MemoryScoringBreakdown {
  const {
    matches,
    errors,
    moves,
    elapsedSeconds,
    difficulty,
    totalPairs,
    bestStreak,
  } = input;

  // 1. Pontos Base: 100 por par encontrado
  const baseScore = matches * GAME_CONFIG.SCORING.BASE_MATCH_POINTS;

  // 2. Multiplicador de Dificuldade
  const difficultyMultiplier = GAME_CONFIG.SCORING.DIFFICULTY_MULTIPLIERS[difficulty] || 1.0;

  // 3. Bônus de Streak: escala baseada no melhor streak atingido
  let streakBonus = 0;
  if (bestStreak >= 5) {
    streakBonus = 100 * (bestStreak - 4) + 150; // valoriza sequências longas
  } else if (bestStreak === 4) {
    streakBonus = 75;
  } else if (bestStreak === 3) {
    streakBonus = 50;
  } else if (bestStreak === 2) {
    streakBonus = 25;
  }

  // 4. Penalidade por Erro: 50 por erro
  const errorPenalty = errors * GAME_CONFIG.SCORING.ERROR_PENALTY;

  // 5. Bônus de Velocidade: compara o tempo com a meta de 8 segundos por par
  const targetSeconds = totalPairs * GAME_CONFIG.SCORING.TARGET_SECONDS_PER_PAIR;
  let speedBonus = 0;
  if (elapsedSeconds > 0 && elapsedSeconds < targetSeconds) {
    const timeSaved = targetSeconds - elapsedSeconds;
    speedBonus = Math.round(timeSaved * 12);
  }

  // 6. Bônus de Eficiência: relação entre pares encontrados e movimentos
  let efficiencyBonus = 0;
  if (moves > 0 && matches > 0) {
    // Proporção ideal: 1 movimento por match (par perfeito)
    const ratio = moves / matches;
    if (ratio <= 1.2) {
      efficiencyBonus = 200; // Quase perfeito
    } else if (ratio <= 1.5) {
      efficiencyBonus = 120;
    } else if (ratio <= 2.0) {
      efficiencyBonus = 50;
    }
  }

  // Cálculo final com aplicação do multiplicador de dificuldade
  const preMultiplierScore = baseScore + streakBonus + speedBonus + efficiencyBonus - errorPenalty;
  const finalScore = Math.max(0, Math.round(preMultiplierScore * difficultyMultiplier));

  return {
    baseScore,
    difficultyMultiplier,
    streakBonus,
    speedBonus,
    errorPenalty,
    efficiencyBonus,
    finalScore,
  };
}

/**
 * Calcula a precisão percentual (0 a 100) com arredondamento seguro.
 * accuracy = matches / (matches + errors) * 100
 */
export function calculateAccuracy(matches: number, errors: number): number {
  const totalAttempts = matches + errors;
  if (totalAttempts <= 0) return 100;
  const raw = (matches / totalAttempts) * 100;
  return Math.round(raw);
}
