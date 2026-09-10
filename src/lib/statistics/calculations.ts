import { GameResult } from '@/types/game';
import {
  AccuracyEvolutionPoint,
  GameStatsSummary,
  ScoreEvolutionPoint,
  TimeEvolutionPoint,
} from '@/types/statistics';

/**
 * Calcula o resumo consolidado de estatísticas a partir do histórico de partidas.
 * Permite filtrar opcionalmente por gameId (ex: 'memoria').
 */
export function calculateOverallStats(
  history: GameResult[],
  filterGameId?: string
): GameStatsSummary {
  const filtered = filterGameId
    ? history.filter((r) => r.gameId === filterGameId)
    : history;

  if (filtered.length === 0) {
    return {
      totalGames: 0,
      completedGames: 0,
      bestScore: 0,
      avgScore: 0,
      bestTime: 0,
      avgAccuracy: 0,
      bestStreak: 0,
      totalMatches: 0,
      totalErrors: 0,
    };
  }

  let totalScore = 0;
  let bestScore = 0;
  let bestTime = Number.MAX_SAFE_INTEGER;
  let totalAccuracy = 0;
  let bestStreak = 0;
  let totalMatches = 0;
  let totalErrors = 0;

  for (const item of filtered) {
    totalScore += item.score;
    if (item.score > bestScore) {
      bestScore = item.score;
    }
    if (item.durationSeconds > 0 && item.durationSeconds < bestTime) {
      bestTime = item.durationSeconds;
    }
    totalAccuracy += item.accuracy;

    const metrics = item.metrics as {
      bestStreak?: number;
      matches?: number;
      errors?: number;
    } | undefined;

    if (metrics) {
      if (typeof metrics.bestStreak === 'number' && metrics.bestStreak > bestStreak) {
        bestStreak = metrics.bestStreak;
      }
      if (typeof metrics.matches === 'number') {
        totalMatches += metrics.matches;
      }
      if (typeof metrics.errors === 'number') {
        totalErrors += metrics.errors;
      }
    }
  }

  const count = filtered.length;

  return {
    totalGames: count,
    completedGames: count,
    bestScore,
    avgScore: Math.round(totalScore / count),
    bestTime: bestTime === Number.MAX_SAFE_INTEGER ? 0 : bestTime,
    avgAccuracy: Math.round(totalAccuracy / count),
    bestStreak,
    totalMatches,
    totalErrors,
  };
}

/**
 * Formata pontos temporais para o gráfico de evolução da pontuação.
 * Ordena do mais antigo para o mais recente para exibição cronológica.
 */
export function calculateScoreEvolution(
  history: GameResult[],
  filterGameId?: string
): ScoreEvolutionPoint[] {
  const filtered = filterGameId
    ? history.filter((r) => r.gameId === filterGameId)
    : history;

  // Reverte para ordem cronológica (partida 1, 2, 3...)
  const chronological = [...filtered].reverse();

  return chronological.map((item, index) => ({
    matchIndex: index + 1,
    date: new Date(item.playedAt).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
    }),
    score: item.score,
    gameId: item.gameId,
  }));
}

/**
 * Formata pontos temporais para o gráfico de evolução da precisão.
 */
export function calculateAccuracyEvolution(
  history: GameResult[],
  filterGameId?: string
): AccuracyEvolutionPoint[] {
  const filtered = filterGameId
    ? history.filter((r) => r.gameId === filterGameId)
    : history;

  const chronological = [...filtered].reverse();

  return chronological.map((item, index) => ({
    matchIndex: index + 1,
    date: new Date(item.playedAt).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
    }),
    accuracy: item.accuracy,
    gameId: item.gameId,
  }));
}

/**
 * Formata pontos temporais para o gráfico de evolução do tempo.
 */
export function calculateTimeEvolution(
  history: GameResult[],
  filterGameId?: string
): TimeEvolutionPoint[] {
  const filtered = filterGameId
    ? history.filter((r) => r.gameId === filterGameId)
    : history;

  const chronological = [...filtered].reverse();

  return chronological.map((item, index) => ({
    matchIndex: index + 1,
    date: new Date(item.playedAt).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
    }),
    durationSeconds: item.durationSeconds,
    gameId: item.gameId,
  }));
}

/**
 * Formata segundos no padrão MM:SS legível.
 */
export function formatTimeMMSS(seconds: number): string {
  if (!seconds || seconds <= 0) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}
