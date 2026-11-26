// Public API of the auth feature. Import from '@/features/auth', not from its internal files.
export { AuthProvider, useAuth, type AuthStatus } from './auth-provider';
export { GITHUB_REDIRECT_PATH, githubRedirectUri, useGitHubFlow } from './github';
export {
  authKeys,
  authQueries,
  useCurrentUser,
  useGitHubSignIn,
  useLinkGitHub,
  useSignIn,
  useSignUp,
  useUnlinkGitHub,
} from './queries';
export { SignInScreen } from './screens/sign-in-screen';
export { SignUpScreen } from './screens/sign-up-screen';
export type { AuthResponse, GitHubAuthInput, SignInInput, SignUpInput, User } from './types';
