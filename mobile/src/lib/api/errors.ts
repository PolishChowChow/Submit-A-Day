import { isAxiosError } from 'axios';

/** The single error type every API call rejects with (see the interceptor in client.ts). */
export class ApiError extends Error {
  readonly status: number | null;
  readonly data: unknown;

  constructor(message: string, status: number | null, data?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }

  get isUnauthorized() {
    return this.status === 401;
  }

  get isClientError() {
    return this.status !== null && this.status >= 400 && this.status < 500;
  }
}

function readServerMessage(data: unknown): string | undefined {
  if (typeof data === 'object' && data !== null && 'message' in data) {
    const { message } = data as { message: unknown };
    if (typeof message === 'string') return message;
    if (Array.isArray(message) && typeof message[0] === 'string') return message[0];
  }
  return undefined;
}

export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;

  if (isAxiosError(error)) {
    const status = error.response?.status ?? null;
    const data = error.response?.data;
    const message =
      readServerMessage(data) ??
      (status === null ? 'Network error. Check your connection.' : `Request failed (${status}).`);
    return new ApiError(message, status, data);
  }

  return new ApiError(error instanceof Error ? error.message : 'Something went wrong.', null);
}

export function getErrorMessage(error: unknown): string {
  return toApiError(error).message;
}
