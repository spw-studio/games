'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { getProductsByCategory } from '@/lib/cardapio/queries';
import { buildWordSearchGrid, checkSelectionForWord, getCellsOnLine, normalizeForGrid } from '@/lib/games/word-search-engine';
import {
  buildWordSearchMetrics,
  calculateWordSearchAccuracy,
  calculateWordSearchScore,
} from '@/lib/scoring/word-search';
import { useGameStorage } from './useGameStorage';
import { usePlayer } from './usePlayer';
import { GameDifficulty, GameResult } from '@/types/game';
import { WordSearchConfigState, WordSearchGrid } from '@/types/word-search';

type GamePhase = 'config' | 'playing' | 'result';

interface FoundCells {
  cells: Array<{ row: number; col: number }>;
  wordIndex: number;
  color: string;
}

const HIGHLIGHT_COLORS = [
  'bg-emerald-300/80',
  'bg-sky-300/80',
  'bg-amber-300/80',
  'bg-rose-300/80',
  'bg-violet-300/80',
  'bg-teal-300/80',
  'bg-orange-300/80',
  'bg-pink-300/80',
  'bg-lime-300/80',
  'bg-cyan-300/80',
];

const GRID_SIZE: Record<GameDifficulty, number> = {
  facil: 12,
  medio: 15,
  dificil: 18,
};

const DISTRACTOR_COUNT: Record<GameDifficulty, number> = {
  facil: 0,
  medio: 2,
  dificil: 4,
};

const ALL_POSSIBLE_DISTRACTORS = [
  'ABSINTO', 'COINTREAU', 'ANGOSTURA', 'MENTA', 'CURAÇAO',
  'CHAMPANHE', 'VINHO', 'CERVEJA', 'UÍSQUE', 'BRANDY',
];

export function useWordSearchGame() {
  const { player } = usePlayer();
  const { recordResult } = useGameStorage();

  const [phase, setPhase] = useState<GamePhase>('config');
  const [config, setConfig] = useState<WordSearchConfigState>({
    difficulty: 'medio',
    category: 'drinks',
  });

  const [currentDrinkName, setCurrentDrinkName] = useState<string>('');
  const [currentDrinkDesc, setCurrentDrinkDesc] = useState<string>('');
  const [currentDrinkImage, setCurrentDrinkImage] = useState<string>('');
  const [targetWords, setTargetWords] = useState<string[]>([]);

  const [grid, setGrid] = useState<WordSearchGrid | null>(null);

  // Selection via drag
  const [selectingFrom, setSelectingFrom] = useState<{ row: number; col: number } | null>(null);
  const [hoverCell, setHoverCell] = useState<{ row: number; col: number } | null>(null);
  const [isMouseDown, setIsMouseDown] = useState(false);

  const [foundCells, setFoundCells] = useState<FoundCells[]>([]);
  const [foundWordIndexes, setFoundWordIndexes] = useState<Set<number>>(new Set());

  const [score, setScore] = useState(0);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [wrongFlash, setWrongFlash] = useState(false);

  // Timer
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const formattedTime = `${String(Math.floor(elapsedSeconds / 60)).padStart(2, '0')}:${String(elapsedSeconds % 60).padStart(2, '0')}`;

  // ---- Finish game ----
  const finishGame = useCallback(
    (
      finalGrid: WordSearchGrid,
      finalFoundIndexes: Set<number>,
      finalScore: number,
      finalWrong: number,
      finalHints: number,
      finalBestStreak: number,
      finalElapsed: number
    ) => {
      stopTimer();

      const totalWords = finalGrid.totalWords;
      const foundWords = finalFoundIndexes.size;
      const accuracy = calculateWordSearchAccuracy(foundWords, totalWords, finalWrong);
      const metrics = buildWordSearchMetrics(totalWords, foundWords, finalWrong, finalHints, finalBestStreak, finalElapsed);

      const result: GameResult = {
        id: crypto.randomUUID(),
        gameId: 'caca-palavras',
        playerId: player?.id || 'unknown',
        score: finalScore,
        accuracy,
        durationSeconds: finalElapsed,
        difficulty: config.difficulty,
        category: config.category,
        playedAt: new Date().toISOString(),
        metrics,
      };

      recordResult(result);
      setPhase('result');
    },
    [stopTimer, config, player, recordResult]
  );

  // ---- Check if all ingredient words are found ----
  const checkAllFound = useCallback(
    (
      newFoundIndexes: Set<number>,
      g: WordSearchGrid,
      words: string[],
      newScore: number,
      newWrong: number,
      newHints: number,
      newBestStreak: number
    ) => {
      const targetWordIndexes = g.placedWords
        .map((pw, i) => ({ pw, i }))
        .filter(({ pw }) =>
          words.some((tw) => normalizeForGrid(tw) === pw.normalized)
        )
        .map(({ i }) => i);

      const allTargetFound = targetWordIndexes.length > 0 && targetWordIndexes.every((i) => newFoundIndexes.has(i));

      if (allTargetFound) {
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
        finishGame(g, newFoundIndexes, newScore, newWrong, newHints, newBestStreak, elapsed);
      }
    },
    [finishGame]
  );

  // ---- Handle selection end ----
  const handleSelectionEnd = useCallback(
    (fromCell: { row: number; col: number }, toCell: { row: number; col: number }) => {
      if (!grid) return;

      const lineCells = getCellsOnLine(fromCell.row, fromCell.col, toCell.row, toCell.col, grid.size);
      if (lineCells.length < 2) {
        setSelectingFrom(null);
        return;
      }

      const wordIndex = checkSelectionForWord(lineCells, grid);

      if (wordIndex >= 0 && !foundWordIndexes.has(wordIndex)) {
        const colorIndex = foundWordIndexes.size % HIGHLIGHT_COLORS.length;
        const newFoundCells: FoundCells = { cells: lineCells, wordIndex, color: HIGHLIGHT_COLORS[colorIndex] };

        const newFoundIndexes = new Set(foundWordIndexes);
        newFoundIndexes.add(wordIndex);

        const updatedGrid: WordSearchGrid = {
          ...grid,
          placedWords: grid.placedWords.map((pw, i) => (i === wordIndex ? { ...pw, found: true } : pw)),
        };

        const newStreak = streak + 1;
        const newBestStreak = Math.max(bestStreak, newStreak);
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);

        const scoringResult = calculateWordSearchScore({
          totalWords: grid.totalWords,
          foundWords: newFoundIndexes.size,
          wrongAttempts,
          hintsUsed,
          elapsedSeconds: elapsed,
          difficulty: config.difficulty,
          bestStreak: newBestStreak,
        });

        const newScore = scoringResult.finalScore;

        setFoundCells((prev) => [...prev, newFoundCells]);
        setFoundWordIndexes(newFoundIndexes);
        setGrid(updatedGrid);
        setStreak(newStreak);
        setBestStreak(newBestStreak);
        setScore(newScore);
        setElapsedSeconds(elapsed);

        checkAllFound(newFoundIndexes, updatedGrid, targetWords, newScore, wrongAttempts, hintsUsed, newBestStreak);
      } else if (wordIndex < 0) {
        setWrongAttempts((prev) => prev + 1);
        setStreak(0);
        setWrongFlash(true);
        setTimeout(() => setWrongFlash(false), 600);
      }

      setSelectingFrom(null);
      setHoverCell(null);
    },
    [grid, foundWordIndexes, streak, bestStreak, wrongAttempts, hintsUsed, config.difficulty, checkAllFound, targetWords]
  );

  // Mouse/touch handlers
  const handleCellMouseDown = useCallback((row: number, col: number) => {
    setSelectingFrom({ row, col });
    setIsMouseDown(true);
    setHoverCell({ row, col });
  }, []);

  const handleCellMouseEnter = useCallback(
    (row: number, col: number) => {
      if (isMouseDown) setHoverCell({ row, col });
    },
    [isMouseDown]
  );

  const handleCellMouseUp = useCallback(
    (row: number, col: number) => {
      setIsMouseDown(false);
      if (selectingFrom) handleSelectionEnd(selectingFrom, { row, col });
    },
    [selectingFrom, handleSelectionEnd]
  );

  const handleGridMouseLeave = useCallback(() => {
    if (isMouseDown && selectingFrom && hoverCell) {
      handleSelectionEnd(selectingFrom, hoverCell);
    }
    setIsMouseDown(false);
  }, [isMouseDown, selectingFrom, hoverCell, handleSelectionEnd]);

  // ---- Start game ----
  const startGame = useCallback(
    (cfg: WordSearchConfigState) => {
      stopTimer();
      setConfig(cfg);

      const drinks = getProductsByCategory('drinks').filter(
        (p) => p.ingredientes && p.ingredientes.length >= 3
      );
      if (drinks.length === 0) return;

      const drink = drinks[Math.floor(Math.random() * drinks.length)];
      const ingredients = drink.ingredientes || [];

      const distractorCount = DISTRACTOR_COUNT[cfg.difficulty];
      const shuffledDistractors = ALL_POSSIBLE_DISTRACTORS
        .filter((d) => !ingredients.some((ing) => normalizeForGrid(ing) === normalizeForGrid(d)))
        .sort(() => Math.random() - 0.5)
        .slice(0, distractorCount);

      const allWords = [...ingredients, ...shuffledDistractors];
      const size = GRID_SIZE[cfg.difficulty];
      const newGrid = buildWordSearchGrid(allWords, size);

      setCurrentDrinkName(drink.nome);
      setCurrentDrinkDesc(drink.descricao || '');
      setCurrentDrinkImage(drink.imagem || '');
      setTargetWords(ingredients);
      setGrid(newGrid);
      setFoundCells([]);
      setFoundWordIndexes(new Set());
      setScore(0);
      setWrongAttempts(0);
      setHintsUsed(0);
      setStreak(0);
      setBestStreak(0);
      setSelectingFrom(null);
      setHoverCell(null);
      setIsMouseDown(false);
      setElapsedSeconds(0);
      setPhase('playing');

      setTimeout(() => {
        startTimeRef.current = Date.now();
        timerRef.current = setInterval(() => {
          setElapsedSeconds(Math.floor((Date.now() - startTimeRef.current) / 1000));
        }, 1000);
      }, 100);
    },
    [stopTimer]
  );

  // ---- Hint ----
  const useHint = useCallback(() => {
    if (!grid) return;

    const directionDeltas: Record<string, { dr: number; dc: number }> = {
      horizontal: { dr: 0, dc: 1 },
      vertical: { dr: 1, dc: 0 },
      'diagonal-down': { dr: 1, dc: 1 },
      'diagonal-up': { dr: -1, dc: 1 },
      'horizontal-rev': { dr: 0, dc: -1 },
      'vertical-rev': { dr: -1, dc: 0 },
      'diagonal-down-rev': { dr: 1, dc: -1 },
      'diagonal-up-rev': { dr: -1, dc: -1 },
    };

    const unFoundTargets = grid.placedWords
      .map((pw, i) => ({ pw, i }))
      .filter(
        ({ pw, i }) =>
          !pw.found &&
          !foundWordIndexes.has(i) &&
          targetWords.some((tw) => normalizeForGrid(tw) === pw.normalized)
      );

    if (unFoundTargets.length === 0) return;

    const { pw, i } = unFoundTargets[0];
    const delta = directionDeltas[pw.direction];

    const cells = Array.from({ length: pw.normalized.length }, (_, idx) => ({
      row: pw.startRow + delta.dr * idx,
      col: pw.startCol + delta.dc * idx,
    }));

    const colorIndex = foundWordIndexes.size % HIGHLIGHT_COLORS.length;
    const newFoundIndexes = new Set(foundWordIndexes);
    newFoundIndexes.add(i);
    const newHints = hintsUsed + 1;

    const updatedGrid: WordSearchGrid = {
      ...grid,
      placedWords: grid.placedWords.map((p, idx) => (idx === i ? { ...p, found: true } : p)),
    };

    const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
    const newScore = Math.max(
      0,
      calculateWordSearchScore({
        totalWords: grid.totalWords,
        foundWords: newFoundIndexes.size,
        wrongAttempts,
        hintsUsed: newHints,
        elapsedSeconds: elapsed,
        difficulty: config.difficulty,
        bestStreak,
      }).finalScore
    );

    setFoundCells((prev) => [...prev, { cells, wordIndex: i, color: HIGHLIGHT_COLORS[colorIndex] }]);
    setFoundWordIndexes(newFoundIndexes);
    setGrid(updatedGrid);
    setHintsUsed(newHints);
    setScore(newScore);
    setStreak(0);

    checkAllFound(newFoundIndexes, updatedGrid, targetWords, newScore, wrongAttempts, newHints, bestStreak);
  }, [grid, foundWordIndexes, targetWords, hintsUsed, wrongAttempts, config.difficulty, bestStreak, checkAllFound]);

  // Current preview cells
  const selectionPreviewCells: Array<{ row: number; col: number }> =
    selectingFrom && hoverCell && grid
      ? getCellsOnLine(selectingFrom.row, selectingFrom.col, hoverCell.row, hoverCell.col, grid.size)
      : [];

  // Cleanup
  useEffect(() => () => stopTimer(), [stopTimer]);

  return {
    phase,
    config,
    currentDrinkName,
    currentDrinkDesc,
    currentDrinkImage,
    targetWords,
    grid,
    foundCells,
    foundWordIndexes,
    selectionPreviewCells,
    score,
    streak,
    wrongAttempts,
    hintsUsed,
    formattedTime,
    elapsedSeconds,
    wrongFlash,
    startGame,
    useHint,
    handleCellMouseDown,
    handleCellMouseEnter,
    handleCellMouseUp,
    handleGridMouseLeave,
    onRestart: () => {
      stopTimer();
      setPhase('config');
    },
    onPlayAgain: (sameConfig?: boolean) => {
      if (sameConfig) startGame(config);
      else {
        stopTimer();
        setPhase('config');
      }
    },
  };
}
