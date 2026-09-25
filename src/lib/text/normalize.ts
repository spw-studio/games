/**
 * Normalização de texto compartilhada pelos jogos de palavras.
 *
 * Fonte única para comparações "insensíveis" a caixa, acentos e cedilha
 * (ex: `Á` ≡ `A`, `Ç` ≡ `C`). Nenhum nome original do catálogo é alterado:
 * as funções abaixo devolvem apenas uma chave de comparação.
 */

/** Remove acentos, cedilha e demais diacríticos, preservando a caixa. */
export function stripDiacritics(text: string): string {
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

/**
 * Normaliza um texto para comparação:
 * - remove acentos/cedilha (`Á` → `A`, `Ç` → `C`);
 * - converte para maiúsculas;
 * - descarta pontuação e mantém espaços simples entre as palavras.
 *
 * Os espaços entre palavras são preservados porque jogos de palavras os usam
 * como separadores visíveis.
 */
export function normalizeWord(text: string): string {
  return stripDiacritics(text)
    .toUpperCase()
    .replace(/[^A-Z0-9 ]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Compara dois textos ignorando caixa, acentos e espaços extras. */
export function isSameWord(a: string, b: string): boolean {
  return normalizeWord(a) === normalizeWord(b);
}
