export type GameThemeId = string;

/**
 * Escala de cores. Cada chave representa um "shade" (ex: 50, 100, ... 950)
 * cujo valor é um hex (#RRGGBB). Toda a paleta do projeto vive aqui para que
 * os componentes apenas referenciem classes utilitárias controladas pelo tema.
 */
export type PaletteScale = Record<string, string>;

/**
 * Tokens semânticos e paleta completa da plataforma.
 * Esta é a ÚNICA fonte de verdade de estilos cromáticos: alterar qualquer
 * valor aqui reflete em todos os componentes automaticamente.
 */
export interface ThemeTokens {
  // ---- Superfícies & texto ----
  background: string;
  foreground: string;
  surface: string;
  surfaceHover: string;
  surfaceElevated: string;
  muted: string;
  mutedForeground: string;
  subtleForeground: string;
  border: string;
  borderStrong: string;

  // ---- Marca (brand = primário) ----
  primary: string;
  primaryForeground: string;
  primarySoft: string;
  primarySoftForeground: string;

  // ---- Acento (secondary = destaque) ----
  secondary: string;
  secondaryForeground: string;
  secondarySoft: string;
  secondarySoftForeground: string;

  // ---- Estados semânticos ----
  success: string;
  successForeground: string;
  successSoft: string;
  successSoftForeground: string;

  warning: string;
  warningForeground: string;
  warningSoft: string;
  warningSoftForeground: string;

  danger: string;
  dangerForeground: string;
  dangerSoft: string;
  dangerSoftForeground: string;

  info: string;
  infoForeground: string;
  infoSoft: string;
  infoSoftForeground: string;

  // ---- Superfície "hero" (banners de destaque) ----
  heroFrom: string;
  heroVia: string;
  heroTo: string;
  heroForeground: string;

  // ---- Overlay sobre superfícies escuras (bg-white/10 etc.) ----
  overlay: string;

  // ---- Raio & sombras ----
  radiusCard: string;
  radiusControl: string;
  shadowCard: string;
  shadowElevated: string;

  // ---- Paletas completas (compatibilidade com classes utilitárias) ----
  brand: PaletteScale;
  gold: PaletteScale;
  cream: PaletteScale;
  gray: PaletteScale;
  emerald: PaletteScale;
  amber: PaletteScale;
  rose: PaletteScale;
  red: PaletteScale;
  sky: PaletteScale;
  white: string;
  black: string;
}

export type ThemeOverride = Partial<ThemeTokens>;