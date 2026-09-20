'use client';

import { useDrinkAssembly } from '@/hooks/useDrinkAssembly';
import { DrinkAssemblyConfig } from '@/components/games/montar-drink/DrinkAssemblyConfig';
import { DrinkAssemblyGame } from '@/components/games/montar-drink/DrinkAssemblyGame';
import { DrinkAssemblyResult } from '@/components/games/montar-drink/DrinkAssemblyResult';

export default function MontarDrinkPage() {
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

  return (
    <div className="py-2 animate-in fade-in duration-300">
      {gameState === 'config' && (
        <DrinkAssemblyConfig
          availableDrinks={allEligibleDrinks}
          onStartGame={startGame}
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
  );
}
