import type { UseMutationResult } from '@tanstack/react-query';
import { makeRedirectUri, useAuthRequest } from 'expo-auth-session';
import { useCallback, useState } from 'react';

import { GITHUB_CLIENT_ID } from '@/constants/config';
import type { ApiError } from '@/lib/api';

import type { GitHubAuthInput } from './types';

/**
 * GitHub sign-in, app half: authorization code flow with PKCE (expo-auth-session).
 * The app opens GitHub, gets a one-time `code`, and hands it to the server, which exchanges it
 * with the client secret. The app never holds a GitHub token or secret.
 */

const discovery = {
  authorizationEndpoint: 'https://github.com/login/oauth/authorize',
  tokenEndpoint: 'https://github.com/login/oauth/access_token',
};

/** Route that GitHub redirects back to: src/app/oauth/github.tsx. Register the full URL on GitHub. */
export const GITHUB_REDIRECT_PATH = 'oauth/github';

/** `mobile://oauth/github` in a development build, `<origin>/oauth/github` on web. */
export const githubRedirectUri = () => makeRedirectUri({ path: GITHUB_REDIRECT_PATH });

/** Opens GitHub and resolves with what the server needs, or `null` if the user backed out. */
export function useGitHubAuthorization() {
  const enabled = Boolean(GITHUB_CLIENT_ID);
  // Always called (rules of hooks); with no client ID it's never prompted.
  const [request, , promptAsync] = useAuthRequest(
    {
      clientId: GITHUB_CLIENT_ID ?? 'github-sign-in-disabled',
      // OAuth App scopes (a GitHub App ignores them and uses its permissions instead).
      scopes: ['read:user', 'user:email'],
      redirectUri: githubRedirectUri(),
      usePKCE: true,
    },
    discovery
  );

  const authorize = useCallback(async (): Promise<GitHubAuthInput | null> => {
    if (!request?.codeVerifier) throw new Error('GitHub sign-in is still loading. Try again.');
    // Called synchronously from the tap: on web a popup opened later gets blocked.
    const result = await promptAsync();

    if (result.type === 'success') {
      const { code } = result.params;
      if (!code) throw new Error('GitHub did not return a sign-in code. Try again.');
      return { code, redirectUri: request.redirectUri, codeVerifier: request.codeVerifier };
    }
    if (result.type === 'error') {
      // "Cancel" on GitHub's consent page: treat like closing the browser.
      if (result.params.error === 'access_denied') return null;
      // Includes state_mismatch: expo-auth-session verifies `state` itself.
      throw new Error('GitHub sign-in failed. Try again.');
    }
    return null; // cancel / dismiss / locked
  }, [request, promptAsync]);

  return { enabled, ready: request !== null, authorize };
}

/**
 * Runs GitHub authorization, then `mutation` with the result. One error and busy flag covering
 * both steps, for a single button. Backing out is not an error.
 */
export function useGitHubFlow<TData>(
  mutation: UseMutationResult<TData, ApiError, GitHubAuthInput>
) {
  const { enabled, ready, authorize } = useGitHubAuthorization();
  const [authorizing, setAuthorizing] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const start = () => {
    setAuthError(null);
    mutation.reset();
    setAuthorizing(true);
    authorize()
      .then((input) => {
        if (input) mutation.mutate(input);
      })
      .catch((error: unknown) => {
        setAuthError(error instanceof Error ? error.message : 'GitHub sign-in failed. Try again.');
      })
      .finally(() => setAuthorizing(false));
  };

  return {
    enabled,
    start,
    disabled: !ready || authorizing || mutation.isPending,
    busy: authorizing || mutation.isPending,
    error: authError ?? mutation.error?.message ?? null,
  };
}
