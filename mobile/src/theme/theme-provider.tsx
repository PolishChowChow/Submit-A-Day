import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { createContext, use, useCallback, useEffect, useState, type ReactNode } from 'react';
import { Appearance, Platform } from 'react-native';
import { TamaguiProvider, Theme, useTheme } from 'tamagui';

import { storage, StorageKeys } from '@/lib/storage';

import { config } from '../../tamagui.config';
import { isThemePreference, type ColorScheme, type ThemePreference } from './types';
import { useSystemColorScheme } from './use-system-color-scheme';

type AppThemeContextValue = {
  /** What the user selected ('system' | 'light' | 'dark'). */
  preference: ThemePreference;
  /** What is actually rendered right now. */
  colorScheme: ColorScheme;
  setPreference: (preference: ThemePreference) => void;
  /** False until the saved preference has been read (keeps the splash screen up). */
  isReady: boolean;
};

const AppThemeContext = createContext<AppThemeContextValue | null>(null);

/**
 * Single source of truth for light/dark mode.
 * - Follows the OS automatically (preference 'system', the default) and reacts live to OS changes.
 * - Lets the user force light or dark; the choice is persisted on the device.
 * - Drives Tamagui themes, React Navigation colors (headers, tab bar, screen backgrounds),
 *   the status bar, and native UI (alerts, pickers, keyboard) via Appearance.
 */
export function AppThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useSystemColorScheme();
  const [preference, setPreferenceState] = useState<ThemePreference>('system');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    storage
      .get(StorageKeys.themePreference)
      .then((saved) => {
        if (!cancelled && isThemePreference(saved)) setPreferenceState(saved);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setIsReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Keep natively rendered UI in sync with the in-app choice.
  useEffect(() => {
    if (Platform.OS === 'web') return;
    Appearance.setColorScheme(preference === 'system' ? 'unspecified' : preference);
  }, [preference]);

  const setPreference = useCallback((next: ThemePreference) => {
    setPreferenceState(next);
    storage.set(StorageKeys.themePreference, next).catch(() => {});
  }, []);

  const colorScheme: ColorScheme = preference === 'system' ? systemScheme : preference;

  return (
    <AppThemeContext value={{ preference, colorScheme, setPreference, isReady }}>
      <TamaguiProvider config={config} defaultTheme={colorScheme}>
        <Theme name={colorScheme}>
          <NavigationTheme colorScheme={colorScheme}>{children}</NavigationTheme>
        </Theme>
      </TamaguiProvider>
    </AppThemeContext>
  );
}

/** Maps the active Tamagui theme onto React Navigation so headers and tab bars match. */
function NavigationTheme({
  colorScheme,
  children,
}: {
  colorScheme: ColorScheme;
  children: ReactNode;
}) {
  const theme = useTheme();
  const base = colorScheme === 'dark' ? DarkTheme : DefaultTheme;

  const navigationTheme = {
    ...base,
    colors: {
      ...base.colors,
      // 60%: screen background. 30%: header and tab bar. 10%: active tab / back button.
      background: theme.background?.val ?? base.colors.background,
      card: theme.surface?.val ?? base.colors.card,
      text: theme.color?.val ?? base.colors.text,
      border: theme['border-color']?.val ?? base.colors.border,
      primary: theme.primary?.val ?? base.colors.primary,
      notification: theme.danger?.val ?? base.colors.notification,
    },
  };

  return (
    <NavigationThemeProvider value={navigationTheme}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      {children}
    </NavigationThemeProvider>
  );
}

export function useAppTheme(): AppThemeContextValue {
  const value = use(AppThemeContext);
  if (!value) throw new Error('useAppTheme must be used inside <AppThemeProvider>');
  return value;
}

/** The resolved scheme ('light' | 'dark'). Use this instead of React Native's useColorScheme. */
export function useColorScheme(): ColorScheme {
  return useAppTheme().colorScheme;
}
