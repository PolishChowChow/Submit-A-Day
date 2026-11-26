import { Button, Paragraph, Separator, YStack } from 'tamagui';

import { Screen } from '@/components/ui';
import { useAuth, useCurrentUser } from '@/features/auth';

import { GitHubConnection } from '../components/github-connection';
import { ThemePicker } from '../components/theme-picker';

export function SettingsScreen() {
  const { signOut } = useAuth();
  const user = useCurrentUser();

  return (
    <Screen scroll>
      {user.data ? (
        <YStack>
          <Paragraph fontWeight="700">{user.data.name}</Paragraph>
          <Paragraph color="placeholder-color">{user.data.email}</Paragraph>
        </YStack>
      ) : null}
      <ThemePicker />
      <GitHubConnection />
      <Separator />
      <Button variant="outlined" onPress={() => signOut()}>
        Sign out
      </Button>
    </Screen>
  );
}
