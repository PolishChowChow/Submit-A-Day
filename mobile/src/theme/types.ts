export type ColorScheme = 'light' | 'dark';

/** What the user picked in Settings. 'system' follows the OS. */
export type ThemePreference = 'system' | ColorScheme;

export const THEME_PREFERENCES: readonly ThemePreference[] = ['system', 'light', 'dark'];

export function isThemePreference(value: unknown): value is ThemePreference {
  return typeof value === 'string' && (THEME_PREFERENCES as readonly string[]).includes(value);
}
