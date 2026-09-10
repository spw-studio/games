import { GameResult, LocalRecord } from '@/types/game';
import { STORAGE_KEYS } from './keys';
import { safeGetItem, safeSetItem } from './storage';

export type RecordsMap = Record<string, LocalRecord>;

export function getAllRecords(): RecordsMap {
  return safeGetItem<RecordsMap>(STORAGE_KEYS.LOCAL_RECORDS, {});
}

export function getRecordForGame(gameId: string): LocalRecord | null {
  const records = getAllRecords();
  return records[gameId] || null;
}

/**
 * Avalia se o resultado supera recordes anteriores e salva se necessário.
 * Retorna se houve novo recorde de pontuação.
 */
export function checkAndUpdateRecord(result: GameResult): {
  isNewBestScore: boolean;
  isNewBestTime: boolean;
  isNewBestStreak: boolean;
} {
  const records = getAllRecords();
  const currentRecord = records[result.gameId];

  const streak = typeof (result.metrics as { bestStreak?: number })?.bestStreak === 'number'
    ? (result.metrics as { bestStreak?: number }).bestStreak!
    : 0;

  if (!currentRecord) {
    const newRecord: LocalRecord = {
      gameId: result.gameId,
      bestScore: result.score,
      bestTime: result.durationSeconds,
      highestAccuracy: result.accuracy,
      bestStreak: streak,
      totalGames: 1,
      updatedAt: new Date().toISOString(),
    };
    records[result.gameId] = newRecord;
    safeSetItem(STORAGE_KEYS.LOCAL_RECORDS, records);
    return {
      isNewBestScore: true,
      isNewBestTime: true,
      isNewBestStreak: true,
    };
  }

  const isNewBestScore = result.score > currentRecord.bestScore;
  const isNewBestTime = result.durationSeconds > 0 && (currentRecord.bestTime <= 0 || result.durationSeconds < currentRecord.bestTime);
  const isNewBestStreak = streak > currentRecord.bestStreak;

  const updatedRecord: LocalRecord = {
    ...currentRecord,
    bestScore: Math.max(currentRecord.bestScore, result.score),
    bestTime: currentRecord.bestTime > 0
      ? (result.durationSeconds > 0 ? Math.min(currentRecord.bestTime, result.durationSeconds) : currentRecord.bestTime)
      : result.durationSeconds,
    highestAccuracy: Math.max(currentRecord.highestAccuracy, result.accuracy),
    bestStreak: Math.max(currentRecord.bestStreak, streak),
    totalGames: currentRecord.totalGames + 1,
    updatedAt: new Date().toISOString(),
  };

  records[result.gameId] = updatedRecord;
  safeSetItem(STORAGE_KEYS.LOCAL_RECORDS, records);

  return {
    isNewBestScore,
    isNewBestTime,
    isNewBestStreak,
  };
}
