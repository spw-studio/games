'use client';

import { Check, Minus, X } from 'lucide-react';
import { describeOptionState } from '@/lib/games/quiz';
import { QuizQuestion } from '@/types/quiz';

interface QuizOptionsGridProps {
  question: QuizQuestion;
  selectedOptionId: string | null;
  isAnswered: boolean;
  onSelect: (optionId: string) => void;
}

/**
 * Alternativas de resposta — botões nativos (Tab/Enter funcionam por padrão)
 * com estados visuais + texto exclusivo para leitores de tela.
 */
export function QuizOptionsGrid({
  question,
  selectedOptionId,
  isAnswered,
  onSelect,
}: QuizOptionsGridProps) {
  return (
    <div
      role="group"
      aria-label="Alternativas de resposta"
      className="grid grid-cols-1 gap-3 sm:grid-cols-2"
    >
      {question.options.map((option, index) => {
        const state = describeOptionState(
          option.productId,
          question,
          selectedOptionId,
          isAnswered
        );

        const baseClasses =
          'flex w-full items-center gap-3 rounded-control border-2 px-4 py-3.5 text-left transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 active:scale-[0.98]';

        const stateClasses: Record<typeof state, string> = {
          idle: 'border-border bg-surface text-foreground hover:border-primary/50 hover:bg-surface-hover',
          selected: 'border-primary bg-primary-soft text-foreground shadow-md',
          correct:
            'border-emerald-500 bg-emerald-50 text-emerald-800 shadow-md animate-in zoom-in-95 duration-200',
          incorrect:
            'border-rose-500 bg-rose-50 text-rose-700 shadow-md animate-in shake-x duration-300',
          muted: 'border-border bg-surface text-subtle-foreground opacity-60',
        };

        const srStateLabel =
          state === 'correct'
            ? '— resposta correta'
            : state === 'incorrect'
              ? '— resposta incorreta'
              : '';

        return (
          <button
            key={option.productId}
            type="button"
            onClick={() => onSelect(option.productId)}
            disabled={isAnswered}
            aria-pressed={selectedOptionId === option.productId}
            className={`${baseClasses} ${stateClasses[state]} disabled:cursor-default`}
          >
            {/* Letra da alternativa */}
            <span
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                state === 'correct'
                  ? 'bg-emerald-500 text-white'
                  : state === 'incorrect'
                    ? 'bg-rose-500 text-white'
                    : state === 'selected'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
              }`}
              aria-hidden="true"
            >
              {String.fromCharCode(65 + index)}
            </span>

            <span className="min-w-0 flex-1 break-words text-sm font-semibold sm:text-base">
              {option.label}
            </span>

            {/* Ícone de estado (não é o único indicador — há texto sr-only) */}
            {state === 'correct' && <Check className="h-5 w-5 shrink-0 text-emerald-600" />}
            {state === 'incorrect' && <X className="h-5 w-5 shrink-0 text-rose-600" />}
            {state === 'muted' && <Minus className="h-4 w-4 shrink-0 text-subtle-foreground" />}

            {srStateLabel && <span className="sr-only">{srStateLabel}</span>}
          </button>
        );
      })}
    </div>
  );
}
