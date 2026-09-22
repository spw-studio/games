'use client';

import { useState } from 'react';
import { Wine, Play, Sparkles, AlertCircle, ShieldAlert } from 'lucide-react';
import { GameDifficulty } from '@/types/game';
import { DrinkAssemblyConfigState, Group } from '@/types/grouping';
import { DRINK_CATEGORY_ID } from '@/lib/cardapio/pure';

interface DrinkAssemblyConfigProps {
  availableDrinks: Group[];
  onStartGame: (config: DrinkAssemblyConfigState) => void;
}

const QUANTITY_OPTIONS: Array<{ label: string; value: number | 'todos' }> = [
  { label: '5', value: 5 },
  { label: '10', value: 10 },
  { label: '15', value: 15 },
  { label: '20', value: 20 },
  { label: 'Todos', value: 'todos' },
];

const DIFFICULTY_OPTIONS: Array<{
  id: GameDifficulty;
  title: string;
  desc: string;
  multiplier: string;
}> = [
  {
    id: 'facil',
    title: 'Fácil',
    desc: 'Poucos ingredientes incorretos para identificar.',
    multiplier: '1.0x',
  },
  {
    id: 'medio',
    title: 'Médio',
    desc: 'Quantidade intermediária de distratores.',
    multiplier: '1.5x',
  },
  {
    id: 'dificil',
    title: 'Difícil',
    desc: 'Vários ingredientes incorretos misturados à receita.',
    multiplier: '2.0x',
  },
];

export function DrinkAssemblyConfig({
  availableDrinks,
  onStartGame,
}: DrinkAssemblyConfigProps) {
  const [selectedQuantity, setSelectedQuantity] = useState<number | 'todos'>(5);
  const [selectedDifficulty, setSelectedDifficulty] = useState<GameDifficulty>('medio');
  const [selectedCategory, setSelectedCategory] = useState<string>(DRINK_CATEGORY_ID);

  const hasEnoughDrinks = availableDrinks && availableDrinks.length >= 1;

  const handleStart = () => {
    if (!hasEnoughDrinks) return;
    onStartGame({
      drinkCount: selectedQuantity,
      difficulty: selectedDifficulty,
      category: selectedCategory,
    });
  };

  return (
    <div className="mx-auto max-w-2xl space-y-8 animate-in fade-in zoom-in-95 duration-300">
      {/* Banner Principal com Identidade #44100D */}
      <div className="relative overflow-hidden rounded-card bg-primary p-8 text-primary-foreground shadow-elevated border border-secondary/20">
        <div className="absolute inset-0 bg-[radial-gradient(#C89D5C_1px,transparent_1px)] [background-size:20px_20px] opacity-10" />

        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-overlay/10 border-2 border-gold-400/40 text-gold-300 shadow-xl backdrop-blur-md">
            <Wine className="h-8 w-8" />
          </div>

          <div className="inline-flex items-center gap-2 rounded-full bg-gold-500/20 px-3.5 py-1 text-xs font-semibold text-gold-300 border border-gold-400/30 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Coquetelaria & Receitas</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-serif font-bold tracking-tight">
            Montar o Drink
          </h1>

          <p className="mt-2 text-sm sm:text-base text-foreground/90 font-light max-w-lg leading-relaxed">
            Treine sua agilidade e conhecimento técnico selecionando os ingredientes
            exatos de cada coquetel clássico sem errar a receita.
          </p>
        </div>
      </div>

      {/* Validação Prévia: Se não houver drinks válidos cadastrados */}
      {!hasEnoughDrinks ? (
        <div className="rounded-3xl bg-amber-50 border-2 border-amber-300 p-6 sm:p-8 text-center space-y-4 shadow-lg">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
            <ShieldAlert className="h-8 w-8" />
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-bold font-serif text-amber-950">
              Nenhum drink com ingredientes disponível
            </h2>
            <p className="text-sm text-amber-800 max-w-md mx-auto leading-relaxed">
              Para jogar este módulo, cadastre itens com a categoria{' '}
              <code className="bg-amber-100 px-2 py-0.5 rounded font-mono font-bold text-amber-900">
                drinks
              </code>{' '}
              e com a lista de{' '}
              <code className="bg-amber-100 px-2 py-0.5 rounded font-mono font-bold text-amber-900">
                ingredientes
              </code>{' '}
              no catálogo oficial.
            </p>
          </div>
        </div>
      ) : (
        /* Formulário de Configuração */
        <div className="rounded-card bg-surface border border-border p-6 sm:p-8 shadow-elevated space-y-8">
          {/* 1. Quantidade de Drinks */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold uppercase tracking-wider text-foreground">
                1. Quantidade de Drinks na Partida
              </label>
              <span className="text-xs text-muted-foreground">
                {availableDrinks.length} drinks disponíveis
              </span>
            </div>

            <div className="grid grid-cols-5 gap-2.5 sm:gap-3">
              {QUANTITY_OPTIONS.map((opt) => {
                const isSelected = selectedQuantity === opt.value;
                const isAvailable =
                  opt.value === 'todos' ||
                  typeof opt.value === 'number' && opt.value <= availableDrinks.length;

                return (
                  <button
                    key={String(opt.value)}
                    type="button"
                    onClick={() => setSelectedQuantity(opt.value)}
                    className={`rounded-2xl py-3 px-2 text-center font-bold text-sm sm:text-base transition-all duration-200 border-2 active:scale-95 cursor-pointer ${
                      isSelected
                        ? 'bg-primary text-secondary border-primary shadow-card'
                        : 'bg-surface text-foreground border-border hover:border-primary/40 hover:bg-surface-hover'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Categoria */}
          <div className="space-y-3">
            <label className="block text-sm font-bold uppercase tracking-wider text-foreground">
              2. Categoria de Coquetelaria
            </label>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSelectedCategory('drinks')}
                className={`p-4 rounded-2xl border-2 text-left transition-all active:scale-95 cursor-pointer ${
                  selectedCategory === 'drinks'
                    ? 'bg-primary text-primary-foreground border-primary shadow-card'
                    : 'bg-surface text-foreground border-border hover:border-primary/40'
                }`}
              >
                <span className="block font-bold text-sm sm:text-base">
                  Coquetelaria Oficial
                </span>
                <span
                  className={`text-xs mt-0.5 block ${
                    selectedCategory === 'drinks' ? 'text-foreground/80' : 'text-muted-foreground'
                  }`}
                >
                  Drinks com receitas completas
                </span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedCategory('todas')}
                className={`p-4 rounded-2xl border-2 text-left transition-all active:scale-95 cursor-pointer ${
                  selectedCategory === 'todas'
                    ? 'bg-primary text-primary-foreground border-primary shadow-card'
                    : 'bg-surface text-foreground border-border hover:border-primary/40'
                }`}
              >
                <span className="block font-bold text-sm sm:text-base">
                  Todas as Categorias
                </span>
                <span
                  className={`text-xs mt-0.5 block ${
                    selectedCategory === 'todas' ? 'text-foreground/80' : 'text-muted-foreground'
                  }`}
                >
                  Drinks e coquetéis variados
                </span>
              </button>
            </div>
          </div>

          {/* 3. Nível de Dificuldade */}
          <div className="space-y-3">
            <label className="block text-sm font-bold uppercase tracking-wider text-foreground">
              3. Nível de Dificuldade
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {DIFFICULTY_OPTIONS.map((diff) => {
                const isSelected = selectedDifficulty === diff.id;
                return (
                  <button
                    key={diff.id}
                    type="button"
                    onClick={() => setSelectedDifficulty(diff.id)}
                    className={`p-4 rounded-2xl border-2 text-left transition-all active:scale-95 cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-primary text-primary-foreground border-primary shadow-card'
                        : 'bg-surface text-foreground border-border hover:border-primary/40 hover:bg-surface-hover'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-base font-serif">
                          {diff.title}
                        </span>
                        <span
                          className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full ${
                            isSelected
                              ? 'bg-gold-500/20 text-gold-300 border border-gold-400/40'
                              : 'bg-muted text-foreground'
                          }`}
                        >
                          {diff.multiplier}
                        </span>
                      </div>
                      <p
                        className={`text-xs mt-2 leading-relaxed ${
                          isSelected ? 'text-foreground/90' : 'text-muted-foreground'
                        }`}
                      >
                        {diff.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Botão de Início */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleStart}
              className="w-full flex items-center justify-center gap-3 rounded-control bg-primary hover:bg-primary/90 text-secondary border-2 border-secondary/30 py-4 px-6 text-lg font-bold shadow-elevated transition-all duration-200 active:scale-[0.98] cursor-pointer"
            >
              <Play className="h-5 w-5 fill-gold-300 text-gold-300" />
              <span>INICIAR PARTIDA</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
