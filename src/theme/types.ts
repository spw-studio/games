export type GameThemeId = string;

export interface ThemeTokens {
  background: string;
  foreground: string;
  surface: string;
  surfaceHover: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  border: string;
  muted: string;
  mutedForeground: string;
  success: string;
  warning: string;
  danger: string;
  radiusCard: string;
  radiusControl: string;
  shadowCard: string;
  shadowElevated: string;
}

export type ThemeOverride = Partial<ThemeTokens>;