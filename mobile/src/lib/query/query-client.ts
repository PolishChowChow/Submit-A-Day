import { focusManager, QueryClient } from '@tanstack/react-query';
import { AppState, Platform } from 'react-native';

import type { ApiError } from '@/lib/api';

/**
 * Make `error` in useQuery / useMutation typed as ApiError everywhere,
 * so screens can read `error.message` / `error.status` without casting.
 */
declare module '@tanstack/react-query' {
  interface Register {
    defaultError: ApiError;
  }
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 5 * 60_000,
      // 4xx won't succeed on retry; retry network / 5xx errors twice.
      retry: (failureCount, error) => !error.isClientError && failureCount < 2,
    },
    mutations: {
      retry: false,
    },
  },
});

/**
 * React Native has no window-focus event: tell TanStack Query when the app
 * comes back to the foreground so stale queries refetch. Returns a cleanup.
 */
export function setupQueryFocusManager() {
  if (Platform.OS === 'web') return () => {};
  const subscription = AppState.addEventListener('change', (status) => {
    focusManager.setFocused(status === 'active');
  });
  return () => subscription.remove();
}
