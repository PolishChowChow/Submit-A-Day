import { isAxiosError } from 'axios';

export const ERROR_MESSAGES = {
  network: "Can't reach the server. Check your connection and try again.",
  timeout: 'The server took too long to respond. Try again in a moment.',
  server: 'The server is having problems right now. Try again in a moment.',
  unknown: 'Something went wrong.',
} as const;

/** The single error type every API call rejects with (see the interceptor in client.ts). */
export class ApiError extends Error {
  /** HTTP status, or `null` when no response arrived (offline, server down, timeout). */
  readonly status: number | null;
  readonly data: unknown;

  constructor(message: string, status: number | null, data?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }

  /** No response at all: device offline, server down / unreachable, or timed out. */
  get isNetworkError() {
    return this.status === null;
  }

  /** The server answered with 5xx. */
  get isServerError() {
    return this.status !== null && this.status >= 500;
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

/** Turns anything thrown by axios (or elsewhere) into an ApiError with a user-facing message. */
export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;

  if (isAxiosError(error)) {
    const status = error.response?.status ?? null;
    const data = error.response?.data;

    if (status === null) {
      const timedOut = error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT';
      return new ApiError(timedOut ? ERROR_MESSAGES.timeout : ERROR_MESSAGES.network, null);
    }

    // 5xx bodies are often HTML or stack traces: don't show them to the user.
    if (status >= 500) return new ApiError(ERROR_MESSAGES.server, status, data);

    return new ApiError(readServerMessage(data) ?? `Request failed (${status}).`, status, data);
  }

  return new ApiError(error instanceof Error ? error.message : ERROR_MESSAGES.unknown, null);
}

export function getErrorMessage(error: unknown): string {
  return toApiError(error).message;
}
