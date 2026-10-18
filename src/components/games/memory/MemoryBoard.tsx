'use client';

import { useEffect, useMemo, useState } from 'react';
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
 * Garante que 100% das cartas fiquem visíveis simultaneamente em uma única tela,
 * sem barra de rolagem, tanto em dispositivos móveis (retrato/paisagem) quanto no desktop.
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

  // Detecta se a viewport está em proporção horizontal (desktop / paisagem)
  // ou vertical (mobile em pé / retrato) para distribuir a grade perfeitamente.
  const [isLandscape, setIsLandscape] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    return window.innerWidth >= 640 || window.innerWidth > window.innerHeight;
  });

  useEffect(() => {
    const updateLayout = () => {
      setIsLandscape(window.innerWidth >= 640 || window.innerWidth > window.innerHeight);
    };
    updateLayout();
    window.addEventListener('resize', updateLayout);
    window.addEventListener('orientationchange', updateLayout);
    return () => {
      window.removeEventListener('resize', updateLayout);
      window.removeEventListener('orientationchange', updateLayout);
    };
  }, []);

  // Configuração exata de colunas e linhas:
  // cols * rows = totalCards sempre preenche 100% da tela sem sobrar slots.
  const gridConfig = useMemo(() => {
    const totalCards = pairCount * 2;
    if (isLandscape) {
      if (totalCards <= 8) return { cols: 4, rows: 2 };
      if (totalCards <= 12) return { cols: 4, rows: 3 };
      if (totalCards <= 16) return { cols: 4, rows: 4 };
      if (totalCards <= 20) return { cols: 5, rows: 4 };
      return { cols: 6, rows: 4 }; // 24 cartas: 6x4
    } else {
      if (totalCards <= 8) return { cols: 2, rows: 4 };
      if (totalCards <= 12) return { cols: 3, rows: 4 };
      if (totalCards <= 16) return { cols: 4, rows: 4 };
      if (totalCards <= 20) return { cols: 4, rows: 5 };
      return { cols: 4, rows: 6 }; // 24 cartas: 4x6
    }
  }, [pairCount, isLandscape]);

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col gap-1 sm:gap-2 overflow-hidden">
      {/* HUD em Tempo Real Compacto */}
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

      {/* Tabuleiro Responsivo de Cartas — ocupa 100% da tela restante SEM rolagem */}
      <div className="min-h-0 flex-1 w-full overflow-hidden flex items-center justify-center p-0.5 sm:p-1">
        <div
          className="grid h-full w-full gap-1.5 sm:gap-2 md:gap-2.5"
          style={{
            gridTemplateColumns: `repeat(${gridConfig.cols}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${gridConfig.rows}, minmax(0, 1fr))`,
          }}
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
    </div>
  );
}
