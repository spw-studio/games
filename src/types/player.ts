export interface PlayerProfile {
  id: string;
  nome: string;
  authType: 'local' | 'google';
  email?: string;
  criadoEm: string;
  ultimaAtividade: string;
}
