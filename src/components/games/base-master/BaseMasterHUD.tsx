'use client';

import { Clock, Flame, LogOut, Target, Timer } from 'lucide-react';
import { GameSoundToggle } from '@/components/audio/GameSoundToggle';
import { BASE_MASTER_MODE_LABELS, BaseMasterMode } from '@/types/base-master';

interface BaseMasterHUDProps {
  mode: BaseMasterMode;
  score: number;
  combo: number;
  correctAnswers: number;
  incorrectAnswers: number;
  /** Índice 0-based da pergunta atual. */
  currentIndex: number;
  totalQuestions: number;
  /** Tempo total decorrido (MM:SS). */
  formattedTime: string;
  /** Desafio com cronômetro: segundos restantes da pergunta atual. */
  secondsLeft?: number;
  secondsPerQuestion?: number;
  hasTimeLimit?: boolean;
  onQuit: () => void;
}

/**
 * Barra da partida (Treinar/Desafio): pontos, combo, acertos/erros, tempo,
 * progresso das questões e — no Desafio — o cronômetro da pergunta.
 */
export function BaseMasterHUD({
  mode,
  score,
  combo,
  correctAnswers,
  incorrectAnswers,
  currentIndex,
  totalQuestions,
  formattedTime,
  secondsLeft = 0,
  secondsPerQuestion = 0,
  hasTimeLimit = false,
  onQuit,
}: BaseMasterHUDProps) {
  const current = Math.min(currentIndex + 1, totalQuestions);
  const progressPercent = totalQuestions > 0 ? (current / totalQuestions) * 100 : 0;
  const isUrgent = hasTimeLimit && secondsLeft <= 3;
  const timerPercent =
    hasTimeLimit && secondsPerQuestion > 0
      ? Math.max(0, Math.min(100, (secondsLeft / secondsPerQuestion) * 100))
      : 100;

  return (
    <div className="rounded-card bg-primary p-4 text-primary-foreground shadow-elevated">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="rounded-full border border-gold-400/40 bg-gold-500/20 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-gold-300">
            {BASE_MASTER_MODE_LABELS[mode]}
          </span>

          <div className="flex items-center gap-1.5 rounded-control bg-primary-foreground/10 px-3 py-1.5">
            <Target className="h-4 w-4 text-secondary" aria-hidden="true" />
            <span className="text-sm font-bold leading-none">
              {current}
              <span className="font-normal text-primary-foreground/50">/{totalQuestions}</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="rounded-control bg-primary-foreground/10 px-3 py-1.5 text-center">
            <div className="text-[10px] font-medium uppercase tracking-wide text-primary-foreground/60">
              Pontos
            </div>
            <div className="font-mono text-lg font-bold leading-none text-secondary">
              {score.toLocaleString()}
            </div>
          </div>

          <div
            className={`rounded-control px-3 py-1.5 text-center ${
              combo >= 2
                ? 'animate-pulse border border-warning/40 bg-warning/30'
                : 'bg-primary-foreground/10'
            }`}
          >
            <div className="flex items-center gap-1 text-[10px] font-medium uppercase tracking-wide text-primary-foreground/60">
              <Flame className="h-3 w-3" aria-hidden="true" />
              Combo
            </div>
            <div
              className={`font-mono text-lg font-bold leading-none ${
                combo >= 2 ? 'text-warning' : 'text-primary-foreground'
              }`}
            >
              x{combo}
            </div>
          </div>

          <div className="hidden rounded-control bg-primary-foreground/10 px-3 py-1.5 text-center sm:block">
            <div className="text-[10px] font-medium uppercase tracking-wide text-primary-foreground/60">
              Acertos / Erros
            </div>
            <div className="font-mono text-sm font-bold leading-none">
              <span className="text-success">{correctAnswers}</span>
              <span className="text-primary-foreground/40"> / </span>
              <span className="text-danger">{incorrectAnswers}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <GameSoundToggle />

          <div className="flex items-center gap-1.5 rounded-control bg-primary-foreground/10 px-2.5 py-1.5">
            <Clock className="h-3.5 w-3.5 text-primary-foreground/60" aria-hidden="true" />
            <span className="font-mono text-sm font-bold">{formattedTime}</span>
          </div>

          <button
            type="button"
            onClick={onQuit}
            title="Encerrar e salvar o progresso"
            aria-label="Encerrar partida e salvar o progresso"
            className="flex h-8 w-8 items-center justify-center rounded-control bg-primary-foreground/10 transition-all hover:bg-primary-foreground/20"
          >
            <LogOut className="h-4 w-4 text-primary-foreground/60" />
          </button>
        </div>
      </div>

      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-primary-foreground/15">
        <div
          className="h-full rounded-full bg-secondary transition-all duration-500"
          style={{ width: `${progressPercent}%` }}
          role="progressbar"
          aria-label="Progresso das perguntas"
          aria-valuenow={current}
          aria-valuemin={1}
          aria-valuemax={totalQuestions}
        />
      </div>

      {hasTimeLimit && (
        <div className="mt-3 flex items-center gap-3">
          <div
            role="timer"
            aria-label={`${secondsLeft.toFixed(1)} segundos restantes`}
            className={`flex items-center gap-1.5 rounded-control px-2.5 py-1.5 font-mono text-sm font-bold ${
              isUrgent
                ? 'animate-pulse border border-danger/60 bg-danger/25'
                : 'bg-primary-foreground/10'
            }`}
          >
            <Timer className="h-3.5 w-3.5" aria-hidden="true" />
            {secondsLeft.toFixed(1)}s
          </div>

          <div className="h-2 flex-1 overflow-hidden rounded-full bg-primary-foreground/15">
            <div
              className={`h-full rounded-full transition-all duration-100 ease-linear ${
                isUrgent ? 'bg-danger' : 'bg-warning'
              }`}
              style={{ width: `${timerPercent}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
