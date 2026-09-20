'use client';

import { Trophy, Clock, Flame, CheckCircle2, XCircle, RotateCcw } from 'lucide-react';

interface DrinkAssemblyHUDProps {
  currentIndex: number;
  totalDrinks: number;
  score: number;
  correctDrinks: number;
  incorrectDrinks: number;
  streak: number;
  formattedTime: string;
  onQuit?: () => void;
}

export function DrinkAssemblyHUD({
  currentIndex,
  totalDrinks,
  score,
  correctDrinks,
  incorrectDrinks,
  streak,
  formattedTime,
  onQuit,
}: DrinkAssemblyHUDProps) {
  const currentNumber = Math.min(currentIndex + 1, totalDrinks);
  const progressPercent = Math.round((currentNumber / totalDrinks) * 100);

  return (
    <div className="rounded-3xl bg-white border border-cream-300 p-4 sm:p-5 shadow-lg space-y-3">
      {/* Topo do HUD: Progresso e Contador */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-gold-700">
            Progresso
          </span>
          <span className="text-sm sm:text-base font-bold font-mono text-brand-950">
            Drink {currentNumber} de {totalDrinks}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {(correctDrinks > 0 || incorrectDrinks > 0) && onQuit && (
            <button
              type="button"
              onClick={onQuit}
              className="inline-flex items-center gap-1.5 rounded-xl bg-gold-500/10 hover:bg-gold-500/20 text-gold-800 border border-gold-400/40 px-3 py-1 text-xs font-semibold transition-all cursor-pointer"
              title="Salva as rodadas concluídas e finaliza a partida"
            >
              <span>Encerrar e Salvar</span>
            </button>
          )}

          {onQuit && (
            <button
              type="button"
              onClick={onQuit}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-brand-900 transition-colors cursor-pointer"
              title="Voltar ao início"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Reiniciar</span>
            </button>
          )}
        </div>
      </div>

      {/* Barra de Progresso Suave */}
      <div className="h-2 w-full overflow-hidden rounded-full bg-cream-200">
        <div
          className="h-full bg-gradient-to-r from-brand-900 via-amber-600 to-gold-400 transition-all duration-300 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Grid de Estatísticas em Tempo Real */}
      <div className="grid grid-cols-5 gap-2 pt-1">
        {/* Pontuação */}
        <div className="flex flex-col items-center justify-center p-2 rounded-2xl bg-cream-100/70 border border-cream-200">
          <div className="flex items-center gap-1 text-gold-700 text-[11px] font-bold uppercase tracking-wider">
            <Trophy className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Pontos</span>
          </div>
          <span className="text-sm sm:text-lg font-bold font-mono text-brand-950">
            {score}
          </span>
        </div>

        {/* Acertos */}
        <div className="flex flex-col items-center justify-center p-2 rounded-2xl bg-emerald-50 border border-emerald-200">
          <div className="flex items-center gap-1 text-emerald-700 text-[11px] font-bold uppercase tracking-wider">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Acertos</span>
          </div>
          <span className="text-sm sm:text-lg font-bold font-mono text-emerald-900">
            {correctDrinks}
          </span>
        </div>

        {/* Erros */}
        <div className="flex flex-col items-center justify-center p-2 rounded-2xl bg-rose-50 border border-rose-200">
          <div className="flex items-center gap-1 text-rose-700 text-[11px] font-bold uppercase tracking-wider">
            <XCircle className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Erros</span>
          </div>
          <span className="text-sm sm:text-lg font-bold font-mono text-rose-900">
            {incorrectDrinks}
          </span>
        </div>

        {/* Sequência (Streak) */}
        <div className="flex flex-col items-center justify-center p-2 rounded-2xl bg-amber-50 border border-amber-200">
          <div className="flex items-center gap-1 text-amber-700 text-[11px] font-bold uppercase tracking-wider">
            <Flame className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Combo</span>
          </div>
          <span className="text-sm sm:text-lg font-bold font-mono text-amber-900">
            {streak}
          </span>
        </div>

        {/* Tempo */}
        <div className="flex flex-col items-center justify-center p-2 rounded-2xl bg-brand-50 border border-brand-200">
          <div className="flex items-center gap-1 text-brand-700 text-[11px] font-bold uppercase tracking-wider">
            <Clock className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Tempo</span>
          </div>
          <span className="text-sm sm:text-lg font-bold font-mono text-brand-950">
            {formattedTime}
          </span>
        </div>
      </div>
    </div>
  );
}
