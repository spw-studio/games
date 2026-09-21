'use client';

import { useDrinkAssembly } from '@/hooks/useDrinkAssembly';
import { DrinkAssemblyConfig } from '@/components/games/montar-drink/DrinkAssemblyConfig';
import { DrinkAssemblyGame } from '@/components/games/montar-drink/DrinkAssemblyGame';
import { DrinkAssemblyResult } from '@/components/games/montar-drink/DrinkAssemblyResult';
import { ThemeProvider } from '@/theme/ThemeProvider';
import { getGameById } from '@/lib/games/registry';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { useState } from 'react';

const drinkTheme = getGameById('montar-drink')?.theme ?? 'default';

export default function MontarDrinkPage() {
  const [isStarting, setIsStarting] = useState(false);
  const {
    gameState,
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

  const handleStartGame = (config: Parameters<typeof startGame>[0]) => {
    setIsStarting(true);
    window.setTimeout(() => {
      startGame(config);
      setIsStarting(false);
    }, 350);
  };

  return (
    <ThemeProvider themeId={drinkTheme}>
    <div className="py-2 animate-in fade-in duration-300">
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
    {isStarting && <LoadingScreen label="Preparando o Montar Drink..." />}
    </ThemeProvider>
  );
}
