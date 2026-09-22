'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import {
  Brain,
  ChefHat,
  Clock,
  Flame,
  Gamepad2,
  Play,
  Sparkles,
  Target,
  Trophy,
  ArrowRight,
  History,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { usePlayer } from '@/hooks/usePlayer';
import { useGameStorage } from '@/hooks/useGameStorage';
import { getActiveGames, getAllGames, getGameById } from '@/lib/games/registry';
import { GameIcon } from '@/components/games/GameIcon';
import { CHART_COLORS } from '@/theme/themes';
import {
  calculateOverallStats,
  calculateScoreEvolution,
  formatTimeMMSS,
} from '@/lib/statistics/calculations';

export default function HomePage() {
  const { player } = usePlayer();
  const { history, isLoaded } = useGameStorage();

  const activeGames = useMemo(() => getActiveGames(), []);
  const allGames = useMemo(() => getAllGames(), []);

  const stats = useMemo(() => {
    return calculateOverallStats(history);
  }, [history]);

  const chartData = useMemo(() => {
    return calculateScoreEvolution(history).slice(-10); // Últimas 10 partidas
  }, [history]);

  const recentMatches = useMemo(() => {
    return history.slice(0, 5);
  }, [history]);


  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* =========================================================
          1. HERO / SAUDAÇÃO DO USUÁRIO
      ========================================================= */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-brand-950 via-brand-900 to-brand-850 p-6 sm:p-10 text-white shadow-xl border border-primary">
        <div className="absolute right-0 top-0 h-full w-1/3 bg-[radial-gradient(#C89D5C_1px,transparent_1px)] [background-size:20px_20px] opacity-10 pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-gold-500/20 px-3.5 py-1 text-xs font-semibold text-gold-300 border border-gold-400/30 mb-3">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Capacitação & Treinamento Gastronômico</span>
          </div>

          <h1 className="font-serif text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Olá, <span className="text-gold-300">{player ? player.nome : 'Colaborador'}</span>!
          </h1>
          <p className="mt-2 text-sm sm:text-base text-foreground/90 font-light leading-relaxed">
            Continue seu treinamento com o catálogo oficial. Domine pratos, ingredientes e descrições para proporcionar a melhor experiência ao cliente.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link
              href="/jogos/memoria"
              className="inline-flex items-center gap-2.5 rounded-2xl bg-gold-500 hover:bg-gold-400 px-6 py-3.5 text-sm font-bold text-foreground shadow-lg shadow-gold-500/20 transition-all hover:scale-105 active:scale-95"
            >
              <Play className="h-4 w-4 fill-brand-950" />
              <span>Jogar Jogo da Memória</span>
            </Link>

            <Link
              href="/jogos"
              className="inline-flex items-center gap-2 rounded-2xl bg-overlay/10 hover:bg-overlay/15 px-5 py-3.5 text-sm font-medium text-white border border-overlay/15 transition-all"
            >
              <Gamepad2 className="h-4 w-4 text-gold-300" />
              <span>Explorar Todos os Jogos</span>
            </Link>
          </div>
        </div>
      </section>

      {/* =========================================================
          2. RESUMO DE DESEMPENHO (MÉTRICAS)
      ========================================================= */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-widest text-foreground">
            Seu Resumo Geral
          </h2>
          <Link
            href="/perfil"
            className="flex items-center gap-1 text-xs font-semibold text-foreground hover:text-foreground transition-colors"
          >
            <span>Ver detalhes completos</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card: Partidas */}
          <div className="rounded-2xl bg-surface border border-border p-5 shadow-sm hover:border-gold-400/50 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Partidas
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-soft text-foreground">
                <Gamepad2 className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-3 text-2xl sm:text-3xl font-serif font-bold text-foreground">
              {isLoaded ? stats.totalGames : 0}
            </p>
            <span className="text-[11px] text-subtle-foreground">partidas concluídas</span>
          </div>

          {/* Card: Melhor Pontuação */}
          <div className="rounded-2xl bg-surface border border-border p-5 shadow-sm hover:border-gold-400/50 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Melhor Pontuação
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary-soft text-secondary">
                <Trophy className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-3 text-2xl sm:text-3xl font-serif font-bold text-foreground">
              {isLoaded ? stats.bestScore.toLocaleString('pt-BR') : 0}
            </p>
            <span className="text-[11px] text-secondary font-medium">recorde pessoal</span>
          </div>

          {/* Card: Precisão Média */}
          <div className="rounded-2xl bg-surface border border-border p-5 shadow-sm hover:border-gold-400/50 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Precisão Média
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                <Target className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-3 text-2xl sm:text-3xl font-serif font-bold text-foreground">
              {isLoaded ? `${stats.avgAccuracy}%` : '0%'}
            </p>
            <span className="text-[11px] text-emerald-700 font-medium">taxa de acerto</span>
          </div>

          {/* Card: Melhor Streak */}
          <div className="rounded-2xl bg-surface border border-border p-5 shadow-sm hover:border-gold-400/50 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Melhor Streak
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                <Flame className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-3 text-2xl sm:text-3xl font-serif font-bold text-foreground">
              {isLoaded ? `${stats.bestStreak}x` : '0x'}
            </p>
            <span className="text-[11px] text-amber-700 font-medium">acertos seguidos</span>
          </div>
        </div>
      </section>

      {/* =========================================================
          3. JOGOS DISPONÍVEIS (GAME REGISTRY DINÂMICO)
      ========================================================= */}
      <section>
        <div className="mb-4">
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-foreground">
            Jogos Disponíveis
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Cada modalidade utiliza o mesmo cardápio oficial para reforçar seu conhecimento
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {activeGames.map((game) => (
            <div
              key={game.id}
              className="group relative flex flex-col justify-between overflow-hidden rounded-3xl bg-surface border-2 border-border p-6 shadow-md hover:border-primary hover:shadow-xl transition-all"
            >
              <div className="absolute top-0 right-0 h-24 w-24 bg-gold-500/10 rounded-bl-full pointer-events-none" />

              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-900 to-brand-800 shadow-md">
                    <GameIcon name={game.icone} className="h-7 w-7 text-gold-300" />
                  </div>
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-bold text-emerald-800 border border-emerald-300">
                    Disponível
                  </span>
                </div>

                <h3 className="text-lg sm:text-xl font-serif font-bold text-foreground group-hover:text-foreground transition-colors">
                  {game.nome}
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  {game.descricao}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-border flex items-center justify-between">
                <span className="text-xs font-semibold text-secondary">
                  {game.categoria}
                </span>
                <Link
                  href={game.rota}
                  className="inline-flex items-center gap-2 rounded-xl bg-primary hover:bg-primary px-4 py-2.5 text-xs font-bold text-white shadow transition-all active:scale-95"
                >
                  <Play className="h-3.5 w-3.5 fill-white" />
                  <span>Jogar Agora</span>
                </Link>
              </div>
            </div>
          ))}

          {/* Card de Jogos Futuros (Extensibilidade Arquitetural) */}
          {allGames
            .filter((g) => !g.ativo)
            .slice(0, 2)
            .map((game) => (
              <div
                key={game.id}
                className="flex flex-col justify-between rounded-3xl bg-muted/60 border border-dashed border-border-strong p-6 opacity-75"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                      <GameIcon name={game.icone} className="h-7 w-7 text-gold-300" />
                    </div>
                    <span className="rounded-full bg-muted px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      Em Breve
                    </span>
                  </div>

                  <h3 className="text-lg font-serif font-bold text-foreground">
                    {game.nome}
                  </h3>
                  <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                    {game.descricao}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-border text-xs text-subtle-foreground italic">
                  Arquitetura integrada pronta para lançamento
                </div>
              </div>
            ))}
        </div>
      </section>

      {/* =========================================================
          4. GRÁFICO RESUMIDO DE DESEMPENHO & ÚLTIMAS PARTIDAS
      ========================================================= */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráfico Resumido */}
        <div className="lg:col-span-2 rounded-3xl bg-surface border border-border p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-serif font-bold text-foreground">
                Evolução da Pontuação Recente
              </h2>
              <p className="text-xs text-muted-foreground">
                Progresso das suas últimas partidas concluídas
              </p>
            </div>
            <Link
              href="/perfil"
              className="text-xs font-semibold text-foreground hover:underline"
            >
              Ver todos os gráficos
            </Link>
          </div>

          {chartData.length > 0 ? (
            <div className="h-56 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="scoreColorHome" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={CHART_COLORS.primary} stopOpacity={0.4} />
                      <stop offset="95%" stopColor={CHART_COLORS.primary} stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="matchIndex"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11, fill: CHART_COLORS.axis }}
                    tickFormatter={(val) => `P${val}`}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11, fill: CHART_COLORS.axis }}
                  />
                  <Tooltip
                    formatter={(val: any) => [
                      `${Number(val || 0).toLocaleString('pt-BR')} pts`,
                      'Pontuação',
                    ]}
                    labelFormatter={(label) => `Partida ${label}`}
                    contentStyle={{
                      backgroundColor: CHART_COLORS.tooltipBackground,
                      borderRadius: '12px',
                      color: CHART_COLORS.tooltipText,
                      fontSize: '12px',
                      border: `1px solid ${CHART_COLORS.tooltipBorder}`,
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="score"
                    stroke={CHART_COLORS.primary}
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#scoreColorHome)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-56 text-center p-6 bg-muted/60 rounded-2xl border border-border">
              <Brain className="h-10 w-10 text-gold-500/60 mb-2" />
              <p className="text-sm font-semibold text-foreground">
                Ainda não há partidas registradas
              </p>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                Jogue sua primeira partida do Jogo da Memória para começar a visualizar o gráfico da sua evolução!
              </p>
              <Link
                href="/jogos/memoria"
                className="mt-4 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white hover:bg-primary transition-colors"
              >
                Começar Primeira Partida
              </Link>
            </div>
          )}
        </div>

        {/* Últimas Partidas */}
        <div className="rounded-3xl bg-surface border border-border p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-serif font-bold text-foreground flex items-center gap-2">
                <History className="w-4 h-4 text-secondary" />
                <span>Últimas Partidas</span>
              </h2>
            </div>

            {recentMatches.length > 0 ? (
              <div className="space-y-3">
                {recentMatches.map((match) => (
                  <div
                    key={match.id}
                    className="flex items-center justify-between rounded-xl bg-muted p-3 border border-border"
                  >
                    <div>
                      <span className="block text-xs font-bold text-foreground">
                        {getGameById(match.gameId)?.nome ?? match.gameId}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(match.playedAt).toLocaleDateString('pt-BR')} • {formatTimeMMSS(match.durationSeconds)}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="block font-serif text-sm font-extrabold text-foreground">
                        {match.score.toLocaleString('pt-BR')} pts
                      </span>
                      <span className="text-[10px] font-semibold text-emerald-700">
                        {match.accuracy}% precisão
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground italic py-8 text-center">
                Nenhuma partida recente registrada.
              </p>
            )}
          </div>

          {recentMatches.length > 0 && (
            <div className="mt-4 pt-4 border-t border-border text-center">
              <Link
                href="/perfil"
                className="text-xs font-bold text-foreground hover:text-foreground"
              >
                Ver histórico completo →
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
