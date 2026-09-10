/**
 * Implementação pura e determinística do algoritmo de Fisher-Yates (Knuth) shuffle.
 * Retorna um novo array com os elementos em ordem aleatória sem modificar o original.
 */
export function shuffleArray<T>(items: readonly T[]): T[] {
  const array = [...items];
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
  return array;
}

/**
 * Seleciona N elementos aleatórios únicos de um array.
 */
export function pickRandomItems<T>(items: readonly T[], count: number): T[] {
  const shuffled = shuffleArray(items);
  return shuffled.slice(0, Math.min(count, items.length));
}
