'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { GameDifficulty, GameResult } from '@/types/game';
import {
  DrinkAssemblyConfigState,
  DrinkAssemblyMetrics,
  DrinkRoundEvaluation,
  Group,
  GroupMember,
} from '@/types/grouping';
import { useGameTimer } from './useGameTimer';
import { useAudio } from '@/components/audio/AudioProvider';
import { useGameStorage } from './useGameStorage';
import { usePlayer } from './usePlayer';
import { Product } from '@/types/cardapio';
import { fetchCatalogProducts } from '@/lib/cardapio/client';
import {
  DRINK_CATEGORY_ID,
  buildDrinkGroups,
  getAllDistinctIngredients,
} from '@/lib/cardapio/pure';
import {
  evaluateDrinkSelection,
  generateDrinkRound,
  selectMatchDrinks,
  DrinkRoundData,
} from '@/lib/games/drinkAssembly';
import {
  calculateDrinkAccuracy,
  calculateDrinkAssemblyScore,
} from '@/lib/scoring/drinkAssembly';

export function useDrinkAssembly() {
  const { player } = usePlayer();
  const { recordResult } = useGameStorage();
  const timer = useGameTimer();
  const { play } = useAudio();

  // Estados de tela e configuração
  const [gameState, setGameState] = useState<'config' | 'playing' | 'finished'>('config');
  const [config, setConfig] = useState<DrinkAssemblyConfigState>({
    drinkCount: 5,
    difficulty: 'medio',
    category: DRINK_CATEGORY_ID,
  });

  // Catálogo carregado via API (escopo de tenant aplicado no servidor)
  const [catalogProducts, setCatalogProducts] = useState<Product[] | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetchCatalogProducts()
      .then((products) => {
        if (!cancelled) setCatalogProducts(products);
      })
      .catch(() => {
        // Em caso de erro, o estado permanece "pronto" com lista vazia —
        // a tela de configuração exibe o aviso de "nenhum drink disponível".
        if (!cancelled) setCatalogProducts([]);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Catálogo completo de drinks e ingredientes
  const allEligibleDrinks = useMemo(
    () => (catalogProducts ? buildDrinkGroups(catalogProducts) : []),
    [catalogProducts]
  );
  const allIngredients = useMemo(
    () => getAllDistinctIngredients(allEligibleDrinks),
    [allEligibleDrinks]
  );

  // Playlist de drinks da partida atual
  const [matchDrinks, setMatchDrinks] = useState<Group[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentRound, setCurrentRound] = useState<DrinkRoundData | null>(null);

  // Seleção e confirmação do drink atual
  const [selectedIngredientIds, setSelectedIngredientIds] = useState<string[]>([]);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [evaluation, setEvaluation] = useState<DrinkRoundEvaluation | null>(null);

  // Timestamp de início do drink atual (para bônus de velocidade por drink)
  const roundStartTimeRef = useRef<number>(0);

  // Métricas acumuladas da partida
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [correctDrinks, setCorrectDrinks] = useState(0);
  const [incorrectDrinks, setIncorrectDrinks] = useState(0);
  const [totalIngredientsSelected, setTotalIngredientsSelected] = useState(0);
  const [correctIngredientsCount, setCorrectIngredientsCount] = useState(0);
  const [incorrectIngredientsCount, setIncorrectIngredientsCount] = useState(0);
  const [missingIngredientsCount, setMissingIngredientsCount] = useState(0);

  // Métricas finais consolidadas
  const [finalMetrics, setFinalMetrics] = useState<DrinkAssemblyMetrics | null>(null);

  // Iniciar uma nova partida com base nas configurações
  const startGame = useCallback(
    (newConfig: DrinkAssemblyConfigState) => {
      setConfig(newConfig);

      const available = catalogProducts
        ? buildDrinkGroups(catalogProducts, newConfig.category)
        : [];
      if (!available || available.length === 0) {
        return false;
      }

      const selected = selectMatchDrinks(available, newConfig.drinkCount);
      if (selected.length === 0) {
        return false;
      }

      setMatchDrinks(selected);
      setCurrentIndex(0);

      // Gera a primeira rodada
      const firstRound = generateDrinkRound(
        selected[0],
        allIngredients,
        newConfig.difficulty
      );
      setCurrentRound(firstRound);
      setSelectedIngredientIds([]);
      setIsConfirmed(false);
      setEvaluation(null);

      // Reset de métricas
      setScore(0);
      setStreak(0);
      setBestStreak(0);
      setCorrectDrinks(0);
      setIncorrectDrinks(0);
      setTotalIngredientsSelected(0);
      setCorrectIngredientsCount(0);
      setIncorrectIngredientsCount(0);
      setMissingIngredientsCount(0);
      setFinalMetrics(null);

      // Inicia timer global e marca início do primeiro drink
      timer.reset();
      timer.start();
      roundStartTimeRef.current = Date.now();

      setGameState('playing');
      play('click');
      return true;
    },
    [allIngredients, timer, play, catalogProducts]
  );

  // Alternar seleção de ingrediente
  const toggleIngredient = useCallback(
    (ingredientId: string) => {
      if (isConfirmed) return; // Não permite alterar após confirmação

      setSelectedIngredientIds((prev) => {
        if (prev.includes(ingredientId)) {
          return prev.filter((id) => id !== ingredientId);
        } else {
          return [...prev, ingredientId];
        }
      });
      play('click');
    },
    [isConfirmed, play]
  );

  // Confirmar a montagem do drink atual
  const confirmDrink = useCallback(() => {
    if (!currentRound || isConfirmed) return;

    const elapsedRoundSeconds = Math.max(
      1,
      Math.round((Date.now() - roundStartTimeRef.current) / 1000)
    );

    const resultEval = evaluateDrinkSelection(
      currentRound.targetDrink,
      selectedIngredientIds,
      currentRound.pool
    );
    setEvaluation(resultEval);
    setIsConfirmed(true);
    play(resultEval.isPerfectMatch ? 'success' : 'error');

    const newStreak = resultEval.isPerfectMatch ? streak + 1 : 0;
    const updatedBestStreak = Math.max(bestStreak, newStreak);
    setStreak(newStreak);
    setBestStreak(updatedBestStreak);

    if (resultEval.isPerfectMatch) {
      setCorrectDrinks((prev) => prev + 1);
    } else {
      setIncorrectDrinks((prev) => prev + 1);
    }

    setTotalIngredientsSelected((prev) => prev + selectedIngredientIds.length);
    setCorrectIngredientsCount((prev) => prev + resultEval.correctSelected.length);
    setIncorrectIngredientsCount((prev) => prev + resultEval.incorrectSelected.length);
    setMissingIngredientsCount((prev) => prev + resultEval.missingIngredients.length);

    // Motor de pontuação
    const breakdown = calculateDrinkAssemblyScore({
      isPerfectMatch: resultEval.isPerfectMatch,
      correctCount: resultEval.correctSelected.length,
      incorrectCount: resultEval.incorrectSelected.length,
      missingCount: resultEval.missingIngredients.length,
      totalRequired: currentRound.targetDrink.members.length,
      streak: newStreak,
      elapsedSeconds: elapsedRoundSeconds,
      difficulty: config.difficulty,
    });

    setScore((prev) => prev + breakdown.finalScore);
  }, [
    currentRound,
    isConfirmed,
    selectedIngredientIds,
    streak,
    bestStreak,
    config.difficulty,
    play,
  ]);

  // Avançar para o próximo drink ou finalizar
  const nextDrink = useCallback(() => {
    if (!isConfirmed) return;

    const nextIndex = currentIndex + 1;
    if (nextIndex < matchDrinks.length) {
      const nextTarget = matchDrinks[nextIndex];
      const nextRound = generateDrinkRound(
        nextTarget,
        allIngredients,
        config.difficulty
      );

      setCurrentIndex(nextIndex);
      setCurrentRound(nextRound);
      setSelectedIngredientIds([]);
      setIsConfirmed(false);
      setEvaluation(null);
      roundStartTimeRef.current = Date.now();
    } else {
      // Fim da partida!
      play('complete');
      timer.pause();
      const finalDuration = timer.seconds;

      const totalD = matchDrinks.length;
      const acc = calculateDrinkAccuracy(correctDrinks, totalD);

      const metrics: DrinkAssemblyMetrics = {
        totalDrinks: totalD,
        completedDrinks: totalD,
        correctDrinks,
        incorrectDrinks,
        matches: correctDrinks,
        errors: incorrectDrinks,
        accuracy: acc,
        totalIngredientsSelected,
        correctIngredients: correctIngredientsCount,
        incorrectIngredients: incorrectIngredientsCount,
        missingIngredients: missingIngredientsCount,
        bestStreak,
        durationSeconds: finalDuration,
      };

      setFinalMetrics(metrics);

      // Salva no histórico unificado da plataforma
      const gameResult: GameResult<DrinkAssemblyMetrics> = {
        id: `drink_${Date.now()}`,
        gameId: 'montar-drink',
        playerId: player?.id || 'local-player',
        score,
        accuracy: acc,
        durationSeconds: finalDuration,
        difficulty: config.difficulty,
        category: config.category,
        playedAt: new Date().toISOString(),
        metrics,
      };

      recordResult(gameResult);
      setGameState('finished');
    }
  }, [
    isConfirmed,
    currentIndex,
    matchDrinks,
    allIngredients,
    config.difficulty,
    config.category,
    timer,
    correctDrinks,
    incorrectDrinks,
    totalIngredientsSelected,
    correctIngredientsCount,
    incorrectIngredientsCount,
    missingIngredientsCount,
    bestStreak,
    player?.id,
    score,
    recordResult,
    play,
  ]);

  // Encerrar partida antecipadamente (salvando se houver progresso)
  const finishEarly = useCallback(() => {
    const completed = correctDrinks + incorrectDrinks;
    if (completed > 0) {
      timer.pause();
      const finalDuration = timer.seconds;
      const acc = calculateDrinkAccuracy(correctDrinks, completed);

      const metrics: DrinkAssemblyMetrics = {
        totalDrinks: completed,
        completedDrinks: completed,
        correctDrinks,
        incorrectDrinks,
        matches: correctDrinks,
        errors: incorrectDrinks,
        accuracy: acc,
        totalIngredientsSelected,
        correctIngredients: correctIngredientsCount,
        incorrectIngredients: incorrectIngredientsCount,
        missingIngredients: missingIngredientsCount,
        bestStreak,
        durationSeconds: finalDuration,
      };

      setFinalMetrics(metrics);

      const gameResult: GameResult<DrinkAssemblyMetrics> = {
        id: `drink_${Date.now()}`,
        gameId: 'montar-drink',
        playerId: player?.id || 'local-player',
        score,
        accuracy: acc,
        durationSeconds: finalDuration,
        difficulty: config.difficulty,
        category: config.category,
        playedAt: new Date().toISOString(),
        metrics,
      };

      recordResult(gameResult);
      setGameState('finished');
    } else {
      timer.reset();
      setGameState('config');
    }
  }, [
    correctDrinks,
    incorrectDrinks,
    timer,
    totalIngredientsSelected,
    correctIngredientsCount,
    incorrectIngredientsCount,
    missingIngredientsCount,
    bestStreak,
    player?.id,
    score,
    config.difficulty,
    config.category,
    recordResult,
  ]);

  // Reiniciar jogo
  const restart = useCallback(() => {
    timer.reset();
    setGameState('config');
  }, [timer]);

  // Cleanup de segurança ao desmontar o hook
  useEffect(() => {
    return () => {
      timer.reset();
    };
  }, []);

  return {
    gameState,
    config,
    isCatalogReady: catalogProducts !== null,
    allEligibleDrinks,
    matchDrinks,
    currentIndex,
    currentDrink: currentRound?.targetDrink || null,
    pool: currentRound?.pool || [],
    selectedIngredientIds,
    isConfirmed,
    evaluation,
    score,
    streak,
    bestStreak,
    correctDrinks,
    incorrectDrinks,
    timer,
    finalMetrics,
    startGame,
    toggleIngredient,
    confirmDrink,
    nextDrink,
    finishEarly,
    restart,
  };
}
