'use client';

import { Clock, Flame, RotateCcw, Target, Trophy, XCircle } from 'lucide-react';
import { GameDifficulty } from '@/types/game';
import { GameSoundToggle } from '@/components/audio/GameSoundToggle';

interface MemoryHUDProps {
  score: number;
  matches: number;
  totalPairs: number;
  timeFormatted: string;
  errors: number;
  streak: number;
  difficulty: GameDifficulty;
  categoryName?: string;
  onRestart: () => void;
}

export function MemoryHUD({
  score,
  matches,
  totalPairs,
  timeFormatted,
  errors,
  streak,
  difficulty,
  categoryName,
  onRestart,
}: MemoryHUDProps) {
  const difficultyLabels: Record<GameDifficulty, { label: string; color: string }> = {
    facil: { label: 'Fácil (1.0x)', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
    medio: { label: 'Médio (1.5x)', color: 'bg-amber-100 text-amber-800 border-amber-300' },
    dificil: { label: 'Difícil (2.0x)', color: 'bg-red-100 text-red-800 border-red-300' },
  };

  return (
    <div className="w-full shrink-0 rounded-xl bg-surface/95 border border-border px-2.5 py-1.5 sm:px-4 sm:py-2 shadow-sm">
      {/* Layout Mobile: 2 micro-linhas | Layout Desktop (sm+): 1 única linha */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 sm:gap-3">
        {/* Topo / Esquerda: Título, Categoria e Controles no mobile */}
        <div className="flex items-center justify-between sm:justify-start gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="font-serif text-xs font-bold text-foreground truncate">
              Jogo da Memória
            </span>
            {categoryName && (
              <span className="hidden md:inline-block rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-foreground truncate max-w-[120px]">
                {categoryName}
              </span>
            )}
            <span
              className={`rounded-full border px-1.5 py-0.2 text-[9px] font-bold uppercase ${difficultyLabels[difficulty].color}`}
            >
              {difficultyLabels[difficulty].label}
            </span>
          </div>

          {/* Controles no mobile (no desktop ficam na extrema direita) */}
          <div className="flex sm:hidden items-center gap-1">
            <GameSoundToggle />
            <button
              onClick={onRestart}
              className="flex items-center gap-1 rounded-md p-1 text-[11px] font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              title="Reiniciar partida"
              aria-label="Reiniciar partida"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Estatísticas Centrais (Pares, Pontos, Tempo, Erros, Streak) */}
        <div className="flex items-center justify-between sm:justify-center gap-1.5 sm:gap-2.5 overflow-x-auto py-0.5">
          {/* 1. PARES */}
          <div
            className="flex items-center gap-1 rounded-lg bg-muted/70 border border-border px-2 py-0.5 text-xs shrink-0"
            title="Pares encontrados"
          >
            <Target className="w-3.5 h-3.5 text-primary shrink-0" />
            <span className="text-[10px] uppercase font-bold text-muted-foreground hidden lg:inline">Pares</span>
            <span className="font-bold text-foreground">
              {matches}<span className="text-[10px] font-normal text-muted-foreground">/{totalPairs}</span>
            </span>
          </div>

          {/* 2. PONTOS */}
          <div
            className="flex items-center gap-1 rounded-lg bg-gradient-to-r from-brand-900 to-brand-800 text-white px-2 py-0.5 text-xs shadow-xs shrink-0"
            title="Pontuação"
          >
            <Trophy className="w-3.5 h-3.5 text-gold-300 shrink-0" />
            <span className="text-[10px] uppercase font-bold text-gold-300/80 hidden lg:inline">Pontos</span>
            <span className="font-bold text-gold-200">
              {score.toLocaleString('pt-BR')}
            </span>
          </div>

          {/* 3. TEMPO */}
          <div
            className="flex items-center gap-1 rounded-lg bg-muted/70 border border-border px-2 py-0.5 text-xs shrink-0"
            title="Tempo"
          >
            <Clock className="w-3.5 h-3.5 text-primary shrink-0" />
            <span className="font-mono font-bold text-foreground">
              {timeFormatted}
            </span>
          </div>

          {/* 4. ERROS */}
          <div
            className="flex items-center gap-1 rounded-lg bg-muted/70 border border-border px-1.5 sm:px-2 py-0.5 text-xs shrink-0"
            title="Erros cometidos"
          >
            <XCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />
            <span className="font-bold text-foreground">{errors}</span>
          </div>

          {/* 5. STREAK */}
          <div
            className={`flex items-center gap-1 rounded-lg px-1.5 sm:px-2 py-0.5 text-xs transition-colors shrink-0 ${
              streak > 1
                ? 'bg-amber-500/15 border border-amber-500/40 text-amber-700 font-extrabold animate-pulse'
                : 'bg-muted/70 border border-border text-muted-foreground'
            }`}
            title="Sequência de acertos"
          >
            <Flame className={`w-3.5 h-3.5 ${streak > 1 ? 'text-amber-600 fill-amber-500' : 'text-muted-foreground'}`} />
            <span>{streak}x</span>
          </div>
        </div>

        {/* Controles no Desktop (sm+) */}
        <div className="hidden sm:flex items-center gap-1.5 shrink-0">
          <GameSoundToggle />
          <button
            onClick={onRestart}
            className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            title="Reiniciar esta partida"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reiniciar</span>
          </button>
        </div>
      </div>
    </div>
  );
}
