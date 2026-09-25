'use client';

import { Clock, HelpCircle, List, Tag, Utensils, ShieldCheck, Hash } from 'lucide-react';
import { QuizClueType, QuizQuestion } from '@/types/quiz';

interface QuizClueCardProps {
  question: QuizQuestion;
  /** Segundos restantes para responder a pergunta atual. */
  secondsLeft: number;
  /** Tempo máximo por pergunta (0 = sem limite). */
  timePerQuestion: number;
  hasTimeLimit: boolean;
  isAnswered: boolean;
}

const CLUE_ICONS: Record<QuizClueType, React.ReactNode> = {
  descricao: <HelpCircle className="h-4 w-4" />,
  ingredientes: <List className="h-4 w-4" />,
  codigo: <Hash className="h-4 w-4" />,
  acompanhamentos: <Utensils className="h-4 w-4" />,
  restricao: <ShieldCheck className="h-4 w-4" />,
};

/**
 * Cartão da pista: rótulo do tipo de pista, enunciado higienizado, itens
 * auxiliares (ingredientes/acompanhamentos/restrições) e cronômetro da pergunta.
 * O nome do produto nunca aparece aqui — apenas na revelação pós-resposta.
 */
export function QuizClueCard({
  question,
  secondsLeft,
  timePerQuestion,
  hasTimeLimit,
  isAnswered,
}: QuizClueCardProps) {
  const progressPercent =
    hasTimeLimit && timePerQuestion > 0
      ? Math.max(0, Math.min(100, (secondsLeft / timePerQuestion) * 100))
      : 100;
  const isUrgent = hasTimeLimit && secondsLeft <= 5 && !isAnswered;

  return (
    <section
      aria-label="Pista do produto"
      className="rounded-card border border-border bg-surface p-5 shadow-card sm:p-6"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        {/* Selo do tipo de pista */}
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary-soft px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-primary">
          {CLUE_ICONS[question.clueType] ?? <HelpCircle className="h-4 w-4" />}
          <span>{question.clueLabel}</span>
        </div>

        {/* Cronômetro da pergunta */}
        {hasTimeLimit ? (
          <div
            className={`flex items-center gap-1.5 rounded-control border px-3 py-1.5 ${
              isUrgent
                ? 'animate-pulse border-danger/40 bg-danger/10 text-danger'
                : 'border-border bg-muted text-foreground'
            }`}
            role="timer"
            aria-label={`${secondsLeft} segundos restantes para responder`}
          >
            <Clock className="h-4 w-4" />
            <span className="font-mono text-sm font-bold">{secondsLeft}s</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 rounded-control border border-border bg-muted px-3 py-1.5 text-xs font-medium text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            <span>Sem limite</span>
          </div>
        )}
      </div>

      {/* Enunciado */}
      <p className="mt-4 text-base font-medium leading-relaxed text-foreground sm:text-lg">
        {question.clueText}
      </p>

      {/* Itens auxiliares da pista */}
      {question.clueItems.length > 0 && (
        <ul className="mt-4 flex flex-wrap gap-2" aria-label="Itens da pista">
          {question.clueItems.map((item, index) => (
            <li
              key={`${item}-${index}`}
              className="rounded-full border border-secondary/30 bg-primary-soft px-3 py-1.5 text-sm font-medium text-foreground"
            >
              {item}
            </li>
          ))}
        </ul>
      )}

      {/* Barra do cronômetro */}
      {hasTimeLimit && (
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
          <div
            className={`h-full rounded-full transition-all duration-1000 ease-linear ${
              isUrgent ? 'bg-danger' : 'bg-primary'
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      )}
    </section>
  );
}
