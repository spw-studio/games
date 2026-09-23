'use client';

import { CSSProperties, ReactNode } from 'react';
import { resolveTheme } from './resolve-theme';
import { buildCssVariables } from './css-variables';
import { GameThemeId } from './types';

interface ThemeProviderProps {
  children: ReactNode;
  themeId?: GameThemeId;
  /** Classes extras do wrapper que injeta as variáveis (ex: layout de partida). */
  className?: string;
}

/**
 * Injeta TODOS os tokens do tema como variáveis CSS (`--theme-*`) no escopo.
 * Converte cores hex em canais RGB para permitir modificadores de opacidade
 * do Tailwind (ex: `bg-surface/70`, `text-secondary/80`).
 */
export function ThemeProvider({ children, themeId = 'default', className }: ThemeProviderProps) {
  const tokens = resolveTheme(themeId);
  const style = buildCssVariables(tokens) as CSSProperties;

  return (
    <div data-theme={themeId} style={style} className={className}>
      {children}
    </div>
  );
}