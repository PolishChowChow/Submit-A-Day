import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, type RenderOptions } from '@testing-library/react-native';
import type { ReactElement, ReactNode } from 'react';
import { TamaguiProvider } from 'tamagui';

import { config } from '../../tamagui.config';

/** A fresh client per test: no retries (failures show immediately), no cache between tests. */
export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: Infinity },
      // gcTime Infinity: no 5-minute garbage-collection timers that keep Jest alive after the test.
      mutations: { retry: false, gcTime: Infinity },
    },
  });
}

/** `render` with the app's providers (TanStack Query + Tamagui). Test-only, not a route. */
export async function renderWithProviders(
  ui: ReactElement,
  { queryClient = createTestQueryClient(), ...options }: RenderOptions & { queryClient?: QueryClient } = {}
) {
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <TamaguiProvider config={config} defaultTheme="light">
        {children}
      </TamaguiProvider>
    </QueryClientProvider>
  );
  return { queryClient, ...(await render(ui, { wrapper: Wrapper, ...options })) };
}
