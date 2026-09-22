import { ThemeTokens } from './types';

const HEX_PATTERN = /^#([0-9a-fA-F]{6})$/;

/**
 * Converte um hex (#RRGGBB) em canais RGB separados por espaço ("R G B"),
 * formato exigido pelo Tailwind para suportar modificadores de opacidade
 * (ex: `bg-surface/70`). Valores não-hex são retornados sem alteração.
 */
export function hexToRgbChannels(value: string): string {
  const match = HEX_PATTERN.exec(value.trim());
  if (!match) {
    return value;
  }
  const int = parseInt(match[1], 16);
  const r = (int >> 16) & 255;
  const g = (int >> 8) & 255;
  const b = int & 255;
  return `${r} ${g} ${b}`;
}

/**
 * Achata os tokens do tema em variáveis CSS `--theme-*`.
 * - Tokens de cor viram canais RGB ("R G B").
 * - Tokens de escala (brand/gold/...) viram `--theme-<ramp>-<shade>`.
 * - Tokens estruturais (radius, shadow) são mantidos como string bruta.
 */
export function buildCssVariables(tokens: ThemeTokens): Record<string, string> {
  const variables: Record<string, string> = {};

  for (const [key, value] of Object.entries(tokens)) {
    if (value && typeof value === 'object') {
      for (const [shade, shadeValue] of Object.entries(value)) {
        if (typeof shadeValue === 'string' && shadeValue) {
          variables[`--theme-${key}-${shade}`] = hexToRgbChannels(shadeValue);
        }
      }
      continue;
    }

    if (typeof value === 'string' && value) {
      variables[`--theme-${key}`] = hexToRgbChannels(value);
    }
  }

  return variables;
}

/**
 * Gera o bloco de texto `--theme-*: valor;` para uso em CSS estático
 * (fallback em `globals.css`) a partir do tema global.
 */
export function buildCssVariablesBlock(tokens: ThemeTokens, indent = '  '): string {
  const variables = buildCssVariables(tokens);
  return Object.entries(variables)
    .map(([name, value]) => `${indent}${name}: ${value};`)
    .join('\n');
}