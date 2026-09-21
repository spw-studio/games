'use client';

import { Clock, Zap, X, Lightbulb, Search } from 'lucide-react';

interface WordSearchHUDProps {
  foundCount: number;
  totalCount: number;
  score: number;
  streak: number;
  formattedTime: string;
  hintsUsed: number;
  wrongAttempts: number;
  onHint: () => void;
  onQuit: () => void;
  canHint: boolean;
}

export function WordSearchHUD({
  foundCount,
  totalCount,
  score,
  streak,
  formattedTime,
  hintsUsed,
  wrongAttempts,
  onHint,
  onQuit,
  canHint,
}: WordSearchHUDProps) {
  const progressPercent = totalCount > 0 ? Math.round((foundCount / totalCount) * 100) : 0;

  return (
    <div className="rounded-card bg-primary text-primary-foreground p-4 shadow-elevated">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        {/* Left: Progress */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center gap-1.5 bg-white/10 rounded-xl px-3 py-2">
            <Search className="h-4 w-4 text-secondary shrink-0" />
            <span className="font-bold text-lg text-primary-foreground leading-none">
              {foundCount}
              <span className="text-primary-foreground/50 font-normal text-sm">/{totalCount}</span>
            </span>
          </div>

          {/* Progress bar */}
          <div className="hidden sm:block w-24 h-2 bg-primary-foreground/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-secondary rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Center: Score + Streak */}
        <div className="flex items-center gap-2">
          <div className="text-center bg-primary-foreground/10 rounded-control px-3 py-1.5">
            <div className="text-xs text-primary-foreground/60 font-medium uppercase tracking-wide">Pontos</div>
            <div className="font-bold text-lg text-secondary leading-none">{score.toLocaleString()}</div>
          </div>

          {streak >= 2 && (
            <div className="flex items-center gap-1 bg-warning/30 border border-warning/40 rounded-control px-2 py-1.5 animate-pulse">
              <Zap className="h-3.5 w-3.5 text-warning" />
              <span className="text-xs font-bold text-warning">{streak}x</span>
            </div>
          )}
        </div>

        {/* Right: Timer + Controls */}
        <div className="flex items-center gap-2">
          {/* Wrong attempts */}
          {wrongAttempts > 0 && (
            <div className="flex items-center gap-1 text-danger text-xs font-medium bg-danger/20 rounded-control px-2 py-1">
              <X className="h-3 w-3" />
              <span>{wrongAttempts}</span>
            </div>
          )}

          {/* Timer */}
          <div className="flex items-center gap-1.5 bg-primary-foreground/10 rounded-control px-2.5 py-1.5">
            <Clock className="h-3.5 w-3.5 text-primary-foreground/60" />
            <span className="font-mono text-sm font-bold">{formattedTime}</span>
          </div>

          {/* Hint */}
          <button
            onClick={onHint}
            disabled={!canHint}
            title="Usar dica (revela uma palavra)"
            className="flex items-center gap-1.5 bg-warning/20 hover:bg-warning/40 border border-warning/30 disabled:opacity-40 disabled:cursor-not-allowed rounded-control px-2.5 py-1.5 transition-all"
          >
            <Lightbulb className="h-3.5 w-3.5 text-warning" />
            <span className="text-xs font-medium text-warning hidden sm:inline">
              {hintsUsed > 0 ? `${hintsUsed}` : 'Dica'}
            </span>
          </button>

          {/* Quit */}
          <button
            onClick={onQuit}
            className="flex items-center justify-center h-8 w-8 bg-primary-foreground/10 hover:bg-primary-foreground/20 rounded-control transition-all"
            title="Encerrar partida"
          >
            <X className="h-4 w-4 text-primary-foreground/60" />
          </button>
        </div>
      </div>
    </div>
  );
}
