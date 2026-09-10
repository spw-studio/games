'use client';

import { Clock, Flame, RotateCcw, Target, Trophy, XCircle } from 'lucide-react';
import { GameDifficulty } from '@/types/game';

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
    <div className="w-full rounded-2xl bg-white border border-cream-300 p-4 shadow-sm">
      {/* Barra superior de contexto */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-cream-200 pb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-900">
            Jogo da Memória Gastronômico
          </span>
          {categoryName && (
            <span className="rounded-full bg-cream-200 px-2.5 py-0.5 text-[11px] font-semibold text-brand-900">
              {categoryName}
            </span>
          )}
          <span
            className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase ${difficultyLabels[difficulty].color}`}
          >
            {difficultyLabels[difficulty].label}
          </span>
        </div>

        <button
          onClick={onRestart}
          className="flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold text-gray-600 hover:bg-cream-100 hover:text-brand-900 transition-colors"
          title="Reiniciar esta partida"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reiniciar</span>
        </button>
      </div>

      {/* Grid de Métricas Principais (PONTOS, PARES, TEMPO, ERROS, STREAK) */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-3">
        {/* 1. PONTUAÇÃO */}
        <div className="flex items-center gap-3 rounded-xl bg-gradient-to-br from-brand-900 to-brand-800 p-3 text-white shadow-sm">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-gold-300">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-[10px] font-bold uppercase tracking-wider text-gold-300/80">
              Pontos
            </span>
            <span className="font-serif text-lg sm:text-xl font-extrabold text-white">
              {score.toLocaleString('pt-BR')}
            </span>
          </div>
        </div>

        {/* 2. PARES ENCONTRADOS */}
        <div className="flex items-center gap-3 rounded-xl bg-cream-100/70 border border-cream-200 p-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-800 text-gold-200">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-500">
              Pares
            </span>
            <span className="text-base sm:text-lg font-bold text-brand-900">
              {matches} <span className="text-xs font-normal text-gray-400">/ {totalPairs}</span>
            </span>
          </div>
        </div>

        {/* 3. TEMPO */}
        <div className="flex items-center gap-3 rounded-xl bg-cream-100/70 border border-cream-200 p-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-800 text-gold-200">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-500">
              Tempo
            </span>
            <span className="font-mono text-base sm:text-lg font-bold text-brand-900">
              {timeFormatted}
            </span>
          </div>
        </div>

        {/* 4. ERROS */}
        <div className="flex items-center gap-3 rounded-xl bg-cream-100/70 border border-cream-200 p-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 text-red-600 border border-red-200">
            <XCircle className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-500">
              Erros
            </span>
            <span className="text-base sm:text-lg font-bold text-gray-800">
              {errors}
            </span>
          </div>
        </div>

        {/* 5. STREAK */}
        <div className="col-span-2 sm:col-span-1 flex items-center gap-3 rounded-xl bg-gold-50/80 border border-gold-300/50 p-3">
          <div className={`flex h-9 w-9 items-center justify-center rounded-lg transition-transform ${streak > 1 ? 'scale-110' : ''} bg-amber-500 text-white shadow-sm`}>
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-[10px] font-bold uppercase tracking-wider text-gold-800">
              Streak
            </span>
            <span className="text-base sm:text-lg font-extrabold text-amber-700">
              {streak}x
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
