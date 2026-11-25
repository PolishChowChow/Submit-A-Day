import { useColorScheme } from 'react-native';

import type { ColorScheme } from './types';

/** The OS color scheme (native). */
export function useSystemColorScheme(): ColorScheme {
  return useColorScheme() === 'dark' ? 'dark' : 'light';
}
