import { GAME_THEME_OVERRIDES, GLOBAL_THEME } from './themes';
import { GameThemeId, ThemeTokens } from './types';

export function resolveTheme(themeId: GameThemeId = 'default'): ThemeTokens {
  return {
    ...GLOBAL_THEME,
    ...GAME_THEME_OVERRIDES[themeId] ?? GAME_THEME_OVERRIDES.default,
  };
}