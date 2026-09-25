'use client';

import { useEffect, useMemo } from 'react';
import Link from 'next/link';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  Clock,
  Flame,
  Home,
  Martini,
  RotateCcw,
  Settings2,
  Target,
  TimerOff,
  Trophy,
  XCircle,
} from 'lucide-react';
import { CELEBRATION_COLORS } from '@/theme/themes';
import { formatTimeMMSS } from '@/lib/statistics/calculations';
import {
  BASE_MASTER_MODE_LABELS,
  BaseMasterAnswerRecord,
  BaseMasterMetrics,
} from '@/types/base-master';

interface BaseMasterResultProps {
  metrics: BaseMasterMetrics;
  answers: BaseMasterAnswerRecord[];
  /** `true` repete a rodada; `false` volta para a tela de ajustes. */
  onPlayAgain: (sameConfig: boolean) => void;
  /** Nova rodada somente com os erros desta partida (opcional). */
  onReviewMistakes?: () => void;
}

/**
 * Tela final do Treinar/Desafio: pontuação, estatísticas, revisão das
 * associações e ações de reinício (o Desafio termina aqui quando o tempo acaba).
 */
export function BaseMasterResult({
  metrics,
  answers,
  onPlayAgain,
  onReviewMistakes,
}: BaseMasterResultProps) {
  // Comemoração apenas em desempenho positivo (padrão dos demais jogos)
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

  const bonuses = useMemo(
    () => ({
      combo: answers.reduce((total, answer) => total + answer.comboBonus, 0),
      speed: answers.reduce((total, answer) => total + answer.speedBonus, 0),
    }),
    [answers]
  );

  const gradeLabel =
    metrics.accuracy === 100
      ? '🏆 Base Master!'
      : metrics.accuracy >= 70
        ? '👏 Excelente domínio!'
        : metrics.accuracy >= 40
          ? '🙂 Bom começo!'
          : '📚 Continue treinando!';

  return (
    <div className="mx-auto max-w-2xl space-y-6 py-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Cabeçalho */}
      <div className="overflow-hidden rounded-3xl border border-border bg-surface shadow-2xl">
        <div className="relative bg-gradient-to-br from-brand-950 via-brand-900 to-brand-800 px-6 py-10 text-center text-white sm:px-10">
          <div className="absolute inset-0 bg-[radial-gradient(#C89D5C_1px,transparent_1px)] [background-size:16px_16px] opacity-10" />

          <div className="relative z-10 mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-3xl border-2 border-gold-400/40 bg-overlay/10 shadow-2xl backdrop-blur-sm">
            <Trophy className="h-10 w-10 animate-bounce text-gold-300" />
          </div>

          <div className="relative z-10 mb-2 inline-flex items-center gap-1.5 rounded-full border border-gold-400/40 bg-gold-500/20 px-4 py-1 text-xs font-bold uppercase tracking-widest text-gold-300">
            <Martini className="h-3.5 w-3.5" />
            <span>{BASE_MASTER_MODE_LABELS[metrics.mode]} — Base Master</span>
          </div>

          <h1 className="relative z-10 font-serif text-3xl font-bold">{gradeLabel}</h1>

          <div className="relative z-10 mt-4 flex items-center justify-center gap-2">
            <span className="font-mono text-4xl font-black text-gold-300 sm:text-5xl">
              {metrics.score.toLocaleString()}
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-foreground/80">
              pontos
            </span>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-2 gap-3 p-6 sm:grid-cols-3 sm:p-8">
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

          <div className="rounded-2xl border border-border bg-rose-50 p-3 text-center">
            <div className="mb-1 flex justify-center text-rose-600">
              <XCircle className="h-4 w-4" />
            </div>
            <div className="font-mono text-xl font-bold text-rose-700">
              {metrics.incorrectAnswers + metrics.timedOutAnswers}
            </div>
            <div className="text-[10px] font-medium uppercase tracking-wide text-subtle-foreground">
              Erros
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-amber-50 p-3 text-center">
            <div className="mb-1 flex justify-center text-amber-600">
              <Flame className="h-4 w-4" />
            </div>
            <div className="font-mono text-xl font-bold text-amber-700">x{metrics.bestCombo}</div>
            <div className="text-[10px] font-medium uppercase tracking-wide text-subtle-foreground">
              Maior combo
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

          <div className="rounded-2xl border border-border bg-muted p-3 text-center">
            <div className="mb-1 flex justify-center text-foreground">
              <Clock className="h-4 w-4" />
            </div>
            <div className="font-mono text-xl font-bold text-foreground">
              {formatTimeMMSS(metrics.durationSeconds)}
            </div>
            <div className="text-[10px] font-medium uppercase tracking-wide text-subtle-foreground">
              Tempo
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-muted p-3 text-center">
            <div className="mb-1 flex justify-center text-foreground">
              <TimerOff className="h-4 w-4" />
            </div>
            <div className="font-mono text-xl font-bold text-foreground">
              {metrics.avgSecondsPerAnswer}s
            </div>
            <div className="text-[10px] font-medium uppercase tracking-wide text-subtle-foreground">
              Média por resposta
            </div>
          </div>
        </div>

        {(bonuses.combo > 0 || bonuses.speed > 0) && (
          <div className="flex flex-wrap justify-center gap-2 px-6 pb-6 text-xs">
            {bonuses.combo > 0 && (
              <span className="rounded-full border border-amber-300 bg-amber-50 px-3 py-1 font-semibold text-amber-800">
                Bônus de combo +{bonuses.combo}
              </span>
            )}
            {bonuses.speed > 0 && (
              <span className="rounded-full border border-sky-300 bg-sky-50 px-3 py-1 font-semibold text-sky-800">
                Bônus de rapidez +{bonuses.speed}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Revisão das associações */}
      <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
        <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-muted-foreground">
          Revisão — {metrics.correctAnswers}/{metrics.totalQuestions} bases corretas
        </h2>

        <ul className="space-y-2">
          {answers.map((answer, index) => (
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
                  <span className="font-semibold">{answer.drinkName}</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider opacity-70">
                    {answer.attributeLabel}
                  </span>
                  <span className="text-xs opacity-80">→ {answer.correctValue}</span>
                </div>

                <div className="mt-0.5 text-xs opacity-80">
                  {answer.selectedValue ? (
                    <>
                      Sua resposta:{' '}
                      <span className="font-medium">{answer.selectedValue}</span>
                    </>
                  ) : (
                    <span className="inline-flex items-center gap-1 font-medium">
                      <TimerOff className="h-3 w-3" />
                      Tempo esgotado
                    </span>
                  )}
                </div>
              </div>

              <span className="shrink-0 font-mono text-xs font-bold opacity-80">
                {answer.pointsEarned > 0 ? `+${answer.pointsEarned}` : '0'}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Ações */}
      <div className="space-y-3">
        {onReviewMistakes && metrics.incorrectAnswers + metrics.timedOutAnswers > 0 && (
          <button
            type="button"
            onClick={onReviewMistakes}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-warning/50 bg-warning/10 px-4 py-3.5 text-sm font-bold text-warning transition-all hover:-translate-y-0.5 hover:bg-warning/20 focus:outline-none focus:ring-2 focus:ring-warning focus:ring-offset-2 active:scale-95"
          >
            <Flame className="h-4 w-4" />
            Revisar meus erros ({metrics.incorrectAnswers + metrics.timedOutAnswers})
          </button>
        )}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => onPlayAgain(true)}
            className="flex items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3.5 text-sm font-bold text-primary-foreground shadow-md transition-all hover:-translate-y-0.5 hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 active:scale-95"
          >
            <RotateCcw className="h-4 w-4" />
            Jogar Novamente
          </button>

          <button
            type="button"
            onClick={() => onPlayAgain(false)}
            className="flex items-center justify-center gap-2 rounded-2xl border-2 border-border bg-surface px-4 py-3.5 text-sm font-bold text-foreground transition-all hover:-translate-y-0.5 hover:bg-surface-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 active:scale-95"
          >
            <Settings2 className="h-4 w-4" />
            Mudar Modo
          </button>
        </div>
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
