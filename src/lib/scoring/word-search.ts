import { GAME_CONFIG } from '@/config/game-config';
import { GameDifficulty } from '@/types/game';
import { WordSearchMetrics, WordSearchScoringBreakdown } from '@/types/word-search';

export interface WordSearchScoreInput {
  totalWords: number;
  foundWords: number;
  wrongAttempts: number;
  hintsUsed: number;
  elapsedSeconds: number;
  difficulty: GameDifficulty;
  bestStreak: number;
}

/**
 * Scoring engine for the Caça-Palavras game.
 * Isolated from UI — pure functions.
 */
export function calculateWordSearchScore(input: WordSearchScoreInput): WordSearchScoringBreakdown {
  const { totalWords, foundWords, wrongAttempts, hintsUsed, elapsedSeconds, difficulty, bestStreak } = input;

  // 1. Base: 150 per word found
  const baseScore = foundWords * 150;

  // 2. Difficulty multiplier
  const difficultyMultiplier = GAME_CONFIG.SCORING.DIFFICULTY_MULTIPLIERS[difficulty] || 1.0;

  // 3. Speed bonus: target 30s per word
  const targetSeconds = totalWords * 30;
  let speedBonus = 0;
  if (elapsedSeconds > 0 && elapsedSeconds < targetSeconds) {
    const saved = targetSeconds - elapsedSeconds;
    speedBonus = Math.round(saved * 5);
  }

  // 4. Streak bonus
  let streakBonus = 0;
  if (bestStreak >= 5) streakBonus = 200;
  else if (bestStreak === 4) streakBonus = 120;
  else if (bestStreak === 3) streakBonus = 75;
  else if (bestStreak === 2) streakBonus = 40;

  // 5. Penalties
  const wrongAttemptPenalty = wrongAttempts * 30;
  const hintPenalty = hintsUsed * 80;

  const preMultiplierScore = baseScore + speedBonus + streakBonus - wrongAttemptPenalty - hintPenalty;
  const finalScore = Math.max(0, Math.round(preMultiplierScore * difficultyMultiplier));

  return {
    baseScore,
    speedBonus,
    streakBonus,
    wrongAttemptPenalty,
    hintPenalty,
    difficultyMultiplier,
    finalScore,
  };
}

export function calculateWordSearchAccuracy(foundWords: number, totalWords: number, wrongAttempts: number): number {
  const totalAttempts = foundWords + wrongAttempts;
  if (totalAttempts <= 0) return 100;
  return Math.min(100, Math.round((foundWords / totalAttempts) * 100));
}

export function buildWordSearchMetrics(
  totalWords: number,
  foundWords: number,
  wrongAttempts: number,
  hintsUsed: number,
  bestStreak: number,
  durationSeconds: number
): WordSearchMetrics {
  return {
    totalWords,
    foundWords,
    missedWords: totalWords - foundWords,
    wrongAttempts,
    hintsUsed,
    bestStreak,
    durationSeconds,
    matches: foundWords,
    errors: wrongAttempts,
  };
}
