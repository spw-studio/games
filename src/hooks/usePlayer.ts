'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { PlayerProfile } from '@/types/player';
import {
  createDefaultPlayerProfile,
  createGooglePlayerProfile,
  getPlayerProfile,
  savePlayerProfile,
  touchPlayerActivity,
} from '@/lib/storage/player';

export function usePlayer() {
  const { data: session, status } = useSession();
  const [player, setPlayer] = useState<PlayerProfile | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;

    const existing = getPlayerProfile();

    if (status === 'authenticated' && session.user) {
      const accountId = session.user.email || session.user.name || 'google-user';
      const accountName = session.user.name || existing?.nome || 'Colaborador';
      const accountEmail = session.user.email || '';

      if (existing?.authType === 'google' && existing.id === `google:${accountId}`) {
        touchPlayerActivity();
        setPlayer(existing);
      } else {
        setPlayer(createGooglePlayerProfile(accountName, accountEmail, accountId));
      }
      setIsModalOpen(false);
      setIsLoaded(true);
      return;
    }

    if (existing) {
      setPlayer(existing);
      touchPlayerActivity();
    } else {
      // Abre o modal de primeiro acesso caso não exista perfil
      setIsModalOpen(true);
    }
    setIsLoaded(true);
  }, [session, status]);

  const setPlayerName = (name: string) => {
    const newProfile =
      status === 'authenticated' && session?.user
        ? createGooglePlayerProfile(
            name,
            session.user.email || '',
            session.user.email || session.user.name || 'google-user'
          )
        : createDefaultPlayerProfile(name);
    setPlayer(newProfile);
    setIsModalOpen(false);
  };

  const updateProfile = (updatedData: Partial<PlayerProfile>) => {
    if (!player) return;
    const updated: PlayerProfile = {
      ...player,
      ...updatedData,
      ultimaAtividade: new Date().toISOString(),
    };
    savePlayerProfile(updated);
    setPlayer(updated);
  };

  return {
    player,
    isLoaded,
    isModalOpen,
    setIsModalOpen,
    setPlayerName,
    updateProfile,
  };
}
