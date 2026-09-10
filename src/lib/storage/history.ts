import { GAME_CONFIG } from '@/config/game-config';
import { GameResult } from '@/types/game';
import { STORAGE_KEYS } from './keys';
import { safeGetItem, safeSetItem } from './storage';

/**
 * Retorna todo o histórico de partidas armazenado.
 */
export function getGameHistory(): GameResult[] {
  return safeGetItem<GameResult[]>(STORAGE_KEYS.GAME_HISTORY, []);
}

/**
 * Salva uma nova partida no histórico (respeitando o limite de 100 partidas)
 * e atualiza o último resultado salvo.
 */
export function saveGameResult(result: GameResult): void {
  const history = getGameHistory();
  // Insere a nova partida no topo da lista
  const updatedHistory = [result, ...history].slice(0, GAME_CONFIG.MAX_HISTORY);
  safeSetItem(STORAGE_KEYS.GAME_HISTORY, updatedHistory);
  safeSetItem(STORAGE_KEYS.LAST_GAME_RESULT, result);
}

/**
 * Retorna o resultado da última partida jogada (para a tela de resultado).
 */
export function getLastGameResult(): GameResult | null {
  return safeGetItem<GameResult | null>(STORAGE_KEYS.LAST_GAME_RESULT, null);
}

/**
 * Limpa todo o histórico de partidas locais.
 */
export function clearGameHistory(): void {
  safeSetItem(STORAGE_KEYS.GAME_HISTORY, []);
  safeSetItem(STORAGE_KEYS.LAST_GAME_RESULT, null);
}

/**
 * Retorna partidas filtradas por ID do jogo.
 */
export function getGameHistoryByGame(gameId: string): GameResult[] {
  return getGameHistory().filter((item) => item.gameId === gameId);
}
