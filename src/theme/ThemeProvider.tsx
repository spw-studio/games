'use client';

import { CSSProperties, ReactNode } from 'react';
import { resolveTheme } from './resolve-theme';
import { GameThemeId } from './types';

interface ThemeProviderProps {
  children: ReactNode;
  themeId?: GameThemeId;
}

export function ThemeProvider({ children, themeId = 'default' }: ThemeProviderProps) {
  const tokens = resolveTheme(themeId);
  const style = Object.entries(tokens).reduce((variables, [token, value]) => {
    variables[`--theme-${token}`] = value;
    return variables;
  }, {} as Record<string, string>) as CSSProperties;

  return (
    <div className="theme-root" data-theme={themeId} style={style}>
      {children}
    </div>
  );
}