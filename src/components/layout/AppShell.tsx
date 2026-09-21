'use client';

import { ReactNode, useState } from 'react';
import { usePlayer } from '@/hooks/usePlayer';
import { Navbar } from '@/components/ui/Navbar';
import { PlayerModal } from '@/components/ui/PlayerModal';
import { AudioSettingsPanel } from '@/components/audio/AudioSettingsPanel';
import { ChefHat, Heart } from 'lucide-react';
import Link from 'next/link';

export function AppShell({ children }: { children: ReactNode }) {
  const { player, isLoaded, isModalOpen, setIsModalOpen, setPlayerName } = usePlayer();
  const [isAudioSettingsOpen, setIsAudioSettingsOpen] = useState(false);

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
      {isLoaded && (
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
            <Link href="/" className="hover:text-primary transition-colors">
              Início
            </Link>
            <Link href="/jogos" className="hover:text-primary transition-colors">
              Catálogo de Jogos
            </Link>
            <Link href="/perfil" className="hover:text-primary transition-colors">
              Minhas Estatísticas
            </Link>
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
    </div>
  );
}
