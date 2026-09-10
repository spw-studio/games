import { PlayerProfile } from '@/types/player';
import { STORAGE_KEYS } from './keys';
import { safeGetItem, safeSetItem } from './storage';

export function getPlayerProfile(): PlayerProfile | null {
  return safeGetItem<PlayerProfile | null>(STORAGE_KEYS.PLAYER_PROFILE, null);
}

export function savePlayerProfile(profile: PlayerProfile): void {
  const updated: PlayerProfile = {
    ...profile,
    ultimaAtividade: new Date().toISOString(),
  };
  safeSetItem(STORAGE_KEYS.PLAYER_PROFILE, updated);
}

export function createDefaultPlayerProfile(nome: string): PlayerProfile {
  const now = new Date().toISOString();
  const profile: PlayerProfile = {
    id: 'local-player',
    nome: nome.trim() || 'Colaborador',
    criadoEm: now,
    ultimaAtividade: now,
  };
  savePlayerProfile(profile);
  return profile;
}

export function touchPlayerActivity(): void {
  const current = getPlayerProfile();
  if (current) {
    savePlayerProfile(current);
  }
}
