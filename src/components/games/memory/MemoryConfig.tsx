'use client';

import { useState } from 'react';
import { Category } from '@/types/cardapio';
import { GameDifficulty } from '@/types/game';
import { GAME_CONFIG } from '@/config/game-config';
import { getMemoryEligibleProducts } from '@/lib/cardapio/queries';
import { AlertCircle, Brain, Play, Sparkles, SlidersHorizontal } from 'lucide-react';

interface MemoryConfigProps {
  categories: Category[];
  onStartGame: (config: {
    category: string;
    pairCount: number;
    difficulty: GameDifficulty;
  }) => void;
}

export function MemoryConfig({ categories, onStartGame }: MemoryConfigProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('todas');
  const [pairCount, setPairCount] = useState<number>(GAME_CONFIG.DEFAULT_PRODUCT_COUNT);
  const [difficulty, setDifficulty] = useState<GameDifficulty>(GAME_CONFIG.DEFAULT_DIFFICULTY);

  // Verificação dinâmica da quantidade de produtos elegíveis no catálogo
  const eligibleProducts = getMemoryEligibleProducts(selectedCategory);
  const availableCount = eligibleProducts.length;
  const hasEnoughProducts = availableCount >= pairCount;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasEnoughProducts) return;
    onStartGame({
      category: selectedCategory,
      pairCount,
      difficulty,
    });
  };

  return (
    <div className="mx-auto max-w-2xl overflow-hidden rounded-card bg-surface border border-border shadow-elevated">
      {/* Banner Superior com a Cor Nobre #44100D */}
      <div className="bg-gradient-to-r from-brand-900 via-brand-800 to-brand-950 px-6 py-8 sm:px-8 text-white text-center relative">
        <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 border border-gold-400/30 shadow-inner">
          <Brain className="h-8 w-8 text-gold-300" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold tracking-wide">
          Configuração da Partida
        </h1>
        <p className="mt-1 text-sm text-gold-200/90 font-light">
          Associe a foto de cada prato nobre à sua descrição gastronômica completa
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
        {/* 1. SELEÇÃO DE CATEGORIA (DINÂMICA A PARTIR DO JSON) */}
        <div>
          <label
            htmlFor="category-select"
            className="block text-xs font-bold uppercase tracking-wider text-brand-900 mb-2"
          >
            1. Categoria de Produtos
          </label>
          <select
            id="category-select"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full rounded-control border border-border bg-muted px-4 py-3 text-sm font-medium text-foreground focus:border-primary focus:bg-surface focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="todas">
              🍽️ Todas as Categorias ({getMemoryEligibleProducts('todas').length} pratos disponíveis)
            </option>
            {categories.map((cat) => {
              const count = getMemoryEligibleProducts(cat.id).length;
              return (
                <option key={cat.id} value={cat.id}>
                  {cat.nome} ({count} pratos)
                </option>
              );
            })}
          </select>
          <p className="mt-1.5 text-xs text-gray-500">
            Categorias carregadas diretamente da base oficial do restaurante.
          </p>
        </div>

        {/* 2. QUANTIDADE DE PARES */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-brand-900">
              2. Quantidade de Pares (Pratos)
            </label>
            <span className="text-xs text-gray-500 font-medium">
              {pairCount * 2} cartas no tabuleiro
            </span>
          </div>

          <div className="grid grid-cols-5 gap-2 sm:gap-3">
            {GAME_CONFIG.AVAILABLE_PAIR_COUNTS.map((count) => {
              const isSelected = pairCount === count;
              const isPossible = availableCount >= count;

              return (
                <button
                  key={count}
                  type="button"
                  onClick={() => setPairCount(count)}
                  className={`flex flex-col items-center justify-center rounded-xl p-3 text-center transition-all ${
                    isSelected
                        ? 'bg-primary text-primary-foreground shadow-card ring-2 ring-secondary font-bold'
                      : isPossible
                      ? 'bg-cream-100/80 text-gray-700 hover:bg-cream-200 border border-cream-300 font-medium'
                      : 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed opacity-60'
                  }`}
                  title={!isPossible ? 'Quantidade indisponível nesta categoria' : undefined}
                >
                  <span className="text-base sm:text-lg">{count}</span>
                  <span className="text-[10px] uppercase tracking-wider opacity-80">pares</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. DIFICULDADE */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-brand-900 mb-2">
            3. Dificuldade & Multiplicador de Pontuação
          </label>
          <div className="grid grid-cols-3 gap-3">
            {(
              [
                { id: 'facil', name: 'Fácil', mult: '1.0x', desc: 'Ritmo tranquilo' },
                { id: 'medio', name: 'Médio', mult: '1.5x', desc: 'Equilíbrio ideal' },
                { id: 'dificil', name: 'Difícil', mult: '2.0x', desc: 'Alta pontuação' },
              ] as const
            ).map((level) => {
              const isSelected = difficulty === level.id;
              return (
                <button
                  key={level.id}
                  type="button"
                  onClick={() => setDifficulty(level.id)}
                  className={`flex flex-col items-center rounded-xl p-3.5 border transition-all text-center ${
                    isSelected
                      ? 'bg-brand-50 border-brand-700 text-brand-900 shadow-sm ring-1 ring-brand-700'
                      : 'bg-surface border-border text-foreground hover:bg-surface-hover'
                  }`}
                >
                  <span className="text-sm font-bold">{level.name}</span>
                  <span className="rounded-full bg-gold-500/20 px-2 py-0.5 mt-1 text-[10px] font-bold text-gold-800 border border-gold-400/40">
                    {level.mult}
                  </span>
                  <span className="text-[10px] text-gray-500 mt-1">{level.desc}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ALERTA DE QUANTIDADE INSUFICIENTE (REQUISITO 39) */}
        {!hasEnoughProducts && (
          <div className="flex items-start gap-3 rounded-2xl bg-amber-50 border border-amber-200 p-4 text-amber-900">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <p className="font-bold">Não existem produtos suficientes para esta configuração.</p>
              <p>
                A categoria selecionada possui apenas <strong>{availableCount}</strong> produtos elegíveis. 
                Por favor, escolha uma categoria mais ampla ou selecione até <strong>{availableCount}</strong> pares.
              </p>
            </div>
          </div>
        )}

        {/* BOTÃO DE INÍCIO */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={!hasEnoughProducts}
            className={`w-full flex items-center justify-center gap-2 rounded-control px-6 py-4 text-base font-bold text-primary-foreground shadow-card transition-all ${
              hasEnoughProducts
                ? 'bg-primary hover:bg-primary/90 active:scale-[0.99] cursor-pointer'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none'
            }`}
          >
            <Play className="w-5 h-5 text-gold-300 fill-gold-300" />
            <span>Iniciar Partida de Aprendizagem</span>
          </button>
        </div>
      </form>
    </div>
  );
}
