import {
  BaseMasterDrinkProgress,
  BaseMasterProgressMap,
  BaseMasterProgressSummary,
} from '@/types/base-master';
import { STORAGE_KEYS } from './keys';
import { safeGetItem, safeRemoveItem, safeSetItem } from './storage';

/**
 * Memória de aprendizado do Base Master (localStorage).
 *
 * Guarda apenas agregados por drink (`seen`/`correct`/`wrong`) — nenhum dado do
 * catálogo é duplicado aqui, só o `id` como referência. Essa memória alimenta a
 * repetição espaçada (`getDrinkWeight`/`orderDrinksForRound`) e o resumo
 * exibido na tela de configuração.
 */

export interface BaseMasterProgressUpdate {
  drinkId: string;
  /** Resultado da resposta (`undefined` = apenas marcou como visto). */
  isCorrect?: boolean;
  /** Marca que o drink foi apresentado (modo Aprender). */
  seen?: boolean;
}

/** Lê o histórico salvo (objeto vazio quando não há nada). */
export function loadBaseMasterProgress(): BaseMasterProgressMap {
  return safeGetItem<BaseMasterProgressMap>(STORAGE_KEYS.BASE_MASTER_PROGRESS, {});
}

/** Persiste o histórico completo. */
export function saveBaseMasterProgress(progress: BaseMasterProgressMap): void {
  safeSetItem(STORAGE_KEYS.BASE_MASTER_PROGRESS, progress);
}

/**
 * Merge PURO do histórico — testável sem `localStorage`.
 * Atualiza os agregados de cada drink tocado e mantém os demais intactos.
 */
export function applyBaseMasterProgress(
  progress: BaseMasterProgressMap,
  updates: readonly BaseMasterProgressUpdate[],
  timestamp: string = new Date().toISOString()
): BaseMasterProgressMap {
  const next: BaseMasterProgressMap = { ...progress };

  for (const update of updates) {
    const previous: BaseMasterDrinkProgress = next[update.drinkId] ?? {
      drinkId: update.drinkId,
      seen: 0,
      correct: 0,
      wrong: 0,
      lastPlayedAt: timestamp,
    };

    next[update.drinkId] = {
      ...previous,
      seen: previous.seen + (update.seen ? 1 : 0),
      correct: previous.correct + (update.isCorrect === true ? 1 : 0),
      wrong: previous.wrong + (update.isCorrect === false ? 1 : 0),
      lastPlayedAt: timestamp,
    };
  }

  return next;
}

/** Resumo para a UI, considerando apenas os drinks disponíveis hoje. */
export function summarizeBaseMasterProgress(
  progress: BaseMasterProgressMap,
  drinkIds: readonly string[]
): BaseMasterProgressSummary {
  let reviewed = 0;
  let struggling = 0;

  for (const drinkId of drinkIds) {
    const entry = progress[drinkId];
    if (!entry) continue;

    if (entry.seen > 0 || entry.correct + entry.wrong > 0) reviewed += 1;
    if (entry.wrong > entry.correct) struggling += 1;
  }

  return { total: drinkIds.length, reviewed, struggling };
}

/** Limpa a memória de aprendizado do módulo. */
export function clearBaseMasterProgress(): void {
  safeRemoveItem(STORAGE_KEYS.BASE_MASTER_PROGRESS);
}
