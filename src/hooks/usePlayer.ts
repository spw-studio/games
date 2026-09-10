'use client';

import { useEffect, useState } from 'react';
import { PlayerProfile } from '@/types/player';
import {
  createDefaultPlayerProfile,
  getPlayerProfile,
  savePlayerProfile,
  touchPlayerActivity,
} from '@/lib/storage/player';

export function usePlayer() {
  const [player, setPlayer] = useState<PlayerProfile | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const existing = getPlayerProfile();
    if (existing) {
      setPlayer(existing);
      touchPlayerActivity();
    } else {
      // Abre o modal de primeiro acesso caso não exista perfil
      setIsModalOpen(true);
    }
    setIsLoaded(true);
  }, []);

  const setPlayerName = (name: string) => {
    const newProfile = createDefaultPlayerProfile(name);
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
