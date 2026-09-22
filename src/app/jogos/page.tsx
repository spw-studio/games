'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { Play, Sparkles } from 'lucide-react';
import { getAllGames } from '@/lib/games/registry';
import { GameIcon } from '@/components/games/GameIcon';

export default function JogosPage() {
  const games = useMemo(() => getAllGames(), []);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="rounded-3xl bg-gradient-to-r from-brand-900 to-brand-950 p-8 text-white shadow-xl">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-gold-500/20 px-3 py-1 text-xs font-semibold text-gold-300 border border-gold-400/30 mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Catálogo Multi-Jogos</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold tracking-tight">
            Jogos de Aprendizagem Gastronômica
          </h1>
          <p className="mt-2 text-sm text-foreground/80 font-light leading-relaxed">
            Todos os jogos compartilham o mesmo catálogo oficial de produtos, permitindo testar diferentes habilidades como memorização visual, conhecimentos de alérgenos e noções de porções.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {games.map((game) => (
          <div
            key={game.id}
            className={`flex flex-col justify-between rounded-3xl p-6 transition-all ${
              game.ativo
                ? 'bg-surface border-2 border-primary/30 shadow-md hover:border-primary hover:shadow-xl'
                : 'bg-muted/60 border border-dashed border-border-strong opacity-80'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`flex h-16 w-16 items-center justify-center rounded-2xl ${
                    game.ativo
                      ? 'bg-gradient-to-br from-brand-900 to-brand-800 shadow-md'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  <GameIcon name={game.icone} className="h-8 w-8 text-gold-300" />
                </div>

                <span
                  className={`rounded-full px-3 py-1 text-[11px] font-bold ${
                    game.ativo
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {game.ativo ? 'Disponível' : 'Em Breve'}
                </span>
              </div>

              <span className="text-xs font-semibold uppercase tracking-wider text-secondary">
                {game.categoria}
              </span>

              <h2 className="mt-1 text-xl font-serif font-bold text-foreground">
                {game.nome}
              </h2>

              <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                {game.descricao}
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-border">
              {game.ativo ? (
                <Link
                  href={game.rota}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary hover:bg-primary px-4 py-3 text-sm font-bold text-white shadow-md transition-all active:scale-95"
                >
                  <Play className="h-4 w-4 fill-white" />
                  <span>Configurar e Jogar</span>
                </Link>
              ) : (
                <div className="w-full text-center py-2.5 text-xs font-medium text-subtle-foreground bg-muted rounded-xl">
                  Próxima versão da plataforma
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
