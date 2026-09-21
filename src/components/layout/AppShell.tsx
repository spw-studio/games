'use client';

import { ReactNode, useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { signIn, useSession } from 'next-auth/react';
import { usePlayer } from '@/hooks/usePlayer';
import { Navbar } from '@/components/ui/Navbar';
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
  const isPublicPage = pathname === '/jogos';
  const isAuthenticated = status === 'authenticated';

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
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* Barra de Navegação Global */}
      <Navbar
        player={player}
        onOpenPlayerModal={() => setIsModalOpen(true)}
        onOpenAudioSettings={() => setIsAudioSettingsOpen(true)}
      />

      {/* Conteúdo Principal */}
      <main className="flex-1 bg-one-page pb-16 pt-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
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

      {/* Rodapé Gastronômico Elegante */}
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
