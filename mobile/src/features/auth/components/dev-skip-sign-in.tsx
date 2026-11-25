import { Button, Paragraph, YStack } from 'tamagui';

import { MOCK_TOKEN, USE_MOCKS } from '@/dev';

import { useAuth } from '../auth-provider';

/**
 * TEMP: jump straight into the signed-in tabs while the backend doesn't exist.
 * Renders nothing unless EXPO_PUBLIC_USE_MOCKS=true. Delete with src/dev/.
 */
export function DevSkipSignIn() {
  const { signIn } = useAuth();
  if (!USE_MOCKS) return null;

  return (
    <YStack gap="2" paddingTop="4">
      <Button variant="outlined" onPress={() => signIn(MOCK_TOKEN)}>
        Skip sign-in (mock mode)
      </Button>
      <Paragraph size="2" textAlign="center" color="placeholder-color">
        Mock mode: any email and password works, and the data is fake.
      </Paragraph>
    </YStack>
  );
}
