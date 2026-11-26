import { Link } from 'expo-router';
import { H2, Paragraph, XStack } from 'tamagui';

import { Screen } from '@/components/ui';

import { GitHubSignInButton } from '../components/github-sign-in-button';
import { SignUpForm } from '../components/sign-up-form';

export function SignUpScreen() {
  return (
    <Screen scroll safeTop centered>
      <H2>Create your account</H2>
      <Paragraph color="placeholder-color">One entry a day. That&apos;s it.</Paragraph>
      <SignUpForm />
      <GitHubSignInButton />
      <XStack justifyContent="center" gap="2">
        <Paragraph>Already have an account?</Paragraph>
        <Link href="/sign-in" replace>
          <Paragraph fontWeight="700">Sign in</Paragraph>
        </Link>
      </XStack>
    </Screen>
  );
}
