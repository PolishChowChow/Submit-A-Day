function requireEnv(name: string, value: string | undefined): string {
  if (!value) throw new Error(`${name} is missing. Copy .env.template to .env and set it.`);
  return value;
}

/** Server origin without the `/api` prefix, e.g. `http://localhost:3000`. */
// Must be read as `process.env.EXPO_PUBLIC_…` literally so Expo can inline it.
export const API_URL = requireEnv('EXPO_PUBLIC_API_URL', process.env.EXPO_PUBLIC_API_URL);

/**
 * Client ID of the GitHub OAuth App / GitHub App used for "Continue with GitHub". Public (it's in
 * every authorization URL); the matching secret lives on the server only. Unset = GitHub buttons
 * are hidden.
 */
export const GITHUB_CLIENT_ID = process.env.EXPO_PUBLIC_GITHUB_CLIENT_ID || null;
