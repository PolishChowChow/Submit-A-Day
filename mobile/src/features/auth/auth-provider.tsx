import { useQueryClient } from '@tanstack/react-query';
import { createContext, use, useCallback, useEffect, useState, type ReactNode } from 'react';

import { setAuthToken, setUnauthorizedHandler } from '@/lib/api';
import { storage, StorageKeys } from '@/lib/storage';

export type AuthStatus = 'loading' | 'signedIn' | 'signedOut';

type AuthContextValue = {
  status: AuthStatus;
  token: string | null;
  /** Persist a token from the API and switch to the signed-in route group. */
  signIn: (token: string) => Promise<void>;
  /** Forget the token, clear all cached server data, and switch to the auth route group. */
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Owns the session token. The root layout reads `status` to choose between the
 * (auth) and (app) route groups, so signing in or out navigates automatically.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [token, setToken] = useState<string | null>(null);
  const [status, setStatus] = useState<AuthStatus>('loading');

  // Restore a saved session on launch.
  useEffect(() => {
    let cancelled = false;
    storage
      .get(StorageKeys.authToken)
      .catch(() => null)
      .then((saved) => {
        if (cancelled) return;
        setAuthToken(saved);
        setToken(saved);
        setStatus(saved ? 'signedIn' : 'signedOut');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const signIn = useCallback(async (newToken: string) => {
    await storage.set(StorageKeys.authToken, newToken);
    setAuthToken(newToken);
    setToken(newToken);
    setStatus('signedIn');
  }, []);

  const signOut = useCallback(async () => {
    setAuthToken(null);
    setToken(null);
    setStatus('signedOut');
    queryClient.clear();
    await storage.remove(StorageKeys.authToken).catch(() => {});
  }, [queryClient]);

  // Any 401 from the API (expired / revoked token) signs the user out.
  useEffect(() => {
    setUnauthorizedHandler(() => void signOut());
    return () => setUnauthorizedHandler(null);
  }, [signOut]);

  return <AuthContext value={{ status, token, signIn, signOut }}>{children}</AuthContext>;
}

export function useAuth(): AuthContextValue {
  const value = use(AuthContext);
  if (!value) throw new Error('useAuth must be used inside <AuthProvider>');
  return value;
}
