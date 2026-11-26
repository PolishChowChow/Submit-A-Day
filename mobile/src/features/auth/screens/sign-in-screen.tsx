import { Link } from 'expo-router';
import { H2, Paragraph, XStack } from 'tamagui';

import { Screen } from '@/components/ui';

import { DevSkipSignIn } from '../components/dev-skip-sign-in';
import { GitHubSignInButton } from '../components/github-sign-in-button';
import { SignInForm } from '../components/sign-in-form';

export function SignInScreen() {
  return (
    <Screen scroll safeTop centered>
      <H2>Welcome back</H2>
      <Paragraph color="placeholder-color">Sign in to keep your streak going.</Paragraph>
      <SignInForm />
      <GitHubSignInButton />
      <XStack justifyContent="center" gap="2">
        <Paragraph>No account?</Paragraph>
        <Link href="/sign-up" replace>
          <Paragraph fontWeight="700">Sign up</Paragraph>
        </Link>
      </XStack>
      {/* TEMP: remove with src/dev/ */}
      <DevSkipSignIn />
    </Screen>
  );
}
