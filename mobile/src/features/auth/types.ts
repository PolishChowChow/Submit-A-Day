export type User = {
  id: string;
  email: string;
  name: string;
  /** False for accounts created with GitHub: they can only sign in with GitHub. */
  hasPassword: boolean;
  /** The connected GitHub account, or null. */
  github: { login: string } | null;
};

export type SignInInput = {
  email: string;
  password: string;
};

export type SignUpInput = {
  name: string;
  email: string;
  password: string;
};

/** Response of the sign-in and sign-up endpoints. */
export type AuthResponse = {
  token: string;
  user: User;
};

/**
 * What GitHub hands back to the app, sent to the server to finish sign-in. The server exchanges
 * the code with its client secret; the app never sees a GitHub token.
 */
export type GitHubAuthInput = {
  code: string;
  /** The exact redirect URL used for the authorization request. */
  redirectUri: string;
  /** PKCE verifier for the challenge sent to GitHub. */
  codeVerifier: string;
};
