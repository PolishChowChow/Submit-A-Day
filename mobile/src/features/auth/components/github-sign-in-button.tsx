import { Button, Spinner, YStack } from 'tamagui';

import { FormError } from '@/components/form';

import { useGitHubFlow } from '../github';
import { useGitHubSignIn } from '../queries';

/**
 * "Continue with GitHub" on the sign-in and sign-up screens: signs in, or creates the account on
 * first use. Renders nothing unless EXPO_PUBLIC_GITHUB_CLIENT_ID is set.
 */
export function GitHubSignInButton() {
  const github = useGitHubFlow(useGitHubSignIn());
  if (!github.enabled) return null;

  return (
    <YStack gap="2">
      <Button
        variant="outlined"
        onPress={github.start}
        disabled={github.disabled}
        icon={github.busy ? <Spinner /> : undefined}
      >
        Continue with GitHub
      </Button>
      <FormError message={github.error} />
    </YStack>
  );
}
