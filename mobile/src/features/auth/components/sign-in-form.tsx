import { useForm } from 'react-hook-form';
import { Button, Spinner, YStack } from 'tamagui';

import { FormError, TextField } from '@/components/form';

import { useSignIn } from '../queries';
import type { SignInInput } from '../types';
import { authRules } from '../validation';

export function SignInForm() {
  const signIn = useSignIn();
  const { control, handleSubmit } = useForm<SignInInput>({
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = () => void handleSubmit((values) => signIn.mutate(values))();

  return (
    <YStack gap="3">
      <TextField
        control={control}
        name="email"
        label="Email"
        rules={authRules.email}
        placeholder="you@example.com"
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
        textContentType="emailAddress"
      />
      <TextField
        control={control}
        name="password"
        label="Password"
        rules={authRules.password}
        secureTextEntry
        autoComplete="current-password"
        textContentType="password"
        onSubmitEditing={onSubmit}
      />
      <FormError message={signIn.error?.message} />
      <Button
        onPress={onSubmit}
        disabled={signIn.isPending}
        icon={signIn.isPending ? <Spinner /> : undefined}
      >
        Sign in
      </Button>
    </YStack>
  );
}
