'use client';

import { useDrinkAssembly } from '@/hooks/useDrinkAssembly';
import { DrinkAssemblyConfig } from '@/components/games/montar-drink/DrinkAssemblyConfig';
import { DrinkAssemblyGame } from '@/components/games/montar-drink/DrinkAssemblyGame';
import { DrinkAssemblyResult } from '@/components/games/montar-drink/DrinkAssemblyResult';
import { ThemeProvider } from '@/theme/ThemeProvider';
import { getGameById } from '@/lib/games/registry';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { useImmersiveGame } from '@/components/layout/GameModeProvider';
import { useState } from 'react';

const drinkTheme = getGameById('montar-drink')?.theme ?? 'default';

export default function MontarDrinkPage() {
  const [isStarting, setIsStarting] = useState(false);
  const {
    gameState,
    isCatalogReady,
    allEligibleDrinks,
    matchDrinks,
    currentIndex,
    currentDrink,
    pool,
    selectedIngredientIds,
    isConfirmed,
    evaluation,
    score,
    streak,
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
  } = useDrinkAssembly();

  // Modo imersivo: durante a partida a navbar/rodapé somem e o jogo ocupa
  // 100% da tela, sem barra de rolagem da página.
  useImmersiveGame(gameState === 'playing');

  const handleStartGame = (config: Parameters<typeof startGame>[0]) => {
    setIsStarting(true);
    window.setTimeout(() => {
      startGame(config);
      setIsStarting(false);
    }, 350);
  };

  return (
    <ThemeProvider themeId={drinkTheme} className="flex min-h-0 flex-1 flex-col">
    <div
      className={`animate-in fade-in duration-300 ${
        gameState === 'playing' ? 'flex min-h-0 flex-1 flex-col p-2' : 'py-2'
      }`}
    >
      {gameState === 'config' && (
        <DrinkAssemblyConfig
          availableDrinks={allEligibleDrinks}
          onStartGame={handleStartGame}
        />
      )}

      {gameState === 'playing' && currentDrink && (
        <DrinkAssemblyGame
          currentDrink={currentDrink}
          pool={pool}
          currentIndex={currentIndex}
          totalDrinks={matchDrinks.length}
          score={score}
          streak={streak}
          correctDrinks={correctDrinks}
          incorrectDrinks={incorrectDrinks}
          formattedTime={timer.formatted}
          selectedIds={selectedIngredientIds}
          isConfirmed={isConfirmed}
          evaluation={evaluation}
          onToggleIngredient={toggleIngredient}
          onConfirm={confirmDrink}
          onNext={nextDrink}
          onRestart={finishEarly}
        />
      )}

      {gameState === 'finished' && finalMetrics && (
        <DrinkAssemblyResult
          score={score}
          metrics={finalMetrics}
          onPlayAgain={restart}
        />
      )}
    </div>
    {!isCatalogReady && <LoadingScreen label="Carregando catálogo..." />}
    {isStarting && <LoadingScreen label="Preparando o Montar Drink..." />}
    </ThemeProvider>
  );
}
