'use client';

import { DrinkAssemblyHUD } from './DrinkAssemblyHUD';
import { DrinkCard } from './DrinkCard';
import { IngredientGrid } from './IngredientGrid';
import { DrinkRoundEvaluation, Group, GroupMember } from '@/types/grouping';

interface DrinkAssemblyGameProps {
  currentDrink: Group;
  pool: GroupMember[];
  currentIndex: number;
  totalDrinks: number;
  score: number;
  streak: number;
  correctDrinks: number;
  incorrectDrinks: number;
  formattedTime: string;
  selectedIds: string[];
  isConfirmed: boolean;
  evaluation: DrinkRoundEvaluation | null;
  onToggleIngredient: (id: string) => void;
  onConfirm: () => void;
  onNext: () => void;
  onRestart: () => void;
}

export function DrinkAssemblyGame({
  currentDrink,
  pool,
  currentIndex,
  totalDrinks,
  score,
  streak,
  correctDrinks,
  incorrectDrinks,
  formattedTime,
  selectedIds,
  isConfirmed,
  evaluation,
  onToggleIngredient,
  onConfirm,
  onNext,
  onRestart,
}: DrinkAssemblyGameProps) {
  const isLastDrink = currentIndex + 1 >= totalDrinks;

  return (
    <div className="mx-auto flex min-h-0 w-full max-w-6xl flex-1 flex-col gap-4 animate-in fade-in duration-300">
      {/* HUD de Status Superior */}
      <DrinkAssemblyHUD
        currentIndex={currentIndex}
        totalDrinks={totalDrinks}
        score={score}
        correctDrinks={correctDrinks}
        incorrectDrinks={incorrectDrinks}
        streak={streak}
        formattedTime={formattedTime}
        onQuit={onRestart}
      />

      {/* Área Principal de Jogo Responsiva (ocupa a altura restante da partida;
          rolagem interna apenas quando o conteúdo não cabe na tela) */}
      {/* Desktop: Lado a Lado (Drink à Esquerda, Ingredientes à Direita) */}
      {/* Mobile: Coluna Única (Drink no Topo, Ingredientes Abaixo) */}
      <div className="grid min-h-0 flex-1 grid-cols-1 items-start gap-6 overflow-y-auto overscroll-contain lg:grid-cols-12">
        {/* Coluna do Drink */}
        <div className="lg:col-span-5">
          <DrinkCard drink={currentDrink} />
        </div>

        {/* Coluna dos Ingredientes e Ações */}
        <div className="lg:col-span-7 bg-surface rounded-card border border-border p-6 sm:p-8 shadow-card">
          <IngredientGrid
            pool={pool}
            selectedIds={selectedIds}
            isConfirmed={isConfirmed}
            evaluation={evaluation}
            isLastDrink={isLastDrink}
            onToggle={onToggleIngredient}
            onConfirm={onConfirm}
            onNext={onNext}
          />
        </div>
      </div>
    </div>
  );
}
