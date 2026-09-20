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
    <div className="rounded-2xl bg-gradient-to-r from-brand-950 to-brand-900 text-white p-4 shadow-xl">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        {/* Left: Progress */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center gap-1.5 bg-white/10 rounded-xl px-3 py-2">
            <Search className="h-4 w-4 text-gold-300 shrink-0" />
            <span className="font-bold text-lg text-white leading-none">
              {foundCount}
              <span className="text-white/50 font-normal text-sm">/{totalCount}</span>
            </span>
          </div>

          {/* Progress bar */}
          <div className="hidden sm:block w-24 h-2 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-gold-400 to-gold-300 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Center: Score + Streak */}
        <div className="flex items-center gap-2">
          <div className="text-center bg-white/10 rounded-xl px-3 py-1.5">
            <div className="text-xs text-white/60 font-medium uppercase tracking-wide">Pontos</div>
            <div className="font-bold text-lg text-gold-300 leading-none">{score.toLocaleString()}</div>
          </div>

          {streak >= 2 && (
            <div className="flex items-center gap-1 bg-amber-500/30 border border-amber-400/40 rounded-xl px-2 py-1.5 animate-pulse">
              <Zap className="h-3.5 w-3.5 text-amber-300" />
              <span className="text-xs font-bold text-amber-300">{streak}x</span>
            </div>
          )}
        </div>

        {/* Right: Timer + Controls */}
        <div className="flex items-center gap-2">
          {/* Wrong attempts */}
          {wrongAttempts > 0 && (
            <div className="flex items-center gap-1 text-rose-300 text-xs font-medium bg-rose-500/20 rounded-lg px-2 py-1">
              <X className="h-3 w-3" />
              <span>{wrongAttempts}</span>
            </div>
          )}

          {/* Timer */}
          <div className="flex items-center gap-1.5 bg-white/10 rounded-xl px-2.5 py-1.5">
            <Clock className="h-3.5 w-3.5 text-white/60" />
            <span className="font-mono text-sm font-bold">{formattedTime}</span>
          </div>

          {/* Hint */}
          <button
            onClick={onHint}
            disabled={!canHint}
            title="Usar dica (revela uma palavra)"
            className="flex items-center gap-1.5 bg-amber-500/20 hover:bg-amber-500/40 border border-amber-400/30 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl px-2.5 py-1.5 transition-all"
          >
            <Lightbulb className="h-3.5 w-3.5 text-amber-300" />
            <span className="text-xs font-medium text-amber-300 hidden sm:inline">
              {hintsUsed > 0 ? `${hintsUsed}` : 'Dica'}
            </span>
          </button>

          {/* Quit */}
          <button
            onClick={onQuit}
            className="flex items-center justify-center h-8 w-8 bg-white/10 hover:bg-white/20 rounded-xl transition-all"
            title="Encerrar partida"
          >
            <X className="h-4 w-4 text-white/60" />
          </button>
        </div>
      </div>
    </div>
  );
}
