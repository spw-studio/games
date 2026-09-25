'use client';

import { Clock, Flame, LogOut, Target } from 'lucide-react';
import { GameSoundToggle } from '@/components/audio/GameSoundToggle';

interface QuizHUDProps {
  currentIndex: number;
  totalQuestions: number;
  score: number;
  streak: number;
  correctAnswers: number;
  formattedTime: string;
  /** Encerra e salva o progresso atual (habilitado sempre). */
  onQuit: () => void;
}

/**
 * Barra superior da partida: progresso das perguntas, pontuação, sequência,
 * tempo total, som e saída — mesmos padrões visuais dos demais jogos.
 */
export function QuizHUD({
  currentIndex,
  totalQuestions,
  score,
  streak,
  correctAnswers,
  formattedTime,
  onQuit,
}: QuizHUDProps) {
  const current = Math.min(currentIndex + 1, totalQuestions);
  const progressPercent = totalQuestions > 0 ? (current / totalQuestions) * 100 : 0;

  return (
    <div className="rounded-card bg-primary text-primary-foreground p-4 shadow-elevated">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Progresso das perguntas */}
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex items-center gap-1.5 rounded-xl bg-overlay/10 px-3 py-2">
            <Target className="h-4 w-4 shrink-0 text-secondary" />
            <span className="text-lg font-bold leading-none">
              {current}
              <span className="text-sm font-normal text-primary-foreground/50">
                /{totalQuestions}
              </span>
            </span>
          </div>

          <div className="hidden h-2 w-24 overflow-hidden rounded-full bg-primary-foreground/20 sm:block">
            <div
              className="h-full rounded-full bg-secondary transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
              role="progressbar"
              aria-label="Progresso do quiz"
              aria-valuenow={current}
              aria-valuemin={1}
              aria-valuemax={totalQuestions}
            />
          </div>
        </div>

        {/* Pontuação, acertos e sequência */}
        <div className="flex items-center gap-2">
          <div className="rounded-control bg-primary-foreground/10 px-3 py-1.5 text-center">
            <div className="text-xs font-medium uppercase tracking-wide text-primary-foreground/60">
              Pontos
            </div>
            <div className="text-lg font-bold leading-none text-secondary">
              {score.toLocaleString()}
            </div>
          </div>

          <div className="hidden rounded-control bg-primary-foreground/10 px-3 py-1.5 text-center sm:block">
            <div className="text-xs font-medium uppercase tracking-wide text-primary-foreground/60">
              Acertos
            </div>
            <div className="text-lg font-bold leading-none text-secondary">
              {correctAnswers}
            </div>
          </div>

          {streak >= 2 && (
            <div className="flex animate-pulse items-center gap-1 rounded-control border border-warning/40 bg-warning/30 px-2 py-1.5">
              <Flame className="h-3.5 w-3.5 text-warning" />
              <span className="text-xs font-bold text-warning">{streak}x</span>
            </div>
          )}
        </div>

        {/* Tempo, som e saída */}
        <div className="flex items-center gap-2">
          <GameSoundToggle />

          <div className="flex items-center gap-1.5 rounded-control bg-primary-foreground/10 px-2.5 py-1.5">
            <Clock className="h-3.5 w-3.5 text-primary-foreground/60" />
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
    </div>
  );
}
