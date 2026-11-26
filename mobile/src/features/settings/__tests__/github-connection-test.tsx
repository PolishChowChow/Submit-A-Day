import { fireEvent, screen } from '@testing-library/react-native';

import type { User } from '@/features/auth';
import { authApi } from '@/features/auth/api';
import { renderWithProviders } from '@/test-utils/render';

import { GitHubConnection } from '../components/github-connection';

jest.mock('@/constants/config', () => ({
  API_URL: 'http://api.test',
  GITHUB_CLIENT_ID: 'test-client-id',
}));

const mockPromptAsync = jest.fn();
jest.mock('expo-auth-session', () => ({
  makeRedirectUri: () => 'mobile://oauth/github',
  useAuthRequest: () => [
    { codeVerifier: 'v'.repeat(43), redirectUri: 'mobile://oauth/github', state: 's' },
    null,
    mockPromptAsync,
  ],
}));

jest.mock('@/features/auth/api', () => ({
  authApi: { me: jest.fn(), linkGitHub: jest.fn(), unlinkGitHub: jest.fn() },
}));

jest.mock('@/features/auth/auth-provider', () => ({
  useAuth: () => ({ status: 'signedIn', token: 'jwt', signIn: jest.fn(), signOut: jest.fn() }),
}));

const me = jest.mocked(authApi.me);
const linkGitHub = jest.mocked(authApi.linkGitHub);
const unlinkGitHub = jest.mocked(authApi.unlinkGitHub);

const user = (overrides: Partial<User> = {}): User => ({
  id: 'u1',
  email: 'me@example.com',
  name: 'Me',
  hasPassword: true,
  github: null,
  ...overrides,
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Settings → GitHub', () => {
  it('connects GitHub to a password account', async () => {
    me.mockResolvedValue(user());
    mockPromptAsync.mockResolvedValue({ type: 'success', params: { code: 'gh-code' } });
    linkGitHub.mockResolvedValue(user({ github: { login: 'octocat' } }));

    await renderWithProviders(<GitHubConnection />);
    expect(await screen.findByText('Not connected')).toBeOnTheScreen();

    await fireEvent.press(screen.getByText('Connect GitHub'));

    expect(await screen.findByText('Connected as @octocat')).toBeOnTheScreen();
    expect(linkGitHub.mock.calls[0]?.[0]).toMatchObject({ code: 'gh-code' });
  });

  it('disconnects GitHub from an account that has a password', async () => {
    me.mockResolvedValue(user({ github: { login: 'octocat' } }));
    unlinkGitHub.mockResolvedValue(user());

    await renderWithProviders(<GitHubConnection />);
    await fireEvent.press(await screen.findByText('Disconnect'));

    expect(await screen.findByText('Not connected')).toBeOnTheScreen();
    expect(unlinkGitHub).toHaveBeenCalledTimes(1);
  });

  it('offers no Disconnect for an account created with GitHub (no password)', async () => {
    me.mockResolvedValue(user({ hasPassword: false, github: { login: 'octocat' } }));

    await renderWithProviders(<GitHubConnection />);

    expect(await screen.findByText('Connected as @octocat')).toBeOnTheScreen();
    expect(screen.getByText('You sign in with GitHub, so it stays connected.')).toBeOnTheScreen();
    expect(screen.queryByText('Disconnect')).not.toBeOnTheScreen();
  });
});
