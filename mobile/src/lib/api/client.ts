import { create } from 'axios';

import { API_URL } from '@/constants/config';

import { toApiError } from './errors';

let authToken: string | null = null;
let unauthorizedHandler: (() => void) | null = null;

/** Called by AuthProvider whenever the session changes. */
export function setAuthToken(token: string | null) {
  authToken = token;
}

/** Called by AuthProvider so a 401 from any request signs the user out. */
export function setUnauthorizedHandler(handler: (() => void) | null) {
  unauthorizedHandler = handler;
}

/** Every endpoint lives under `/api` (e.g. `/days` → `${API_URL}/api/days`). */
const API_PREFIX = '/api';

export const api = create({
  baseURL: `${API_URL.replace(/\/+$/, '')}${API_PREFIX}`,
  timeout: 10_000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  if (authToken) config.headers.Authorization = `Bearer ${authToken}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    const apiError = toApiError(error);
    if (apiError.isUnauthorized && authToken) unauthorizedHandler?.();
    return Promise.reject(apiError);
  }
);
