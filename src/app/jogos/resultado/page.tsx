'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import confetti from 'canvas-confetti';
import { CELEBRATION_COLORS } from '@/theme/themes';
import {
  Award,
  Clock,
  Flame,
  Gamepad2,
  Home,
  RotateCcw,
  Sparkles,
  Target,
  Trophy,
  XCircle,
  CheckCircle2,
} from 'lucide-react';
import { usePlayer } from '@/hooks/usePlayer';
import { useGameStorage } from '@/hooks/useGameStorage';
import { formatTimeMMSS } from '@/lib/statistics/calculations';
import { getGameById } from '@/lib/games/registry';

export default function ResultadoPage() {
  const router = useRouter();
  const { player } = usePlayer();
  const { lastResult, records, isLoaded } = useGameStorage();
  const [isNewRecord, setIsNewRecord] = useState(false);

  useEffect(() => {
    if (isLoaded && lastResult) {
      const gameRecord = records[lastResult.gameId];
      // Verifica se a pontuação atual é igual à melhor pontuação registrada
      if (gameRecord && lastResult.score >= gameRecord.bestScore && lastResult.score > 0) {
        setIsNewRecord(true);
      }

      // Efeito de confetes festivo
      try {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.5 },
          colors: [...CELEBRATION_COLORS],
        });
      } catch {
        // Safe fallback
      }
    }
  }, [isLoaded, lastResult, records]);

  // Se não houver partida recente salva, redireciona para a lista de jogos
  if (isLoaded && !lastResult) {
    return (
      <div className="mx-auto max-w-md text-center py-16">
        <Trophy className="mx-auto h-16 w-16 text-gray-300" />
        <h1 className="mt-4 text-xl font-bold text-foreground">
          Nenhuma partida recente encontrada
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Inicie uma nova partida para visualizar suas pontuações e desempenho.
        </p>
        <Link
          href="/jogos"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white shadow-md hover:bg-primary transition-all"
        >
          <span>Ir para o Catálogo de Jogos</span>
        </Link>
      </div>
    );
  }

  /**
   * Métricas genéricas — a tela funciona para qualquer jogo da plataforma.
   * Cada jogo expõe suas métricas próprias; aqui só lemos o que existir.
   */
  const rawMetrics = (lastResult?.metrics ?? {}) as Record<string, unknown>;
  const matches =
    typeof rawMetrics.matches === 'number'
      ? rawMetrics.matches
      : typeof rawMetrics.correctDrinks === 'number'
        ? rawMetrics.correctDrinks
        : null;
  const errors =
    typeof rawMetrics.errors === 'number'
      ? rawMetrics.errors
      : typeof rawMetrics.incorrectDrinks === 'number'
        ? rawMetrics.incorrectDrinks
        : null;
  const bestStreak =
    typeof rawMetrics.bestStreak === 'number' ? rawMetrics.bestStreak : null;
  const moves = typeof rawMetrics.moves === 'number' ? rawMetrics.moves : null;

  const playedGame = lastResult ? getGameById(lastResult.gameId) : undefined;
  const gameName = playedGame?.nome ?? lastResult?.gameId ?? 'rodada';
  const replayHref = playedGame?.rota ?? '/jogos';

  return (
    <div className="mx-auto max-w-2xl py-4 animate-in fade-in zoom-in-95 duration-300">
      <div className="overflow-hidden rounded-3xl bg-surface border border-border shadow-2xl">
        {/* Banner Superior com a Cor Predominante #44100D */}
        <div className="relative bg-gradient-to-br from-brand-950 via-brand-900 to-brand-800 px-6 py-10 text-center text-white sm:px-10">
          <div className="absolute inset-0 bg-[radial-gradient(#C89D5C_1px,transparent_1px)] [background-size:16px_16px] opacity-10" />

          {/* Troféu ou Badge de Novo Recorde */}
          <div className="relative z-10 mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-overlay/10 border-2 border-gold-400/40 shadow-2xl">
            <Trophy className="h-10 w-10 text-gold-300 animate-bounce" />
          </div>

          {isNewRecord && (
            <div className="relative z-10 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-500 to-gold-400 px-4 py-1 text-xs font-black uppercase tracking-widest text-foreground shadow-lg mb-3">
              <Sparkles className="h-4 w-4" />
              <span>Novo Recorde Pessoal!</span>
            </div>
          )}

          <h1 className="relative z-10 font-serif text-2xl sm:text-4xl font-extrabold tracking-tight">
            PARABÉNS, {player ? player.nome.toUpperCase() : 'COLABORADOR'}!
          </h1>
          <p className="relative z-10 mt-1 text-sm text-gold-200/90 font-light">
            Você concluiu uma partida de {gameName}.
          </p>

          {/* Destaque da Pontuação Final */}
          <div className="relative z-10 mt-6 inline-block rounded-2xl bg-overlay/10 backdrop-blur-md px-8 py-4 border border-gold-400/30">
            <span className="block text-xs font-bold uppercase tracking-widest text-gold-300">
              Pontuação Final
            </span>
            <span className="font-serif text-4xl sm:text-5xl font-black text-white tracking-tight">
              {lastResult?.score.toLocaleString('pt-BR')}
            </span>
          </div>
        </div>

        {/* Grade de Estatísticas Detalhadas */}
        <div className="p-6 sm:p-8 space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {/* 1. TEMPO */}
            <div className="rounded-2xl bg-muted p-4 border border-border text-center">
              <div className="mx-auto mb-1.5 flex h-8 w-8 items-center justify-center rounded-lg bg-primary-soft text-foreground">
                <Clock className="h-4 w-4" />
              </div>
              <span className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Tempo
              </span>
              <span className="font-mono text-xl font-extrabold text-foreground">
                {formatTimeMMSS(lastResult?.durationSeconds || 0)}
              </span>
            </div>

            {/* 2. ACERTOS */}
            <div className="rounded-2xl bg-muted p-4 border border-border text-center">
              <div className="mx-auto mb-1.5 flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                <CheckCircle2 className="h-4 w-4" />
              </div>
              <span className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Acertos
              </span>
              <span className="text-xl font-extrabold text-emerald-700">
                {matches ?? '—'}
              </span>
            </div>

            {/* 3. ERROS */}
            <div className="rounded-2xl bg-muted p-4 border border-border text-center">
              <div className="mx-auto mb-1.5 flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-600">
                <XCircle className="h-4 w-4" />
              </div>
              <span className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Erros
              </span>
              <span className="text-xl font-extrabold text-red-600">
                {errors ?? '—'}
              </span>
            </div>

            {/* 4. PRECISÃO */}
            <div className="rounded-2xl bg-muted p-4 border border-border text-center">
              <div className="mx-auto mb-1.5 flex h-8 w-8 items-center justify-center rounded-lg bg-secondary-soft text-secondary">
                <Target className="h-4 w-4" />
              </div>
              <span className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Precisão
              </span>
              <span className="text-xl font-extrabold text-foreground">
                {lastResult?.accuracy}%
              </span>
            </div>
          </div>

          {/* Linha Secundária: Melhor Streak & Detalhes */}
          <div className="flex flex-wrap items-center justify-between rounded-2xl bg-secondary-soft/70 p-4 border border-gold-200 text-xs text-foreground">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500 text-white">
                <Flame className="w-4 h-4" />
              </div>
              <div>
                <span className="block font-bold">Melhor Sequência (Streak): {bestStreak ?? '—'}x</span>
                <span className="text-[11px] text-muted-foreground">Acertos consecutivos nesta rodada</span>
              </div>
            </div>

            <div className="text-right">
              <span className="block font-bold">Movimentos: {moves ?? '—'}</span>
              <span className="text-[11px] text-muted-foreground">Dificuldade: {lastResult?.difficulty.toUpperCase()}</span>
            </div>
          </div>

          {/* Botões de Ação Exigidos no Requisito 31 */}
          <div className="space-y-3 pt-2">
            <Link
              href={replayHref}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-primary hover:bg-primary px-6 py-4 text-base font-bold text-white shadow-lg transition-all active:scale-[0.99]"
            >
              <RotateCcw className="w-5 h-5 text-gold-300" />
              <span>Jogar Novamente</span>
            </Link>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Link
                href="/jogos"
                className="flex items-center justify-center gap-2 rounded-2xl bg-surface border border-border-strong hover:bg-muted px-4 py-3 text-sm font-semibold text-foreground transition-all"
              >
                <Gamepad2 className="w-4 h-4 text-secondary" />
                <span>Escolher Outro Jogo</span>
              </Link>

              <Link
                href="/"
                className="flex items-center justify-center gap-2 rounded-2xl bg-surface border border-border-strong hover:bg-muted px-4 py-3 text-sm font-semibold text-foreground transition-all"
              >
                <Home className="w-4 h-4 text-secondary" />
                <span>Voltar ao Início</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
