'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import {
  Award,
  Clock,
  Flame,
  Gamepad2,
  History,
  RotateCcw,
  Target,
  Trash2,
  Trophy,
  User,
  Edit2,
  TrendingUp,
} from 'lucide-react';
import { usePlayer } from '@/hooks/usePlayer';
import { useGameStorage } from '@/hooks/useGameStorage';
import { getAllGames } from '@/lib/games/registry';
import {
  calculateAccuracyEvolution,
  calculateOverallStats,
  calculateScoreEvolution,
  calculateTimeEvolution,
  formatTimeMMSS,
} from '@/lib/statistics/calculations';
import { PlayerModal } from '@/components/ui/PlayerModal';

export default function PerfilPage() {
  const { player, setPlayerName } = usePlayer();
  const { history, records, isLoaded, clearAll } = useGameStorage();
  const [selectedGameFilter, setSelectedGameFilter] = useState<string>('todos');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'score' | 'accuracy' | 'time'>('score');

  const games = useMemo(() => getAllGames(), []);

  // Estatísticas calculadas
  const stats = useMemo(() => {
    return calculateOverallStats(
      history,
      selectedGameFilter === 'todos' ? undefined : selectedGameFilter
    );
  }, [history, selectedGameFilter]);

  // Séries temporais para gráficos Recharts
  const scoreData = useMemo(() => {
    return calculateScoreEvolution(
      history,
      selectedGameFilter === 'todos' ? undefined : selectedGameFilter
    );
  }, [history, selectedGameFilter]);

  const accuracyData = useMemo(() => {
    return calculateAccuracyEvolution(
      history,
      selectedGameFilter === 'todos' ? undefined : selectedGameFilter
    );
  }, [history, selectedGameFilter]);

  const timeData = useMemo(() => {
    return calculateTimeEvolution(
      history,
      selectedGameFilter === 'todos' ? undefined : selectedGameFilter
    );
  }, [history, selectedGameFilter]);

  const hasData = history.length > 0;

  const handleClearData = () => {
    if (window.confirm('Tem certeza que deseja limpar todo o seu histórico de partidas e estatísticas locais?')) {
      clearAll();
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* =========================================================
          CABEÇALHO DO PERFIL
      ========================================================= */}
      <div className="rounded-3xl bg-gradient-to-r from-brand-950 via-brand-900 to-brand-850 p-6 sm:p-10 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4 sm:gap-6">
          <div className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-3xl bg-white/10 border-2 border-gold-400/40 text-gold-300 shadow-inner">
            <User className="h-8 w-8 sm:h-10 sm:w-10" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-white">
                {player ? player.nome : 'Colaborador Gastronômico'}
              </h1>
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="rounded-lg bg-white/10 p-1.5 text-gold-300 hover:bg-white/20 transition-colors"
                title="Editar Nome"
              >
                <Edit2 className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-1 text-xs sm:text-sm text-gold-200/80 font-light">
              Histórico pessoal e evolução do treinamento
            </p>
          </div>
        </div>

        {hasData && (
          <button
            onClick={handleClearData}
            className="inline-flex items-center gap-1.5 self-start sm:self-auto rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-200 border border-red-500/30 px-3.5 py-2 text-xs font-semibold transition-all"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Zerar Histórico</span>
          </button>
        )}
      </div>

      {/* =========================================================
          FILTRO DE JOGOS & RESUMO GERAL
      ========================================================= */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xs font-bold uppercase tracking-widest text-brand-900">
          Métricas Gerais de Desempenho
        </h2>

        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 font-medium">Filtrar por Jogo:</span>
          <select
            value={selectedGameFilter}
            onChange={(e) => setSelectedGameFilter(e.target.value)}
            className="rounded-xl border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-900 shadow-sm focus:border-brand-700 focus:outline-none"
          >
            <option value="todos">Todos os Jogos</option>
            {games.map((g) => (
              <option key={g.id} value={g.id}>
                {g.nome}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {/* 1. Partidas */}
        <div className="rounded-2xl bg-white border border-cream-300 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
              Partidas
            </span>
            <Gamepad2 className="h-4 w-4 text-brand-800" />
          </div>
          <p className="mt-2 text-2xl font-serif font-bold text-brand-950">
            {stats.totalGames}
          </p>
          <span className="text-[10px] text-gray-400">rodadas concluídas</span>
        </div>

        {/* 2. Melhor Pontuação */}
        <div className="rounded-2xl bg-white border border-cream-300 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
              Melhor Pontuação
            </span>
            <Trophy className="h-4 w-4 text-gold-600" />
          </div>
          <p className="mt-2 text-2xl font-serif font-bold text-brand-950">
            {stats.bestScore.toLocaleString('pt-BR')}
          </p>
          <span className="text-[10px] text-gold-700 font-medium">recorde absoluto</span>
        </div>

        {/* 3. Precisão Média */}
        <div className="rounded-2xl bg-white border border-cream-300 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
              Precisão Média
            </span>
            <Target className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="mt-2 text-2xl font-serif font-bold text-brand-950">
            {stats.avgAccuracy}%
          </p>
          <span className="text-[10px] text-emerald-700 font-medium">taxa de sucesso</span>
        </div>

        {/* 4. Melhor Tempo */}
        <div className="rounded-2xl bg-white border border-cream-300 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
              Melhor Tempo
            </span>
            <Clock className="h-4 w-4 text-brand-800" />
          </div>
          <p className="mt-2 text-2xl font-mono font-bold text-brand-950">
            {stats.bestTime > 0 ? formatTimeMMSS(stats.bestTime) : '--:--'}
          </p>
          <span className="text-[10px] text-gray-400">partida mais rápida</span>
        </div>

        {/* 5. Melhor Streak */}
        <div className="col-span-2 lg:col-span-1 rounded-2xl bg-white border border-cream-300 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
              Melhor Streak
            </span>
            <Flame className="h-4 w-4 text-amber-500" />
          </div>
          <p className="mt-2 text-2xl font-serif font-bold text-amber-600">
            {stats.bestStreak}x
          </p>
          <span className="text-[10px] text-amber-700 font-medium">acertos seguidos</span>
        </div>
      </div>

      {/* =========================================================
          OS 3 GRÁFICOS RECHARTS REQUISITADOS
      ========================================================= */}
      <div className="rounded-3xl bg-white border border-cream-300 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-cream-200 pb-4">
          <div>
            <h2 className="text-xl font-serif font-bold text-brand-950 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-gold-600" />
              <span>Gráficos de Desempenho e Evolução</span>
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Acompanhe seu aprimoramento a cada rodada de treinamento
            </p>
          </div>

          {/* Abas dos 3 Gráficos */}
          <div className="inline-flex rounded-xl bg-cream-100 p-1">
            <button
              onClick={() => setActiveTab('score')}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
                activeTab === 'score'
                  ? 'bg-brand-800 text-white shadow-sm'
                  : 'text-gray-600 hover:text-brand-900'
              }`}
            >
              1. Pontuação
            </button>
            <button
              onClick={() => setActiveTab('accuracy')}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
                activeTab === 'accuracy'
                  ? 'bg-brand-800 text-white shadow-sm'
                  : 'text-gray-600 hover:text-brand-900'
              }`}
            >
              2. Precisão (%)
            </button>
            <button
              onClick={() => setActiveTab('time')}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
                activeTab === 'time'
                  ? 'bg-brand-800 text-white shadow-sm'
                  : 'text-gray-600 hover:text-brand-900'
              }`}
            >
              3. Tempo (s)
            </button>
          </div>
        </div>

        {hasData ? (
          <div className="h-72 w-full pt-4">
            {/* GRÁFICO 1: EVOLUÇÃO DA PONTUAÇÃO */}
            {activeTab === 'score' && (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={scoreData}>
                  <defs>
                    <linearGradient id="scoreColor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#44100D" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#44100D" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3EFEA" />
                  <XAxis
                    dataKey="matchIndex"
                    tickFormatter={(val) => `P${val}`}
                    tick={{ fontSize: 12, fill: '#6B7280' }}
                  />
                  <YAxis tick={{ fontSize: 12, fill: '#6B7280' }} />
                  <Tooltip
                    formatter={(val: any) => [
                      `${Number(val || 0).toLocaleString('pt-BR')} pts`,
                      'Pontuação Final',
                    ]}
                    labelFormatter={(label) => `Partida ${label}`}
                    contentStyle={{
                      backgroundColor: '#1A0A09',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="score"
                    stroke="#44100D"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#scoreColor)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}

            {/* GRÁFICO 2: EVOLUÇÃO DA PRECISÃO */}
            {activeTab === 'accuracy' && (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={accuracyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3EFEA" />
                  <XAxis
                    dataKey="matchIndex"
                    tickFormatter={(val) => `P${val}`}
                    tick={{ fontSize: 12, fill: '#6B7280' }}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tickFormatter={(val) => `${val}%`}
                    tick={{ fontSize: 12, fill: '#6B7280' }}
                  />
                  <Tooltip
                    formatter={(val: any) => [`${val}%`, 'Precisão']}
                    labelFormatter={(label) => `Partida ${label}`}
                    contentStyle={{
                      backgroundColor: '#1A0A09',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="accuracy"
                    stroke="#059669"
                    strokeWidth={3}
                    dot={{ fill: '#059669', r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}

            {/* GRÁFICO 3: EVOLUÇÃO DO TEMPO */}
            {activeTab === 'time' && (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3EFEA" />
                  <XAxis
                    dataKey="matchIndex"
                    tickFormatter={(val) => `P${val}`}
                    tick={{ fontSize: 12, fill: '#6B7280' }}
                  />
                  <YAxis
                    tickFormatter={(val) => `${val}s`}
                    tick={{ fontSize: 12, fill: '#6B7280' }}
                  />
                  <Tooltip
                    formatter={(val: any) => [
                      `${val} segundos (${formatTimeMMSS(Number(val))})`,
                      'Duração',
                    ]}
                    labelFormatter={(label) => `Partida ${label}`}
                    contentStyle={{
                      backgroundColor: '#1A0A09',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="durationSeconds"
                    stroke="#C89D5C"
                    strokeWidth={3}
                    dot={{ fill: '#C89D5C', r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        ) : (
          /* MENSAGEM DE ESTADO VAZIO EXIGIDA NO REQUISITO 15 */
          <div className="flex flex-col items-center justify-center py-16 text-center bg-cream-50 rounded-2xl border border-cream-200">
            <Trophy className="h-12 w-12 text-gold-400 mb-3" />
            <p className="text-base font-serif font-bold text-brand-950">
              Jogue algumas partidas para começar a acompanhar sua evolução.
            </p>
            <p className="mt-1 text-xs text-gray-500 max-w-md">
              A cada partida completada, seus gráficos de pontuação, precisão e velocidade serão atualizados automaticamente.
            </p>
            <Link
              href="/jogos"
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-brand-800 hover:bg-brand-900 px-5 py-2.5 text-xs font-bold text-white shadow transition-all"
            >
              Escolher um Jogo
            </Link>
          </div>
        )}
      </div>

      {/* =========================================================
          HISTÓRICO COMPLETO DE PARTIDAS
      ========================================================= */}
      <div className="rounded-3xl bg-white border border-cream-300 p-6 sm:p-8 shadow-sm">
        <div className="flex items-center justify-between mb-4 border-b border-cream-200 pb-3">
          <h2 className="text-lg font-serif font-bold text-brand-950 flex items-center gap-2">
            <History className="h-4 w-4 text-gold-600" />
            <span>Histórico de Partidas Concluídas</span>
          </h2>
          <span className="text-xs text-gray-500">
            Últimas {history.length} partidas (máximo 100)
          </span>
        </div>

        {hasData ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-cream-300 bg-cream-50 text-gray-600 uppercase font-semibold">
                <tr>
                  <th className="px-4 py-3">Data/Hora</th>
                  <th className="px-4 py-3">Jogo</th>
                  <th className="px-4 py-3">Dificuldade</th>
                  <th className="px-4 py-3">Pontuação</th>
                  <th className="px-4 py-3">Precisão</th>
                  <th className="px-4 py-3">Tempo</th>
                  <th className="px-4 py-3">Streak</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-200">
                {history.map((item) => {
                  const m = item.metrics as { bestStreak?: number } | undefined;
                  return (
                    <tr key={item.id} className="hover:bg-cream-50/70 transition-colors">
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                        {new Date(item.playedAt).toLocaleString('pt-BR')}
                      </td>
                      <td className="px-4 py-3 font-semibold text-brand-950 whitespace-nowrap">
                        {games.find((g) => g.id === item.gameId)?.nome || (item.gameId === 'memoria' ? 'Jogo da Memória' : item.gameId === 'montar-drink' ? 'Montar Drink' : item.gameId)}
                      </td>
                      <td className="px-4 py-3 uppercase text-[10px] font-bold text-gray-500">
                        {item.difficulty}
                      </td>
                      <td className="px-4 py-3 font-serif font-bold text-brand-950 whitespace-nowrap">
                        {item.score.toLocaleString('pt-BR')} pts
                      </td>
                      <td className="px-4 py-3 font-semibold text-emerald-700 whitespace-nowrap">
                        {item.accuracy}%
                      </td>
                      <td className="px-4 py-3 font-mono text-gray-700 whitespace-nowrap">
                        {formatTimeMMSS(item.durationSeconds)}
                      </td>
                      <td className="px-4 py-3 font-semibold text-amber-600 whitespace-nowrap">
                        {m?.bestStreak || 0}x
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center py-8 text-xs text-gray-500 italic">
            Nenhuma partida registrada no histórico ainda.
          </p>
        )}
      </div>

      {/* Modal de Edição de Perfil */}
      <PlayerModal
        isOpen={isEditModalOpen}
        onSave={(name) => {
          setPlayerName(name);
          setIsEditModalOpen(false);
        }}
        initialName={player?.nome || ''}
        isFirstVisit={false}
      />
    </div>
  );
}
