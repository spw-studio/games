import { PlayerProfile } from '@/types/player';
import { STORAGE_KEYS } from './keys';
import { safeGetItem, safeSetItem } from './storage';

export function getPlayerProfile(): PlayerProfile | null {
  const profile = safeGetItem<Partial<PlayerProfile> | null>(STORAGE_KEYS.PLAYER_PROFILE, null);
  if (!profile) return null;

  const migrated: PlayerProfile = {
    id: profile.id && profile.id !== 'local-player' ? profile.id : createLocalPlayerId(),
    nome: profile.nome || 'Colaborador',
    authType: profile.authType === 'google' ? 'google' : 'local',
    email: profile.email,
    criadoEm: profile.criadoEm || new Date().toISOString(),
    ultimaAtividade: profile.ultimaAtividade || new Date().toISOString(),
  };

  if (migrated.id !== profile.id || migrated.authType !== profile.authType) {
    savePlayerProfile(migrated);
  }

  return migrated;
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
    id: createLocalPlayerId(),
    nome: nome.trim() || 'Colaborador',
    authType: 'local',
    criadoEm: now,
    ultimaAtividade: now,
  };
  savePlayerProfile(profile);
  return profile;
}

export function createGooglePlayerProfile(nome: string, email: string, id: string): PlayerProfile {
  const now = new Date().toISOString();
  const profile: PlayerProfile = {
    id: `google:${id}`,
    nome: nome.trim() || 'Colaborador',
    authType: 'google',
    email,
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

function createLocalPlayerId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `local:${crypto.randomUUID()}`;
  }

  return `local:${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
