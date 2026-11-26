import { fireEvent, screen, waitFor } from '@testing-library/react-native';

import { ApiError } from '@/lib/api/errors';
import { renderWithProviders } from '@/test-utils/render';

import { authApi } from '../api';
import { GitHubSignInButton } from '../components/github-sign-in-button';

jest.mock('@/constants/config', () => ({
  API_URL: 'http://api.test',
  GITHUB_CLIENT_ID: 'test-client-id' as string | null,
}));
// The mocked module itself: imports read GITHUB_CLIENT_ID from it at render time.
const mockConfig = jest.requireMock<{ GITHUB_CLIENT_ID: string | null }>('@/constants/config');

const mockPromptAsync = jest.fn();
const mockRequest = {
  codeVerifier: 'v'.repeat(43),
  redirectUri: 'mobile://oauth/github',
  state: 'state-123',
};
jest.mock('expo-auth-session', () => ({
  makeRedirectUri: () => 'mobile://oauth/github',
  useAuthRequest: () => [mockRequest, null, mockPromptAsync],
}));

jest.mock('../api', () => ({
  authApi: { signInWithGitHub: jest.fn() },
}));

const mockSignIn = jest.fn();
jest.mock('../auth-provider', () => ({
  useAuth: () => ({ status: 'signedOut', token: null, signIn: mockSignIn, signOut: jest.fn() }),
}));

const signInWithGitHub = jest.mocked(authApi.signInWithGitHub);
const USER = {
  id: 'u1',
  email: 'octo@example.com',
  name: 'Octo',
  hasPassword: false,
  github: { login: 'octocat' },
};

beforeEach(() => {
  jest.clearAllMocks();
  mockConfig.GITHUB_CLIENT_ID = 'test-client-id';
});

async function pressGitHub() {
  await fireEvent.press(await screen.findByText('Continue with GitHub'));
}

describe('GitHubSignInButton', () => {
  it('is hidden when no GitHub client ID is configured', async () => {
    mockConfig.GITHUB_CLIENT_ID = null;
    await renderWithProviders(<GitHubSignInButton />);
    expect(screen.queryByText('Continue with GitHub')).not.toBeOnTheScreen();
  });

  it('sends the code, redirect URI and PKCE verifier to the server, then signs in', async () => {
    mockPromptAsync.mockResolvedValue({
      type: 'success',
      params: { code: 'gh-code', state: 'state-123' },
    });
    signInWithGitHub.mockResolvedValue({ token: 'jwt-token', user: USER });

    const { queryClient } = await renderWithProviders(<GitHubSignInButton />);
    await pressGitHub();

    await waitFor(() => expect(mockSignIn).toHaveBeenCalledWith('jwt-token'));
    expect(signInWithGitHub.mock.calls[0]?.[0]).toEqual({
      code: 'gh-code',
      redirectUri: 'mobile://oauth/github',
      codeVerifier: mockRequest.codeVerifier,
    });
    // The signed-in user is cached right away, like a password sign-in.
    expect(queryClient.getQueryData(['auth', 'me'])).toEqual(USER);
  });

  it('does nothing when the user closes the browser', async () => {
    mockPromptAsync.mockResolvedValue({ type: 'cancel' });
    await renderWithProviders(<GitHubSignInButton />);
    await pressGitHub();

    await waitFor(() => expect(mockPromptAsync).toHaveBeenCalled());
    expect(signInWithGitHub).not.toHaveBeenCalled();
    expect(screen.queryByText(/failed/)).not.toBeOnTheScreen();
  });

  it('treats "Cancel" on GitHub (access_denied) as backing out, not an error', async () => {
    mockPromptAsync.mockResolvedValue({
      type: 'error',
      params: { error: 'access_denied' },
      error: null,
    });
    await renderWithProviders(<GitHubSignInButton />);
    await pressGitHub();

    await waitFor(() => expect(mockPromptAsync).toHaveBeenCalled());
    expect(signInWithGitHub).not.toHaveBeenCalled();
    expect(screen.queryByText(/failed/)).not.toBeOnTheScreen();
  });

  it('shows an error and never calls the server when GitHub returns an error (e.g. state mismatch)', async () => {
    mockPromptAsync.mockResolvedValue({
      type: 'error',
      params: { error: 'state_mismatch' },
      error: null,
    });
    await renderWithProviders(<GitHubSignInButton />);
    await pressGitHub();

    expect(await screen.findByText('GitHub sign-in failed. Try again.')).toBeOnTheScreen();
    expect(signInWithGitHub).not.toHaveBeenCalled();
  });

  it("shows the server's message, e.g. when the email already has a password account", async () => {
    const message =
      'An account with this email already exists. Sign in with your password, then connect GitHub in Settings.';
    mockPromptAsync.mockResolvedValue({ type: 'success', params: { code: 'gh-code' } });
    signInWithGitHub.mockRejectedValue(new ApiError(message, 409));

    await renderWithProviders(<GitHubSignInButton />);
    await pressGitHub();

    expect(await screen.findByText(message)).toBeOnTheScreen();
    expect(mockSignIn).not.toHaveBeenCalled();
  });
});
