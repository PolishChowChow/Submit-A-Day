import { QueryClientProvider } from '@tanstack/react-query';
import { useEffect, type ReactNode } from 'react';

import { AuthProvider } from '@/features/auth';
import { queryClient, setupQueryFocusManager } from '@/lib/query';
import { AppThemeProvider } from '@/theme';

/** Every app-wide provider, in dependency order. The root layout renders this once. */
export function AppProviders({ children }: { children: ReactNode }) {
  useEffect(() => setupQueryFocusManager(), []);

  return (
    <QueryClientProvider client={queryClient}>
      <AppThemeProvider>
        <AuthProvider>{children}</AuthProvider>
      </AppThemeProvider>
    </QueryClientProvider>
  );
}
