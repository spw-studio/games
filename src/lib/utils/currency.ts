/**
 * Formatação monetária compartilhada.
 *
 * Centraliza o padrão brasileiro (R$ 1.234,50) usado por toda a interface,
 * evitando concatenações manuais espalhadas pelos componentes.
 */

/** Formata um valor numérico em Real brasileiro (ex.: 1234.5 → "R$ 1.234,50"). */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}
