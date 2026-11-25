import { useForm } from 'react-hook-form';
import { Button, Spinner, YStack } from 'tamagui';

import { FormError, TextField } from '@/components/form';

import { useSignUp } from '../queries';
import type { SignUpInput } from '../types';
import { authRules } from '../validation';

export function SignUpForm() {
  const signUp = useSignUp();
  const { control, handleSubmit } = useForm<SignUpInput>({
    defaultValues: { name: '', email: '', password: '' },
  });

  const onSubmit = () => void handleSubmit((values) => signUp.mutate(values))();

  return (
    <YStack gap="3">
      <TextField
        control={control}
        name="name"
        label="Name"
        rules={authRules.name}
        autoComplete="name"
        textContentType="name"
      />
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
        autoComplete="new-password"
        textContentType="newPassword"
        onSubmitEditing={onSubmit}
      />
      <FormError message={signUp.error?.message} />
      <Button
        onPress={onSubmit}
        disabled={signUp.isPending}
        icon={signUp.isPending ? <Spinner /> : undefined}
      >
        Create account
      </Button>
    </YStack>
  );
}
