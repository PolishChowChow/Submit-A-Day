import { Button, Label, Paragraph, Spinner, XStack, YStack } from 'tamagui';

import { FormError } from '@/components/form';
import {
  useCurrentUser,
  useGitHubFlow,
  useLinkGitHub,
  useUnlinkGitHub,
  type User,
} from '@/features/auth';

/**
 * Settings → GitHub: connect it to a password account, or disconnect it. An account created with
 * GitHub has no password, so the server refuses to disconnect it and the button isn't offered.
 */
export function GitHubConnection() {
  const user = useCurrentUser();
  const link = useGitHubFlow(useLinkGitHub());
  const unlink = useUnlinkGitHub();

  if (!user.data) return null;
  // Not connected and GitHub sign-in not configured: nothing to show.
  if (!user.data.github && !link.enabled) return null;

  return (
    <YStack gap="2">
      <Label>GitHub</Label>
      {user.data.github ? (
        <Connected
          user={user.data}
          login={user.data.github.login}
          onDisconnect={() => unlink.mutate()}
          disconnecting={unlink.isPending}
        />
      ) : (
        <XStack alignItems="center" justifyContent="space-between" gap="3">
          <Paragraph color="placeholder-color" flex={1}>
            Not connected
          </Paragraph>
          <Button
            variant="outlined"
            onPress={link.start}
            disabled={link.disabled}
            icon={link.busy ? <Spinner /> : undefined}
          >
            Connect GitHub
          </Button>
        </XStack>
      )}
      <FormError message={link.error ?? unlink.error?.message} />
    </YStack>
  );
}

function Connected({
  user,
  login,
  onDisconnect,
  disconnecting,
}: {
  user: User;
  login: string;
  onDisconnect: () => void;
  disconnecting: boolean;
}) {
  return (
    <YStack gap="2">
      <XStack alignItems="center" justifyContent="space-between" gap="3">
        <Paragraph flex={1}>Connected as @{login}</Paragraph>
        {user.hasPassword ? (
          <Button
            variant="outlined"
            onPress={onDisconnect}
            disabled={disconnecting}
            icon={disconnecting ? <Spinner /> : undefined}
          >
            Disconnect
          </Button>
        ) : null}
      </XStack>
      {user.hasPassword ? null : (
        <Paragraph size="2" color="placeholder-color">
          You sign in with GitHub, so it stays connected.
        </Paragraph>
      )}
    </YStack>
  );
}
