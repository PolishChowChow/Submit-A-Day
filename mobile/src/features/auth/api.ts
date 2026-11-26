import { mockAuthApi, USE_MOCKS } from '@/dev';
import { api } from '@/lib/api';

import type { AuthResponse, GitHubAuthInput, SignInInput, SignUpInput, User } from './types';

// Contract: server/PROJECT_STRUCTURE.md → Endpoints.
const httpAuthApi = {
  signIn: async (input: SignInInput) => (await api.post<AuthResponse>('/auth/login', input)).data,
  signUp: async (input: SignUpInput) =>
    (await api.post<AuthResponse>('/auth/register', input)).data,
  me: async () => (await api.get<User>('/auth/me')).data,
  /** Sign in, or create the account on first use. */
  signInWithGitHub: async (input: GitHubAuthInput) =>
    (await api.post<AuthResponse>('/auth/github', input)).data,
  /** Connect GitHub to the signed-in account. */
  linkGitHub: async (input: GitHubAuthInput) =>
    (await api.post<User>('/auth/github/link', input)).data,
  unlinkGitHub: async () => (await api.delete<User>('/auth/github')).data,
};

// TEMP: mock mode until the backend exists (see src/dev/README.md).
export const authApi = USE_MOCKS ? mockAuthApi : httpAuthApi;
