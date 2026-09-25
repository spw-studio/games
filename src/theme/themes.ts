import { GameThemeId, ThemeOverride, ThemeTokens } from './types';

/**
 * Paleta completa da plataforma (tema oficial: petróleo escuro + ciano).
 * Toda cor do projeto vive aqui. Os componentes consomem estes valores
 * através das variáveis CSS `--theme-*` expostas pelo `ThemeProvider` e
 * mapeadas no `tailwind.config.js`.
 */

// ---- Rampas de cor (ramps) ----

// Marca / primário — petróleo profundo
const brandRamp = {
  50: '#E6F4F8',
  100: '#C3E5ED',
  200: '#8FCADE',
  300: '#5BABCB',
  400: '#2E8CB3',
  500: '#0E7490',
  600: '#0B5C73',
  700: '#094A5C',
  800: '#073847',
  850: '#063040',
  900: '#052731',
  950: '#03181F',
};

// Acento — ciano/teal (usado em destaques, ícones e CTAs de acento)
const accentRamp = {
  50: '#E6FFFA',
  100: '#C7FFF5',
  200: '#99FBEA',
  300: '#5EEAD4',
  400: '#2DD4BF',
  500: '#14B8A6',
  600: '#0D9488',
  700: '#0F766E',
  800: '#115E59',
  900: '#134E4A',
  950: '#042F2E',
};

// Superfícies creme (compatibilidade) — recalibradas para o tema escuro
const creamRamp = {
  50: '#0B1926',
  100: '#0F1E2E',
  200: '#14273A',
  300: '#1E3A50',
  400: '#2A4A63',
  500: '#3A5F7A',
};

// Neutro genérico (baixo = escuro, alto = claro)
const grayRamp = {
  50: '#0E1B28',
  100: '#132436',
  200: '#1B3346',
  300: '#27455C',
  400: '#3A5C75',
  500: '#587C93',
  600: '#7A9BAF',
  700: '#A3BDCB',
  800: '#C9DBE4',
  900: '#E6EFF3',
};

// Estados semânticos (emerald = sucesso)
const emeraldRamp = {
  50: '#06281A',
  100: '#0A3A24',
  200: '#10502F',
  300: '#166534',
  400: '#16A34A',
  500: '#22C55E',
  600: '#4ADE80',
  700: '#86EFAC',
  800: '#BBF7D0',
  900: '#DCFCE7',
};

// amber = atenção
const amberRamp = {
  50: '#2C1E0A',
  100: '#3A2708',
  200: '#4D3406',
  300: '#78350F',
  400: '#B45309',
  500: '#D97706',
  600: '#F59E0B',
  700: '#FBBF24',
  800: '#FCD34D',
  900: '#FDE68A',
};

// rose = erro
const roseRamp = {
  50: '#2C1113',
  100: '#3A1418',
  200: '#4C1D24',
  300: '#7F1D1D',
  400: '#B91C1C',
  500: '#DC2626',
  600: '#EF4444',
  700: '#F87171',
  800: '#FCA5A5',
  900: '#FECACA',
};

// red = erro (legado)
const redRamp = {
  50: '#2C1113',
  100: '#3A1418',
  200: '#4C1D24',
  300: '#7F1D1D',
  400: '#B91C1C',
  500: '#DC2626',
  600: '#EF4444',
  700: '#F87171',
  800: '#FCA5A5',
  900: '#FECACA',
};

// sky = informação
const skyRamp = {
  50: '#0B2733',
  100: '#0D3341',
  200: '#0B4152',
  300: '#0E5A72',
  400: '#0284C7',
  500: '#0EA5E9',
  600: '#38BDF8',
  700: '#7DD3FC',
  800: '#BAE6FD',
  900: '#E0F2FE',
};

/**
 * Tema global oficial (escuro petróleo/ciano).
 */
export const GLOBAL_THEME: ThemeTokens = {
  // Superfícies & texto
  background: '#0A1420',
  foreground: '#F5FAFA',
  surface: '#0F1E2E',
  surfaceHover: '#152A3D',
  surfaceElevated: '#14273A',
  muted: '#132436',
  mutedForeground: '#93A8B5',
  subtleForeground: '#6B7F8D',
  border: '#1E3A50',
  borderStrong: '#2A4A63',

  // Marca / primário
  primary: brandRamp[500],
  primaryForeground: '#FFFFFF',
  primarySoft: '#0C2A38',
  primarySoftForeground: '#67E8F9',

  // Acento
  secondary: accentRamp[400],
  secondaryForeground: '#06251F',
  secondarySoft: '#0C2E2C',
  secondarySoftForeground: accentRamp[300],

  // Sucesso
  success: emeraldRamp[500],
  successForeground: emeraldRamp[900],
  successSoft: emeraldRamp[50],
  successSoftForeground: emeraldRamp[700],

  // Atenção
  warning: amberRamp[500],
  warningForeground: amberRamp[900],
  warningSoft: amberRamp[50],
  warningSoftForeground: amberRamp[700],

  // Erro
  danger: roseRamp[500],
  dangerForeground: roseRamp[900],
  dangerSoft: roseRamp[50],
  dangerSoftForeground: roseRamp[700],

  // Informação
  info: skyRamp[500],
  infoForeground: skyRamp[900],
  infoSoft: skyRamp[50],
  infoSoftForeground: skyRamp[700],

  // Superfície "hero"
  heroFrom: brandRamp[950],
  heroVia: brandRamp[900],
  heroTo: brandRamp[800],
  heroForeground: '#F5FAFA',

  // Overlay claro sobre superfícies escuras
  overlay: '#FFFFFF',

  // Raio & sombras
  radiusCard: '1rem',
  radiusControl: '0.75rem',
  shadowCard: '0 4px 14px rgb(0 0 0 / 0.35)',
  shadowElevated: '0 20px 40px rgb(0 0 0 / 0.5)',

  // Rampas completas
  brand: brandRamp,
  gold: accentRamp,
  cream: creamRamp,
  gray: grayRamp,
  emerald: emeraldRamp,
  amber: amberRamp,
  rose: roseRamp,
  red: redRamp,
  sky: skyRamp,
  white: '#FFFFFF',
  black: '#000000',
};

/**
 * Overrides opcionais por jogo. Um jogo sobrescreve apenas os tokens que
 * precisam de identidade própria; o restante herda do tema global.
 */
export const GAME_THEME_OVERRIDES: Record<string, ThemeOverride> = {
  default: {},
  memoria: {
    secondary: '#C084FC',
    secondaryForeground: '#1B0B2E',
    secondarySoft: '#2A1A3D',
    secondarySoftForeground: '#D8B4FE',
    radiusCard: '1.25rem',
  },
  'caca-palavras': {
    primary: '#0F766E',
    secondary: '#14B8A6',
    secondaryForeground: '#042F2E',
    secondarySoft: '#0C2E2C',
    secondarySoftForeground: '#5EEAD4',
    radiusCard: '0.875rem',
  },
  'montar-drink': {
    primary: '#0E7490',
    secondary: '#5EEAD4',
    secondaryForeground: '#083344',
    secondarySoft: '#0A2B33',
    secondarySoftForeground: '#99F6E4',
    radiusCard: '1.25rem',
  },
  'quiz-produtos': {
    // "Conhecimento Rápido": herda o petróleo global e recebe um acento âmbar
    // (visual de painel de quiz), sem criar paleta paralela.
    primary: brandRamp[500],
    secondary: amberRamp[600],
    secondaryForeground: amberRamp[50],
    secondarySoft: amberRamp[50],
    secondarySoftForeground: amberRamp[800],
    radiusCard: '1rem',
  },
  'base-master': {
    // "Base Master": petróleo profundo com acento cobre/âmbar e cantos largos
    // (coquetelaria + treinamento de bar), reaproveitando as rampas existentes.
    primary: brandRamp[600],
    secondary: amberRamp[500],
    secondaryForeground: amberRamp[50],
    secondarySoft: amberRamp[50],
    secondarySoftForeground: amberRamp[700],
    radiusCard: '1.5rem',
    radiusControl: '1rem',
  },
};

/**
 * Cores para gráficos (Recharts). Centralizadas aqui para que nenhum
 * componente declare literais de cor. Em SVG referenciamos os tokens do
 * tema via `rgb(var(--theme-*))`.
 */
export const CHART_COLORS = {
  grid: 'rgb(var(--theme-border))',
  axis: 'rgb(var(--theme-mutedForeground))',
  tooltipBackground: 'rgb(var(--theme-surfaceElevated))',
  tooltipText: 'rgb(var(--theme-foreground))',
  tooltipBorder: 'rgb(var(--theme-border))',
  primary: 'rgb(var(--theme-primary))',
  success: 'rgb(var(--theme-success))',
  accent: 'rgb(var(--theme-secondary))',
} as const;

/**
 * Paleta de destaque do Caça-Palavras. Usada tanto no canvas do grid quanto
 * nos chips da lista de palavras, garantindo correspondência 1:1 de cores.
 */
export const WORD_SEARCH_COLORS = [
  '#059669',
  '#0284C7',
  '#D97706',
  '#E11D48',
  '#7C3AED',
  '#0F766E',
  '#EA580C',
  '#DB2777',
  '#65A30D',
  '#0891B2',
] as const;

/**
 * Paleta usada em efeitos de comemoração (canvas-confetti).
 */
export const CELEBRATION_COLORS = [
  brandRamp[900],
  accentRamp[400],
  accentRamp[300],
  emeraldRamp[500],
  amberRamp[500],
] as const;

export type { GameThemeId };
