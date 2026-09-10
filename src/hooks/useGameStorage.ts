'use client';

import { useCallback, useEffect, useState } from 'react';
import { GameResult, LocalRecord } from '@/types/game';
import {
  clearGameHistory,
  getGameHistory,
  getLastGameResult,
  saveGameResult,
} from '@/lib/storage/history';
import {
  checkAndUpdateRecord,
  getAllRecords,
  getRecordForGame,
} from '@/lib/storage/records';

export function useGameStorage() {
  const [history, setHistory] = useState<GameResult[]>([]);
  const [records, setRecords] = useState<Record<string, LocalRecord>>({});
  const [lastResult, setLastResult] = useState<GameResult | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const reloadData = useCallback(() => {
    setHistory(getGameHistory());
    setRecords(getAllRecords());
    setLastResult(getLastGameResult());
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    reloadData();
  }, [reloadData]);

  const recordResult = useCallback(
    <T>(result: GameResult<T>) => {
      saveGameResult(result as GameResult);
      const recordStatus = checkAndUpdateRecord(result as GameResult);
      reloadData();
      return recordStatus;
    },
    [reloadData]
  );

  const clearAll = useCallback(() => {
    clearGameHistory();
    reloadData();
  }, [reloadData]);

  return {
    history,
    records,
    lastResult,
    isLoaded,
    recordResult,
    clearAll,
    getRecordForGame,
    reloadData,
  };
}
