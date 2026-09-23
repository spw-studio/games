'use client';

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from 'react';

interface GameModeContextValue {
  /** `true` enquanto uma partida está em andamento (layout imersivo). */
  isImmersive: boolean;
  setImmersive: (isImmersive: boolean) => void;
}

const GameModeContext = createContext<GameModeContextValue | null>(null);

/**
 * Controla o "modo partida" da plataforma.
 *
 * Enquanto uma partida está em andamento (`useImmersiveGame`) o AppShell
 * esconde a navbar, o rodapé e as margens: o jogo ocupa 100% da viewport e a
 * página deixa de ter barra de rolagem própria.
 */
export function GameModeProvider({ children }: { children: ReactNode }) {
  const [isImmersive, setImmersive] = useState(false);

  const value = useMemo(() => ({ isImmersive, setImmersive }), [isImmersive]);

  return <GameModeContext.Provider value={value}>{children}</GameModeContext.Provider>;
}

export function useGameMode() {
  const context = useContext(GameModeContext);
  if (!context) {
    throw new Error('useGameMode deve ser usado dentro de GameModeProvider');
  }
  return context;
}

/**
 * `useLayoutEffect` no navegador evita um frame com a navbar visível ao iniciar
 * a partida; no servidor cai para `useEffect` (sem aviso de SSR).
 */
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

/**
 * Ativa o modo imersivo conforme a partida está em andamento e restaura o
 * layout padrão automaticamente ao sair da partida (ou desmontar a página).
 */
export function useImmersiveGame(isPlaying: boolean) {
  const { setImmersive } = useGameMode();

  useIsomorphicLayoutEffect(() => {
    setImmersive(isPlaying);
    return () => setImmersive(false);
  }, [isPlaying, setImmersive]);
}
