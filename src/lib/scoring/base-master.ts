import { GAME_CONFIG } from '@/config/game-config';
import {
  BaseMasterAnswerRecord,
  BaseMasterMetrics,
  BaseMasterMode,
  BaseMasterScoringBreakdown,
} from '@/types/base-master';
import { GameDifficulty } from '@/types/game';

/**
 * Motor matemático do Base Master — desacoplado da interface.
 * Pontuação base, bônus de combo (tabela de streak) e multiplicador de
 * dificuldade são os MESMOS tokens compartilhados usados pelos outros jogos
 * (`GAME_CONFIG.SCORING`), evitando um sistema de pontos paralelo.
 */

const BASE_MASTER = GAME_CONFIG.BASE_MASTER;
const SCORING = GAME_CONFIG.SCORING;

/** Bônus de combo — reaproveita a tabela compartilhada `STREAK_BONUSES`. */
export function getComboBonus(comboLevel: number): number {
  if (comboLevel <= 0) return 0;
  const tier = SCORING.STREAK_BONUSES.find((entry) => comboLevel >= entry.minStreak);
  return tier ? tier.bonus : 0;
}

/** Bônus de rapidez do Desafio: proporcional ao tempo restante da pergunta. */
export function computeSpeedBonus(secondsLeft: number, secondsPerQuestion: number): number {
  if (secondsPerQuestion <= 0 || secondsLeft <= 0) return 0;
  const ratio = Math.min(1, secondsLeft / secondsPerQuestion);
  return Math.round(ratio * BASE_MASTER.MAX_SPEED_BONUS);
}

export interface BaseMasterAnswerScoreInput {
  isCorrect: boolean;
  /** Combo após esta resposta (0 quando errou ou estourou o tempo). */
  comboAfter: number;
  /** Segundos restantes (apenas no Desafio). */
  secondsLeft?: number;
  secondsPerQuestion?: number;
}

export interface BaseMasterAnswerScore {
  basePoints: number;
  comboBonus: number;
  speedBonus: number;
  pointsEarned: number;
}

/**
 * Pontuação BRUTA de uma resposta (sem multiplicador de dificuldade).
 * O multiplicador é aplicado sobre o total da partida, então o HUD e a tela
 * final sempre exibem o mesmo número.
 */
export function scoreBaseMasterAnswer(
  input: BaseMasterAnswerScoreInput
): BaseMasterAnswerScore {
  if (!input.isCorrect) {
    return { basePoints: 0, comboBonus: 0, speedBonus: 0, pointsEarned: 0 };
  }

  const basePoints = SCORING.BASE_MATCH_POINTS;
  const comboBonus = getComboBonus(input.comboAfter);
  const speedBonus = computeSpeedBonus(input.secondsLeft ?? 0, input.secondsPerQuestion ?? 0);

  return {
    basePoints,
    comboBonus,
    speedBonus,
    pointsEarned: basePoints + comboBonus + speedBonus,
  };
}

/** Multiplicador de dificuldade compartilhado com os demais jogos. */
export function getDifficultyMultiplier(difficulty: GameDifficulty): number {
  return SCORING.DIFFICULTY_MULTIPLIERS[difficulty] || 1;
}

/** Pontuação exibida (bruta × dificuldade) — usada no HUD e no resultado. */
export function calculateBaseMasterScore(rawPoints: number, difficulty: GameDifficulty): number {
  return Math.max(0, Math.round(rawPoints * getDifficultyMultiplier(difficulty)));
}

/** Precisão (%) da partida. */
export function calculateBaseMasterAccuracy(
  correctAnswers: number,
  totalQuestions: number
): number {
  if (totalQuestions <= 0) return 0;
  return Math.round((correctAnswers / totalQuestions) * 100);
}

export interface BaseMasterScoreInput {
  answers: BaseMasterAnswerRecord[];
  difficulty: GameDifficulty;
}

/** Consolida a pontuação da partida a partir dos registros de resposta. */
export function calculateBaseMasterBreakdown({
  answers,
  difficulty,
}: BaseMasterScoreInput): BaseMasterScoringBreakdown {
  const basePoints = answers.reduce((total, answer) => total + answer.basePoints, 0);
  const comboBonus = answers.reduce((total, answer) => total + answer.comboBonus, 0);
  const speedBonus = answers.reduce((total, answer) => total + answer.speedBonus, 0);
  const difficultyMultiplier = getDifficultyMultiplier(difficulty);

  return {
    basePoints,
    comboBonus,
    speedBonus,
    difficultyMultiplier,
    finalScore: Math.max(
      0,
      Math.round((basePoints + comboBonus + speedBonus) * difficultyMultiplier)
    ),
  };
}

export interface BaseMasterAnswerTally {
  correctAnswers: number;
  incorrectAnswers: number;
  timedOutAnswers: number;
}

/** Contagem de acertos/erros/timeouts a partir dos registros de resposta. */
export function countBaseMasterAnswers(
  answers: readonly BaseMasterAnswerRecord[]
): BaseMasterAnswerTally {
  return {
    correctAnswers: answers.filter((answer) => answer.isCorrect).length,
    incorrectAnswers: answers.filter((answer) => !answer.isCorrect && !answer.timedOut).length,
    timedOutAnswers: answers.filter((answer) => answer.timedOut).length,
  };
}

export interface BaseMasterMetricsInput {
  mode: BaseMasterMode;
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  timedOutAnswers: number;
  bestCombo: number;
  score: number;
  durationSeconds: number;
}

/** Métricas persistidas em `GameResult<BaseMasterMetrics>`. */
export function buildBaseMasterMetrics(input: BaseMasterMetricsInput): BaseMasterMetrics {
  const answeredQuestions =
    input.correctAnswers + input.incorrectAnswers + input.timedOutAnswers;

  return {
    mode: input.mode,
    totalQuestions: input.totalQuestions,
    answeredQuestions,
    correctAnswers: input.correctAnswers,
    incorrectAnswers: input.incorrectAnswers,
    timedOutAnswers: input.timedOutAnswers,
    accuracy: calculateBaseMasterAccuracy(input.correctAnswers, input.totalQuestions),
    bestCombo: input.bestCombo,
    score: input.score,
    durationSeconds: input.durationSeconds,
    avgSecondsPerAnswer:
      answeredQuestions > 0
        ? Math.round((input.durationSeconds / answeredQuestions) * 10) / 10
        : 0,
  };
}
