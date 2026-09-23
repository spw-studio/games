'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { GameDifficulty, GameResult, MemoryMetrics } from '@/types/game';
import { Category, Product } from '@/types/cardapio';
import { fetchCatalogCategories, fetchCatalogProducts } from '@/lib/cardapio/client';
import { filterMemoryEligibleProducts } from '@/lib/cardapio/pure';
import { usePlayer } from '@/hooks/usePlayer';
import { useGameStorage } from '@/hooks/useGameStorage';
import { useImmersiveGame } from '@/components/layout/GameModeProvider';
import { MemoryConfig } from '@/components/games/memory/MemoryConfig';
import { MemoryBoard } from '@/components/games/memory/MemoryBoard';
import { ThemeProvider } from '@/theme/ThemeProvider';
import { getGameById } from '@/lib/games/registry';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { NoticeModal } from '@/components/ui/NoticeModal';

const memoryTheme = getGameById('memoria')?.theme ?? 'default';

export default function MemoryGamePage() {
  const router = useRouter();
  const { player } = usePlayer();
  const { recordResult } = useGameStorage();

  // Catálogo carregado via API (escopo de tenant aplicado no servidor)
  const [categories, setCategories] = useState<Category[] | null>(null);
  const [products, setProducts] = useState<Product[] | null>(null);
  const [catalogError, setCatalogError] = useState(false);

  // Estados da partida
  const [gameState, setGameState] = useState<'config' | 'playing'>('config');
  const [isStarting, setIsStarting] = useState(false);
  const [gameConfig, setGameConfig] = useState<{
    category: string;
    pairCount: number;
    difficulty: GameDifficulty;
  }>({
    category: 'todas',
    pairCount: 6,
    difficulty: 'medio',
  });

  // Modo imersivo: durante a partida a navbar/rodapé somem e o tabuleiro ocupa
  // 100% da tela, sem barra de rolagem da página.
  useImmersiveGame(gameState === 'playing');

  useEffect(() => {
    let cancelled = false;

    Promise.all([fetchCatalogCategories(), fetchCatalogProducts()])
      .then(([fetchedCategories, fetchedProducts]) => {
        if (cancelled) return;
        setCategories(fetchedCategories);
        setProducts(fetchedProducts);
      })
      .catch(() => {
        if (cancelled) return;
        setCatalogError(true);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Mapeamento de id de categoria para nome legível
  const categoryMap = useMemo(() => {
    const map: Record<string, string> = { todas: 'Todas as Categorias' };
    (categories ?? []).forEach((cat) => {
      map[cat.id] = cat.name;
    });
    return map;
  }, [categories]);

  // Produtos elegíveis para o jogo (com descrição válida)
  const eligibleProducts = useMemo(() => {
    if (!products) return [];
    return filterMemoryEligibleProducts(products, gameConfig.category);
  }, [products, gameConfig.category]);

  const handleStartGame = (config: {
    category: string;
    pairCount: number;
    difficulty: GameDifficulty;
  }) => {
    setIsStarting(true);
    window.setTimeout(() => {
      setGameConfig(config);
      setGameState('playing');
      setIsStarting(false);
    }, 350);
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

  const isCatalogLoading = !catalogError && (!categories || !products);

  return (
    <ThemeProvider themeId={memoryTheme} className="flex min-h-0 flex-1 flex-col">
      <div
        className={`animate-in fade-in duration-300 ${
          gameState === 'playing' ? 'flex min-h-0 flex-1 flex-col p-2' : 'py-2'
        }`}
      >
        {isCatalogLoading && <LoadingScreen label="Carregando catálogo..." />}

        {!isCatalogLoading && catalogError && (
          <NoticeModal
            isOpen
            title="Não foi possível carregar o catálogo"
            message="Ocorreu um erro ao buscar os produtos. Verifique sua conexão e tente novamente."
            variant="danger"
            onClose={() => window.location.reload()}
            primaryAction={{
              label: 'Tentar novamente',
              onClick: () => window.location.reload(),
            }}
          />
        )}

        {!isCatalogLoading && !catalogError && gameState === 'config' && (
          <MemoryConfig
            categories={categories ?? []}
            products={products ?? []}
            onStartGame={handleStartGame}
          />
        )}

        {!isCatalogLoading && !catalogError && gameState === 'playing' && (
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

        {isStarting && <LoadingScreen label="Preparando o jogo da memória..." />}
      </div>
    </ThemeProvider>
  );
}
