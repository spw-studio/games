import { GAME_CONFIG } from '@/config/game-config';
import { GameDifficulty } from '@/types/game';
import { QuizMetrics, QuizScoringBreakdown } from '@/types/quiz';

/**
 * Motor matemático do Quiz de Produtos.
 * Totalmente desacoplado da interface (mesmo padrão de `lib/scoring/*`).
 */

export interface QuizScoreInput {
  correctAnswers: number;
  incorrectAnswers: number;
  timedOutAnswers: number;
  bestStreak: number;
  elapsedSeconds: number;
  answeredQuestions: number;
  difficulty: GameDifficulty;
}

const QUIZ = GAME_CONFIG.QUIZ;

export function calculateQuizScore(input: QuizScoreInput): QuizScoringBreakdown {
  const {
    correctAnswers,
    incorrectAnswers,
    timedOutAnswers,
    bestStreak,
    elapsedSeconds,
    answeredQuestions,
    difficulty,
  } = input;

  // 1. Pontos por acerto
  const correctPoints = correctAnswers * QUIZ.POINTS_PER_CORRECT;

  // 2. Bônus por sequência (a cada N acertos consecutivos)
  const streakBonus =
    Math.floor(bestStreak / QUIZ.STREAK_BONUS_EVERY) * QUIZ.STREAK_BONUS_POINTS;

  // 3. Bônus de rapidez — proporcional ao tempo economizado por pergunta
  const avgSeconds =
    answeredQuestions > 0 ? elapsedSeconds / answeredQuestions : 0;
  const timeBonus =
    correctAnswers > 0 && avgSeconds > 0 && avgSeconds < QUIZ.TARGET_SECONDS_PER_QUESTION
      ? Math.round((QUIZ.TARGET_SECONDS_PER_QUESTION - avgSeconds) * QUIZ.SPEED_BONUS_FACTOR)
      : 0;

  // 4. Penalidade por erro ou tempo esgotado
  const incorrectPenalty =
    (incorrectAnswers + timedOutAnswers) * QUIZ.PENALTY_PER_MISS;

  // 5. Multiplicador de dificuldade (mesma tabela usada pelos outros jogos)
  const difficultyMultiplier = GAME_CONFIG.SCORING.DIFFICULTY_MULTIPLIERS[difficulty] || 1;

  const finalScore = Math.max(
    0,
    Math.round(
      (correctPoints + streakBonus + timeBonus - incorrectPenalty) * difficultyMultiplier
    )
  );

  return {
    correctPoints,
    streakBonus,
    timeBonus,
    incorrectPenalty,
    difficultyMultiplier,
    finalScore,
  };
}

/** Precisão percentual (0 a 100) sobre o total de perguntas da partida. */
export function calculateQuizAccuracy(
  correctAnswers: number,
  totalQuestions: number
): number {
  if (totalQuestions <= 0) return 0;
  return Math.min(100, Math.max(0, Math.round((correctAnswers / totalQuestions) * 100)));
}

export interface QuizMetricsInput {
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  timedOutAnswers: number;
  bestStreak: number;
  durationSeconds: number;
}

/** Consolida as métricas salvas em `localStorage` pelo `useGameStorage`. */
export function buildQuizMetrics(input: QuizMetricsInput): QuizMetrics {
  const answeredQuestions =
    input.correctAnswers + input.incorrectAnswers + input.timedOutAnswers;

  return {
    totalQuestions: input.totalQuestions,
    answeredQuestions,
    correctAnswers: input.correctAnswers,
    incorrectAnswers: input.incorrectAnswers,
    timedOutAnswers: input.timedOutAnswers,
    accuracy: calculateQuizAccuracy(input.correctAnswers, input.totalQuestions),
    bestStreak: input.bestStreak,
    durationSeconds: input.durationSeconds,
    avgSecondsPerQuestion:
      answeredQuestions > 0 ? Math.round(input.durationSeconds / answeredQuestions) : 0,
    matches: input.correctAnswers,
    errors: input.incorrectAnswers + input.timedOutAnswers,
  };
}
