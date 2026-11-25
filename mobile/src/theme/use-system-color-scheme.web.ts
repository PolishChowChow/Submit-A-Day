import { useSyncExternalStore } from 'react';
import { useColorScheme } from 'react-native';

import type { ColorScheme } from './types';

const subscribe = () => () => {};

/**
 * The OS color scheme (web). Returns 'light' during server rendering / hydration
 * so the markup matches, then the real value on the client.
 */
export function useSystemColorScheme(): ColorScheme {
  const isClient = useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  );
  const scheme = useColorScheme();
  return isClient && scheme === 'dark' ? 'dark' : 'light';
}
