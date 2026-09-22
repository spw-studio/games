'use client';

import { Product } from '@/types/cardapio';
import { GameDifficulty, GameResult, MemoryMetrics } from '@/types/game';
import { useMemoryGame } from '@/hooks/useMemoryGame';
import { MemoryCard } from './MemoryCard';
import { MemoryHUD } from './MemoryHUD';

interface MemoryBoardProps {
  products: Product[];
  categoryMap: Record<string, string>; // id -> nome
  category: string;
  pairCount: number;
  difficulty: GameDifficulty;
  playerId: string;
  onFinishGame: (result: GameResult<MemoryMetrics>) => void;
  onRestart: () => void;
}

/**
 * Renderização do tabuleiro do Jogo da Memória.
 * Toda a lógica de estado/regras vive em `useMemoryGame` — este componente
 * é apenas apresentação (padrão dos demais jogos da plataforma).
 */
export function MemoryBoard({
  products,
  categoryMap,
  category,
  pairCount,
  difficulty,
  playerId,
  onFinishGame,
  onRestart,
}: MemoryBoardProps) {
  const {
    cards,
    productLookup,
    matchedPairs,
    moves,
    errors,
    streak,
    timer,
    currentScoring,
    isCheckingMatch,
    isFinished,
    handleCardClick,
  } = useMemoryGame({
    products,
    category,
    pairCount,
    difficulty,
    playerId,
    onFinishGame,
  });

  // Determina a quantidade de colunas responsivas do grid
  const getGridColsClass = () => {
    const totalCards = pairCount * 2;
    if (totalCards <= 8) {
      // 8 cartas: 4x2 ou 2x4
      return 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4';
    }
    if (totalCards <= 12) {
      // 12 cartas: 4x3 ou 3x4
      return 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4';
    }
    if (totalCards <= 16) {
      // 16 cartas: 4x4
      return 'grid-cols-2 sm:grid-cols-4 md:grid-cols-4';
    }
    if (totalCards <= 20) {
      // 20 cartas: 5x4
      return 'grid-cols-2 sm:grid-cols-4 md:grid-cols-5';
    }
    // 24 cartas: 6x4
    return 'grid-cols-2 sm:grid-cols-4 md:grid-cols-6';
  };

  return (
    <div className="space-y-6">
      {/* HUD em Tempo Real */}
      <MemoryHUD
        score={currentScoring.finalScore}
        matches={matchedPairs.size}
        totalPairs={pairCount}
        timeFormatted={timer.formatted}
        errors={errors}
        streak={streak}
        difficulty={difficulty}
        categoryName={category !== 'todas' ? categoryMap[category] : 'Todas as Categorias'}
        onRestart={onRestart}
      />

      {/* Tabuleiro Responsivo de Cartas */}
      <div
        className={`grid gap-3 sm:gap-4 ${getGridColsClass()}`}
        role="region"
        aria-label="Tabuleiro do Jogo da Memória"
      >
        {cards.map((card) => {
          const product = productLookup[card.productId];
          if (!product) return null;

          return (
            <MemoryCard
              key={card.id}
              card={card}
              product={product}
              categoryName={categoryMap[product.categoryId]}
              onClick={handleCardClick}
              disabled={isCheckingMatch || isFinished}
            />
          );
        })}
      </div>
    </div>
  );
}
