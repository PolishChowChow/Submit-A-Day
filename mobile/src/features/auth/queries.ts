import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { authApi } from './api';
import { useAuth } from './auth-provider';
import type { AuthResponse } from './types';

export const authKeys = {
  all: ['auth'] as const,
  me: () => [...authKeys.all, 'me'] as const,
};

export const authQueries = {
  me: () => queryOptions({ queryKey: authKeys.me(), queryFn: authApi.me }),
};

/** The signed-in user. Only runs while a session exists. */
export function useCurrentUser() {
  const { status } = useAuth();
  return useQuery({ ...authQueries.me(), enabled: status === 'signedIn' });
}

/** Shared success handler: store the session and seed the "me" cache. */
function useCompleteAuth() {
  const { signIn } = useAuth();
  const queryClient = useQueryClient();
  return async ({ token, user }: AuthResponse) => {
    queryClient.setQueryData(authKeys.me(), user);
    await signIn(token);
  };
}

export function useSignIn() {
  const completeAuth = useCompleteAuth();
  return useMutation({ mutationFn: authApi.signIn, onSuccess: completeAuth });
}

export function useSignUp() {
  const completeAuth = useCompleteAuth();
  return useMutation({ mutationFn: authApi.signUp, onSuccess: completeAuth });
}

/** Sign in (or sign up) with a GitHub authorization. Pair with useGitHubFlow. */
export function useGitHubSignIn() {
  const completeAuth = useCompleteAuth();
  return useMutation({ mutationFn: authApi.signInWithGitHub, onSuccess: completeAuth });
}

/** Connect GitHub to the signed-in account; updates the cached user. Pair with useGitHubFlow. */
export function useLinkGitHub() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: authApi.linkGitHub,
    onSuccess: (user) => queryClient.setQueryData(authKeys.me(), user),
  });
}

export function useUnlinkGitHub() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: authApi.unlinkGitHub,
    onSuccess: (user) => queryClient.setQueryData(authKeys.me(), user),
  });
}
