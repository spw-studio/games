'use client';

import { ChevronLeft, ChevronRight, Eye, EyeOff, GraduationCap, LogOut, Sparkles } from 'lucide-react';
import { GameSoundToggle } from '@/components/audio/GameSoundToggle';
import { DrinkCard } from './DrinkCard';
import { getAttributeValue, getAvailableAttributes } from '@/lib/games/base-master';
import { BaseMasterDrink } from '@/types/base-master';

interface LearningModeProps {
  drink: BaseMasterDrink;
  /** Índice 0-based do drink atual. */
  index: number;
  total: number;
  isBaseRevealed: boolean;
  hasPrevious: boolean;
  hasNext: boolean;
  category?: string;
  onToggleBase: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onQuit: () => void;
}

/**
 * Modo Aprender: apresenta a associação `drink → bebida de base` sem pontuação,
 * com navegação simples e opção de ocultar/revelar a resposta.
 */
export function LearningMode({
  drink,
  index,
  total,
  isBaseRevealed,
  hasPrevious,
  hasNext,
  category,
  onToggleBase,
  onPrevious,
  onNext,
  onQuit,
}: LearningModeProps) {
  const current = total > 0 ? Math.min(index + 1, total) : 0;

  // Atributos extras já declarados no catálogo (método/copo/guarnição):
  // aparecem automaticamente na ficha de estudo, sem dados inventados.
  const extraAttributes = getAvailableAttributes(drink).filter((attribute) => !attribute.core);

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-4">
      {/* Cabeçalho */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-card border border-border bg-surface px-4 py-3 shadow-card">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 rounded-full border border-gold-400/40 bg-gold-500/20 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-gold-300">
            <GraduationCap className="h-3.5 w-3.5" aria-hidden="true" />
            Aprender
          </span>
          <span className="font-mono text-sm font-bold text-foreground">
            {current} / {total}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <GameSoundToggle />
          <button
            type="button"
            onClick={onQuit}
            title="Sair do modo aprender"
            aria-label="Sair do modo aprender"
            className="flex h-8 w-8 items-center justify-center rounded-control bg-muted text-muted-foreground transition-all hover:bg-surface-hover hover:text-foreground"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Cartão do drink */}
      <DrinkCard
        key={drink.id}
        name={drink.name}
        image={drink.image}
        category={category ?? drink.categoryId}
        label="Bebida de base"
        value={drink.baseSpirit}
        isBaseHidden={!isBaseRevealed}
        size="lg"
      >
        {extraAttributes.length > 0 && (
          <dl className="mt-3 grid grid-cols-1 gap-2 text-left sm:grid-cols-2">
            {extraAttributes.map((attribute) => (
              <div
                key={attribute.id}
                className="rounded-control border border-border bg-surface px-3 py-2"
              >
                <dt className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  {attribute.label}
                </dt>
                <dd className="text-sm font-semibold text-foreground">
                  {getAttributeValue(drink, attribute.id)}
                </dd>
              </div>
            ))}
          </dl>
        )}

        <button
          type="button"
          onClick={onToggleBase}
          aria-pressed={!isBaseRevealed}
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-control border-2 border-border bg-surface px-4 py-2.5 text-sm font-bold text-foreground transition-all hover:border-primary/50 hover:bg-surface-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 active:scale-[0.98]"
        >
          {isBaseRevealed ? (
            <>
              <EyeOff className="h-4 w-4" aria-hidden="true" />
              Ocultar resposta
            </>
          ) : (
            <>
              <Eye className="h-4 w-4" aria-hidden="true" />
              Mostrar resposta
            </>
          )}
        </button>
      </DrinkCard>

      {/* Navegação */}
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onPrevious}
          disabled={!hasPrevious}
          className="flex items-center gap-1.5 rounded-control border-2 border-border bg-surface px-4 py-3 text-sm font-bold text-foreground transition-all hover:border-primary/50 hover:bg-surface-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          Anterior
        </button>

        <span className="flex items-center gap-1.5 text-xs text-subtle-foreground">
          <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
          Memorize a associação
        </span>

        <button
          type="button"
          onClick={onNext}
          disabled={!hasNext}
          className="flex items-center gap-1.5 rounded-control bg-primary px-4 py-3 text-sm font-bold text-primary-foreground shadow-card transition-all hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
        >
          Próximo
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      <p className="text-center text-xs text-subtle-foreground">
        O modo Aprender não pontua: use-o para fixar a base de cada drink antes de treinar.
      </p>
    </div>
  );
}
