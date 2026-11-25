import { mockAuthApi, USE_MOCKS } from '@/dev';
import { api } from '@/lib/api';

import type { AuthResponse, SignInInput, SignUpInput, User } from './types';

// Endpoint paths are assumptions: change them to match the Submit-A-Day backend.
const httpAuthApi = {
  signIn: async (input: SignInInput) => (await api.post<AuthResponse>('/auth/login', input)).data,
  signUp: async (input: SignUpInput) =>
    (await api.post<AuthResponse>('/auth/register', input)).data,
  me: async () => (await api.get<User>('/auth/me')).data,
};

// TEMP: mock mode until the backend exists (see src/dev/README.md).
export const authApi = USE_MOCKS ? mockAuthApi : httpAuthApi;
