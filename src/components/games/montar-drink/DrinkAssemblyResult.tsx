'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import confetti from 'canvas-confetti';
import {
  Trophy,
  RotateCcw,
  Sparkles,
  Target,
  Flame,
  Clock,
  CheckCircle2,
  XCircle,
  Wine,
  Gamepad2,
  Home,
} from 'lucide-react';
import { DrinkAssemblyMetrics } from '@/types/grouping';
import { formatTimeMMSS } from '@/lib/statistics/calculations';

interface DrinkAssemblyResultProps {
  score: number;
  metrics: DrinkAssemblyMetrics;
  onPlayAgain: () => void;
}

export function DrinkAssemblyResult({
  score,
  metrics,
  onPlayAgain,
}: DrinkAssemblyResultProps) {
  useEffect(() => {
    try {
      confetti({
        particleCount: 90,
        spread: 60,
        origin: { y: 0.5 },
        colors: ['#44100D', '#C89D5C', '#10B981', '#F59E0B'],
      });
    } catch {
      // Safe fallback se canvas-confetti não puder rodar
    }
  }, []);

  return (
    <div className="mx-auto max-w-2xl py-4 animate-in fade-in zoom-in-95 duration-300">
      <div className="overflow-hidden rounded-3xl bg-white border border-cream-300 shadow-2xl">
        {/* Banner Superior Nobre #44100D */}
        <div className="relative bg-gradient-to-br from-brand-950 via-brand-900 to-brand-800 px-6 py-10 text-center text-white sm:px-10">
          <div className="absolute inset-0 bg-[radial-gradient(#C89D5C_1px,transparent_1px)] [background-size:16px_16px] opacity-10" />

          <div className="relative z-10 mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-white/10 border-2 border-gold-400/40 shadow-2xl backdrop-blur-sm">
            <Trophy className="h-10 w-10 text-gold-300 animate-bounce" />
          </div>

          <div className="relative z-10 inline-flex items-center gap-1.5 rounded-full bg-gold-500/20 border border-gold-400/40 px-4 py-1 text-xs font-bold uppercase tracking-widest text-gold-300 mb-2">
            <Sparkles className="h-4 w-4" />
            <span>Treinamento de Bar Finalizado</span>
          </div>

          <h1 className="relative z-10 text-3xl sm:text-4xl font-serif font-bold tracking-tight">
            Partida Concluída!
          </h1>

          <div className="relative z-10 mt-4 flex items-center justify-center gap-2">
            <span className="text-4xl sm:text-5xl font-mono font-black text-gold-300">
              {score}
            </span>
            <span className="text-xs uppercase tracking-wider font-bold text-cream-200/80">
              pontos
            </span>
          </div>
        </div>

        {/* Grade de Estatísticas da Partida */}
        <div className="p-6 sm:p-8 space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
            {/* Total de Drinks */}
            <div className="p-4 rounded-2xl bg-cream-100/70 border border-cream-200 text-center">
              <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-gray-500 mb-1">
                <Wine className="h-4 w-4 text-brand-900" />
                <span>Drinks</span>
              </div>
              <span className="text-2xl font-bold font-mono text-brand-950">
                {metrics.totalDrinks}
              </span>
            </div>

            {/* Acertos */}
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-center">
              <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-emerald-700 mb-1">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>Acertos</span>
              </div>
              <span className="text-2xl font-bold font-mono text-emerald-900">
                {metrics.correctDrinks}
              </span>
            </div>

            {/* Erros */}
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-center">
              <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-rose-700 mb-1">
                <XCircle className="h-4 w-4 text-rose-600" />
                <span>Erros</span>
              </div>
              <span className="text-2xl font-bold font-mono text-rose-900">
                {metrics.incorrectDrinks}
              </span>
            </div>

            {/* Precisão */}
            <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-center">
              <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-blue-700 mb-1">
                <Target className="h-4 w-4 text-blue-600" />
                <span>Precisão</span>
              </div>
              <span className="text-2xl font-bold font-mono text-blue-950">
                {metrics.accuracy}%
              </span>
            </div>

            {/* Melhor Sequência */}
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-center">
              <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-amber-700 mb-1">
                <Flame className="h-4 w-4 text-amber-600" />
                <span>Melhor Sequência</span>
              </div>
              <span className="text-2xl font-bold font-mono text-amber-900">
                {metrics.bestStreak}
              </span>
            </div>

            {/* Tempo */}
            <div className="p-4 rounded-2xl bg-brand-50 border border-brand-200 text-center">
              <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-brand-700 mb-1">
                <Clock className="h-4 w-4 text-brand-800" />
                <span>Tempo</span>
              </div>
              <span className="text-2xl font-bold font-mono text-brand-950">
                {formatTimeMMSS(metrics.durationSeconds)}
              </span>
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="button"
              onClick={onPlayAgain}
              className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-brand-900 hover:bg-brand-950 text-gold-300 border border-gold-400/40 px-6 py-4 text-base font-bold shadow-lg transition-all active:scale-95 cursor-pointer"
            >
              <RotateCcw className="h-5 w-5" />
              <span>Jogar novamente</span>
            </button>

            <Link
              href="/perfil"
              className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-gold-400 hover:brightness-105 text-brand-950 font-bold px-6 py-4 text-base shadow-md transition-all active:scale-95"
            >
              <Trophy className="h-5 w-5 text-brand-950" />
              <span>Ver Desempenho</span>
            </Link>

            <Link
              href="/jogos"
              className="flex items-center justify-center gap-2 rounded-2xl bg-cream-100 hover:bg-cream-200 text-brand-950 border border-cream-300 px-5 py-4 text-base font-bold transition-all active:scale-95"
            >
              <Gamepad2 className="h-5 w-5 text-brand-800" />
              <span>Outro jogo</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
