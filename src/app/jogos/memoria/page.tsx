'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { GameDifficulty, GameResult, MemoryMetrics } from '@/types/game';
import { Product } from '@/types/cardapio';
import { getCategories, getMemoryEligibleProducts } from '@/lib/cardapio/queries';
import { usePlayer } from '@/hooks/usePlayer';
import { useGameStorage } from '@/hooks/useGameStorage';
import { MemoryConfig } from '@/components/games/memory/MemoryConfig';
import { MemoryBoard } from '@/components/games/memory/MemoryBoard';
import { ThemeProvider } from '@/theme/ThemeProvider';
import { getGameById } from '@/lib/games/registry';

const memoryTheme = getGameById('memoria')?.theme ?? 'default';

export default function MemoryGamePage() {
  const router = useRouter();
  const { player } = usePlayer();
  const { recordResult } = useGameStorage();

  // Estados da partida
  const [gameState, setGameState] = useState<'config' | 'playing'>('config');
  const [gameConfig, setGameConfig] = useState<{
    category: string;
    pairCount: number;
    difficulty: GameDifficulty;
  }>({
    category: 'todas',
    pairCount: 6,
    difficulty: 'medio',
  });

  // Categorias do cardápio normalizado
  const categories = useMemo(() => getCategories(), []);

  // Mapeamento de id de categoria para nome legível
  const categoryMap = useMemo(() => {
    const map: Record<string, string> = { todas: 'Todas as Categorias' };
    categories.forEach((cat) => {
      map[cat.id] = cat.nome;
    });
    return map;
  }, [categories]);

  // Produtos elegíveis para o jogo (com descrição válida)
  const eligibleProducts = useMemo(() => {
    return getMemoryEligibleProducts(gameConfig.category);
  }, [gameConfig.category]);

  const handleStartGame = (config: {
    category: string;
    pairCount: number;
    difficulty: GameDifficulty;
  }) => {
    setGameConfig(config);
    setGameState('playing');
  };

  const handleFinishGame = (result: GameResult<MemoryMetrics>) => {
    // Grava o resultado no histórico e atualiza recordes locais
    recordResult(result);
    // Redireciona para a tela rica de resultado
    router.push('/jogos/resultado');
  };

  const handleRestart = () => {
    setGameState('config');
  };

  return (
    <ThemeProvider themeId={memoryTheme}>
      <div className="py-2 animate-in fade-in duration-300">
      {gameState === 'config' ? (
        <MemoryConfig
          categories={categories}
          onStartGame={handleStartGame}
        />
      ) : (
        <MemoryBoard
          products={eligibleProducts}
          categoryMap={categoryMap}
          category={gameConfig.category}
          pairCount={gameConfig.pairCount}
          difficulty={gameConfig.difficulty}
          playerId={player?.id || 'local-player'}
          onFinishGame={handleFinishGame}
          onRestart={handleRestart}
        />
      )}
      </div>
    </ThemeProvider>
  );
}
