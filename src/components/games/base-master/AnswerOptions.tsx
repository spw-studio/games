'use client';

import { Check, X } from 'lucide-react';
import { describeBaseMasterOptionState } from '@/lib/games/base-master';
import { BaseMasterQuestion } from '@/types/base-master';

interface AnswerOptionsProps {
  question: BaseMasterQuestion;
  selectedValue: string | null;
  /** `true` após responder: revela correta/errada. */
  isRevealed: boolean;
  onSelect: (value: string) => void;
  /** 2 colunas (Treinar) ou 4 (Desafio, mais compacto). */
  columns?: 'two' | 'four';
}

const COLUMNS: Record<NonNullable<AnswerOptionsProps['columns']>, string> = {
  two: 'grid-cols-1 sm:grid-cols-2',
  four: 'grid-cols-2 sm:grid-cols-4',
};

/**
 * Alternativas de resposta — botões nativos (Tab/Enter), com estado visual,
 * ícone e texto para leitores de tela (nunca apenas cor).
 */
export function AnswerOptions({
  question,
  selectedValue,
  isRevealed,
  onSelect,
  columns = 'two',
}: AnswerOptionsProps) {
  return (
    <div
      role="group"
      aria-label={`${question.attributeLabel} de ${question.drinkName}`}
      className={`grid gap-3 ${COLUMNS[columns]}`}
    >
      {question.options.map((option) => {
        const state = describeBaseMasterOptionState(
          option,
          question,
          selectedValue,
          isRevealed
        );

        const stateClasses: Record<typeof state, string> = {
          idle: 'border-border bg-surface text-foreground hover:border-primary/60 hover:bg-surface-hover',
          selected: 'border-primary bg-primary-soft text-foreground shadow-md',
          correct: 'border-emerald-500 bg-emerald-50 text-emerald-800 shadow-md',
          incorrect: 'border-rose-500 bg-rose-50 text-rose-700 shadow-md',
          muted: 'border-border bg-surface text-subtle-foreground opacity-60',
        };

        const srState =
          state === 'correct'
            ? '— resposta correta'
            : state === 'incorrect'
              ? '— resposta errada'
              : '';

        return (
          <button
            key={option}
            type="button"
            onClick={() => onSelect(option)}
            disabled={isRevealed}
            aria-pressed={state === 'selected'}
            className={`flex min-h-[3.25rem] w-full items-center justify-center gap-2 rounded-control border-2 px-4 py-3 text-base font-bold uppercase tracking-wide transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 active:scale-[0.98] disabled:cursor-default ${stateClasses[state]}`}
          >
            {state === 'correct' && <Check className="h-5 w-5 shrink-0 text-emerald-600" />}
            {state === 'incorrect' && <X className="h-5 w-5 shrink-0 text-rose-600" />}
            <span className="break-words">{option}</span>
            {srState && <span className="sr-only">{srState}</span>}
          </button>
        );
      })}
    </div>
  );
}
