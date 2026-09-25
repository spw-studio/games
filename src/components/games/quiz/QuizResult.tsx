'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  Clock,
  Flame,
  Home,
  RotateCcw,
  Settings2,
  Target,
  TimerOff,
  Trophy,
  XCircle,
} from 'lucide-react';
import { CELEBRATION_COLORS } from '@/theme/themes';
import { formatTimeMMSS } from '@/lib/statistics/calculations';
import { QuizAnswerRecord, QuizMetrics, QuizQuestion } from '@/types/quiz';

interface QuizResultProps {
  score: number;
  metrics: QuizMetrics;
  answers: QuizAnswerRecord[];
  questions: QuizQuestion[];
  /** Repete a partida com a mesma configuração (`true`) ou volta à tela de ajustes (`false`). */
  onPlayAgain: (sameConfig: boolean) => void;
}

/**
 * Tela de resultado: comemoração, estatísticas da partida e revisão completa
 * das perguntas (pista, resposta correta e alternativa escolhida).
 */
export function QuizResult({
  score,
  metrics,
  answers,
  questions,
  onPlayAgain,
}: QuizResultProps) {
  // Comemoração apenas em desempenho positivo (mesmo padrão dos demais jogos)
  useEffect(() => {
    if (metrics.accuracy < 70) return;

    try {
      confetti({
        particleCount: 90,
        spread: 60,
        origin: { y: 0.5 },
        colors: [...CELEBRATION_COLORS],
      });
    } catch {
      // Safe fallback se canvas-confetti não puder rodar
    }
  }, [metrics.accuracy]);

  const gradeLabel =
    metrics.accuracy === 100
      ? '🏆 Especialista no Cardápio!'
      : metrics.accuracy >= 70
        ? '👏 Muito bem!'
        : metrics.accuracy >= 40
          ? '🙂 Bom começo!'
          : '📚 Continue praticando!';

  const unansweredCount = metrics.totalQuestions - metrics.answeredQuestions;

  return (
    <div className="mx-auto max-w-2xl space-y-6 py-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Cabeçalho com pontuação */}
      <div className="overflow-hidden rounded-3xl border border-border bg-surface shadow-2xl">
        <div className="relative bg-gradient-to-br from-brand-950 via-brand-900 to-brand-800 px-6 py-10 text-center sm:px-10">
          <div className="absolute inset-0 bg-[radial-gradient(#C89D5C_1px,transparent_1px)] [background-size:16px_16px] opacity-10" />

          <div className="relative z-10 mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-3xl border-2 border-gold-400/40 bg-overlay/10 shadow-2xl backdrop-blur-sm">
            <Trophy className="h-10 w-10 animate-bounce text-gold-300" />
          </div>

          <div className="relative z-10 mb-2 inline-flex items-center gap-1.5 rounded-full border border-gold-400/40 bg-gold-500/20 px-4 py-1 text-xs font-bold uppercase tracking-widest text-gold-300">
            <Target className="h-3.5 w-3.5" />
            <span>Conhecimento Rápido</span>
          </div>

          <h1 className="relative z-10 font-serif text-3xl font-bold">{gradeLabel}</h1>

          <div className="relative z-10 mt-4 flex items-center justify-center gap-2">
            <span className="font-mono text-4xl font-black text-gold-300 sm:text-5xl">
              {score.toLocaleString()}
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-foreground/80">
              pontos
            </span>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-2 gap-3 p-6 sm:grid-cols-4 sm:p-8">
          <div className="rounded-2xl border border-border bg-emerald-50 p-3 text-center">
            <div className="mb-1 flex justify-center text-emerald-600">
              <CheckCircle2 className="h-4 w-4" />
            </div>
            <div className="font-mono text-xl font-bold text-emerald-700">
              {metrics.correctAnswers}
              <span className="text-sm text-emerald-600/70">/{metrics.totalQuestions}</span>
            </div>
            <div className="text-[10px] font-medium uppercase tracking-wide text-subtle-foreground">
              Acertos
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-sky-50 p-3 text-center">
            <div className="mb-1 flex justify-center text-sky-600">
              <Target className="h-4 w-4" />
            </div>
            <div className="font-mono text-xl font-bold text-sky-700">{metrics.accuracy}%</div>
            <div className="text-[10px] font-medium uppercase tracking-wide text-subtle-foreground">
              Precisão
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-amber-50 p-3 text-center">
            <div className="mb-1 flex justify-center text-amber-600">
              <Clock className="h-4 w-4" />
            </div>
            <div className="font-mono text-xl font-bold text-amber-700">
              {formatTimeMMSS(metrics.durationSeconds)}
            </div>
            <div className="text-[10px] font-medium uppercase tracking-wide text-subtle-foreground">
              Tempo
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-violet-50 p-3 text-center">
            <div className="mb-1 flex justify-center text-violet-600">
              <Flame className="h-4 w-4" />
            </div>
            <div className="font-mono text-xl font-bold text-violet-700">
              {metrics.bestStreak}x
            </div>
            <div className="text-[10px] font-medium uppercase tracking-wide text-subtle-foreground">
              Melhor sequência
            </div>
          </div>
        </div>
      </div>

      {/* Revisão das perguntas */}
      <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
        <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-muted-foreground">
          Revisão — {metrics.correctAnswers}/{metrics.totalQuestions} corretas
        </h2>

        <ul className="space-y-2">
          {answers.map((answer, index) => {
            const question = questions.find((item) => item.id === answer.questionId);
            const selectedLabel = !answer.selectedOptionId
              ? null
              : (question?.options.find(
                  (option) => option.productId === answer.selectedOptionId
                )?.label ?? null);

            return (
              <li
                key={`${answer.questionId}-${index}`}
                className={`flex items-start gap-3 rounded-xl border px-3 py-2.5 text-sm ${
                  answer.isCorrect
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                    : 'border-rose-200 bg-rose-50 text-rose-700'
                }`}
              >
                {answer.isCorrect ? (
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                ) : answer.timedOut ? (
                  <TimerOff className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" />
                ) : (
                  <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" />
                )}

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider opacity-70">
                      {question?.clueLabel ?? 'Pista'}
                    </span>
                    <span className="font-semibold">{answer.correctProductName}</span>
                  </div>

                  <div className="mt-0.5 text-xs opacity-80">
                    {selectedLabel ? (
                      <>
                        Sua resposta: <span className="font-medium">{selectedLabel}</span>
                      </>
                    ) : (
                      <span className="inline-flex items-center gap-1 font-medium">
                        <TimerOff className="h-3 w-3" />
                        Tempo esgotado
                      </span>
                    )}
                  </div>
                </div>

                <span className="shrink-0 font-mono text-xs opacity-70">
                  {answer.answeredInSeconds}s
                </span>
              </li>
            );
          })}
        </ul>

        {unansweredCount > 0 && (
          <p className="mt-3 text-xs text-subtle-foreground">
            {unansweredCount} pergunta
            {unansweredCount > 1 ? 's' : ''} não respondida
            {unansweredCount > 1 ? 's' : ''} (partida encerrada antes do fim).
          </p>
        )}
      </div>

      {/* Ações */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => onPlayAgain(true)}
          className="flex items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3.5 text-sm font-bold text-white shadow-md transition-all hover:-translate-y-0.5 active:scale-95"
        >
          <RotateCcw className="h-4 w-4" />
          Jogar de Novo
        </button>
        <button
          type="button"
          onClick={() => onPlayAgain(false)}
          className="flex items-center justify-center gap-2 rounded-2xl border-2 border-border bg-surface px-4 py-3.5 text-sm font-bold text-foreground transition-all hover:-translate-y-0.5 hover:bg-primary-soft active:scale-95"
        >
          <Settings2 className="h-4 w-4" />
          Mudar Configuração
        </button>
      </div>

      <Link
        href="/jogos"
        className="flex items-center justify-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <Home className="h-4 w-4" />
        Voltar aos Jogos
      </Link>
    </div>
  );
}
