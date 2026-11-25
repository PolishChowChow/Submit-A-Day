import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

/** Keys for everything the app persists on the device. */
export const StorageKeys = {
  authToken: 'auth.token',
  themePreference: 'theme.preference',
} as const;

type StorageKey = (typeof StorageKeys)[keyof typeof StorageKeys];

/**
 * Small async key-value store.
 * - iOS / Android: encrypted `expo-secure-store` (Keychain / Keystore).
 * - Web: `localStorage` (absent during server rendering, so every call is guarded).
 */
export const storage = {
  async get(key: StorageKey): Promise<string | null> {
    if (Platform.OS === 'web') return globalThis.localStorage?.getItem(key) ?? null;
    return SecureStore.getItemAsync(key);
  },
  async set(key: StorageKey, value: string): Promise<void> {
    if (Platform.OS === 'web') {
      globalThis.localStorage?.setItem(key, value);
      return;
    }
    await SecureStore.setItemAsync(key, value);
  },
  async remove(key: StorageKey): Promise<void> {
    if (Platform.OS === 'web') {
      globalThis.localStorage?.removeItem(key);
      return;
    }
    await SecureStore.deleteItemAsync(key);
  },
};
