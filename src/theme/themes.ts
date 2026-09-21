import { GameThemeId, ThemeOverride, ThemeTokens } from './types';

export const GLOBAL_THEME: ThemeTokens = {
  background: '#FAF8F5',
  foreground: '#1A0A09',
  surface: '#FFFFFF',
  surfaceHover: '#FAF8F3',
  primary: '#44100D',
  primaryForeground: '#FFFFFF',
  secondary: '#C89D5C',
  secondaryForeground: '#4F3514',
  border: '#EAE1D3',
  muted: '#F4EFE6',
  mutedForeground: '#6B625A',
  success: '#059669',
  warning: '#D97706',
  danger: '#DC2626',
  radiusCard: '1rem',
  radiusControl: '0.75rem',
  shadowCard: '0 4px 14px rgb(68 16 13 / 0.08)',
  shadowElevated: '0 20px 40px rgb(68 16 13 / 0.12)',
};

export const GAME_THEME_OVERRIDES: Record<string, ThemeOverride> = {
  default: {},
  memoria: {
    secondary: '#DBB674',
    secondaryForeground: '#67481C',
    radiusCard: '1.25rem',
  },
  'caca-palavras': {
    primary: '#0F766E',
    secondary: '#14B8A6',
    secondaryForeground: '#134E4A',
    radiusCard: '0.875rem',
  },
  'montar-drink': {
    primary: '#7C2D12',
    secondary: '#D97706',
    secondaryForeground: '#7C2D12',
    radiusCard: '1.25rem',
  },
};