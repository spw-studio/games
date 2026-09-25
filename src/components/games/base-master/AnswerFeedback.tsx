'use client';

import { CheckCircle2, TimerOff, XCircle } from 'lucide-react';
import { describeBaseMasterAnswer } from '@/lib/games/base-master';
import { BaseMasterQuestion } from '@/types/base-master';

interface AnswerFeedbackProps {
  question: BaseMasterQuestion;
  selectedValue: string | null;
  timedOut: boolean;
  /** Pontos ganhos nesta resposta (0 quando errou/estourou o tempo). */
  pointsEarned?: number;
  /** Combo atual após a resposta (0 = zerado). */
  combo?: number;
}

/**
 * Feedback inline e rápido da resposta (substitui modais) — anunciado por
 * leitores de tela via `role="status"`.
 */
export function AnswerFeedback({
  question,
  selectedValue,
  timedOut,
  pointsEarned = 0,
  combo = 0,
}: AnswerFeedbackProps) {
  const feedback = describeBaseMasterAnswer(question, selectedValue, timedOut);

  const variant = feedback.isCorrect
    ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
    : timedOut
      ? 'border-amber-200 bg-amber-50 text-amber-800'
      : 'border-rose-200 bg-rose-50 text-rose-700';

  const Icon = feedback.isCorrect ? CheckCircle2 : timedOut ? TimerOff : XCircle;

  return (
    <div aria-live="polite" role="status" className="min-h-[4.5rem]">
      <div
        className={`flex flex-wrap items-center gap-3 rounded-card border px-4 py-3 animate-in fade-in slide-in-from-bottom-2 duration-200 ${variant}`}
      >
        <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />

        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold uppercase tracking-wide">{feedback.title}</p>
          <p className="text-sm">{feedback.message}</p>
        </div>

        {feedback.isCorrect && (
          <div className="flex items-center gap-2">
            <span className="rounded-full border border-emerald-300 bg-emerald-100 px-2.5 py-1 font-mono text-sm font-bold text-emerald-800">
              +{pointsEarned}
            </span>
            {combo >= 2 && (
              <span className="rounded-full border border-amber-300 bg-amber-100 px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-amber-800">
                Combo x{combo}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
