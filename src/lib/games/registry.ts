import { REGISTERED_GAMES } from '@/data/games';
import { GameDefinition } from '@/types/game';

let gamesRegistry: GameDefinition[] = [...REGISTERED_GAMES];

/**
 * Retorna todos os jogos registrados na plataforma (ativos e inativos).
 */
export function getAllGames(): GameDefinition[] {
  return [...gamesRegistry];
}

/**
 * Retorna apenas os jogos com `ativo: true`.
 * A Home e a listagem consom esta função dinamicamente.
 */
export function getActiveGames(): GameDefinition[] {
  return gamesRegistry.filter((game) => game.ativo);
}

/**
 * Busca a definição de um jogo pelo ID.
 */
export function getGameById(id: string): GameDefinition | undefined {
  return gamesRegistry.find((game) => game.id === id);
}

/**
 * Permite registrar dinamicamente novos jogos em tempo de execução se desejado.
 */
export function registerGame(game: GameDefinition): void {
  const index = gamesRegistry.findIndex((g) => g.id === game.id);
  if (index >= 0) {
    gamesRegistry[index] = game;
  } else {
    gamesRegistry.push(game);
  }
}
