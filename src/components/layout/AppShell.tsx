'use client';

import { ReactNode, useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { signIn, useSession } from 'next-auth/react';
import { usePlayer } from '@/hooks/usePlayer';
import { isPublicPath } from '@/core/routes';
import { Navbar } from '@/components/ui/Navbar';
import { useGameMode } from '@/components/layout/GameModeProvider';
import { PlayerModal } from '@/components/ui/PlayerModal';
import { NoticeModal } from '@/components/ui/NoticeModal';
import { AudioSettingsPanel } from '@/components/audio/AudioSettingsPanel';
import { ChefHat, Heart } from 'lucide-react';
import Link from 'next/link';

export function AppShell({ children }: { children: ReactNode }) {
  const { player, isLoaded, isModalOpen, setIsModalOpen, setPlayerName } = usePlayer();
  const [isAudioSettingsOpen, setIsAudioSettingsOpen] = useState(false);
  const [isAuthNoticeOpen, setIsAuthNoticeOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { status } = useSession();
  const isPublicPage = isPublicPath(pathname);
  const isAuthenticated = status === 'authenticated';
  // Durante a partida (modo imersivo) o shell esconde navbar/rodapé e usa 100% da tela.
  const { isImmersive } = useGameMode();

  useEffect(() => {
    if (status === 'unauthenticated' && !isPublicPage) {
      router.replace('/jogos');
    }
  }, [isPublicPage, router, status]);

  useEffect(() => {
    if (isPublicPage && searchParams.get('authRequired') === '1') {
      setIsAuthNoticeOpen(true);
      window.history.replaceState(null, '', '/jogos');
    }
  }, [isPublicPage, searchParams]);

  // Enquanto o jogo ocupa a tela inteira o documento não rola: elimina a barra
  // de rolagem da página e o "rubber band" no mobile.
  useEffect(() => {
    if (!isImmersive) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isImmersive]);

  if (!isPublicPage && (status === 'loading' || !isAuthenticated)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-6 text-center text-foreground">
        <div className="max-w-sm space-y-4">
          <div className="mx-auto h-2 w-24 overflow-hidden rounded-full bg-muted">
            <div className="h-full w-1/2 animate-pulse rounded-full bg-primary" />
          </div>
          <p className="text-sm text-muted-foreground">Verificando seu acesso...</p>
          {status === 'unauthenticated' && (
            <button
              type="button"
              onClick={() => void signIn('google', { callbackUrl: pathname })}
              className="rounded-control bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
            >
              Entrar com Google
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col bg-background text-foreground ${
        isImmersive ? 'h-dvh overflow-hidden' : 'min-h-screen'
      }`}
    >
      {/* Barra de Navegação Global — oculta durante a partida (modo imersivo) */}
      {!isImmersive && (
        <Navbar
          player={player}
          onOpenPlayerModal={() => setIsModalOpen(true)}
          onOpenAudioSettings={() => setIsAudioSettingsOpen(true)}
        />
      )}

      {/* Conteúdo Principal — em partida ocupa 100% da viewport, sem rolagem */}
      <main
        className={isImmersive ? 'flex min-h-0 flex-1 flex-col' : 'flex-1 pb-16 pt-6'}
      >
        <div
          className={
            isImmersive
              ? 'flex min-h-0 w-full flex-1 flex-col'
              : 'mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'
          }
        >
          {children}
        </div>
      </main>

      {/* Modal de Primeiro Acesso ou Edição de Nome */}
      {isLoaded && isAuthenticated && (
        <PlayerModal
          isOpen={isModalOpen}
          onSave={setPlayerName}
          initialName={player?.nome || ''}
          isFirstVisit={!player}
        />
      )}

      {/* Rodapé Gastronômico Elegante — oculto durante a partida (modo imersivo) */}
      {!isImmersive && (
        <footer className="border-t border-border bg-surface py-8 text-center text-xs text-muted-foreground">
          <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-primary font-serif font-bold">
              <ChefHat className="h-4 w-4 text-secondary" />
              <span>GASTRONOMIA ACADEMY</span>
            </div>

            <div className="flex items-center gap-6">
              {isAuthenticated && (
                <Link href="/" className="hover:text-primary transition-colors">
                  Início
                </Link>
              )}
              <Link href="/jogos" className="hover:text-primary transition-colors">
                Catálogo de Jogos
              </Link>
              {isAuthenticated && (
                <Link href="/perfil" className="hover:text-primary transition-colors">
                  Minhas Estatísticas
                </Link>
              )}
            </div>

            <p className="flex items-center justify-center gap-1">
              <span>Treinamento e excelência em atendimento gastronômico</span>
            </p>
          </div>
        </footer>
      )}
      <AudioSettingsPanel
        isOpen={isAudioSettingsOpen}
        onClose={() => setIsAudioSettingsOpen(false)}
      />
      <NoticeModal
        isOpen={isAuthNoticeOpen}
        title="Login necessário"
        message="Faça login com sua conta Google para acessar a página inicial, seu desempenho e iniciar uma partida."
        variant="warning"
        onClose={() => setIsAuthNoticeOpen(false)}
        primaryAction={{
          label: 'Login com Google',
          onClick: () => void signIn('google', { callbackUrl: '/jogos' }),
        }}
        secondaryAction={{
          label: 'Voltar ao catálogo',
          onClick: () => setIsAuthNoticeOpen(false),
        }}
      />
    </div>
  );
}
