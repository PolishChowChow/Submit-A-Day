import { CircleAlert, CloudOff, ServerCrash } from 'lucide-react-native';
import { Button, H4, Paragraph, useTheme, YStack } from 'tamagui';

import { toApiError } from '@/lib/api/errors';

type ErrorStateProps = {
  error: unknown;
  /** Shows a "Try again" button. */
  onRetry?: () => void;
  /** Disables the button while a retry is in flight. */
  retrying?: boolean;
};

/**
 * Full-area error with a retry button. Distinguishes the cases a user can act on:
 * - server unreachable (offline, server down, timeout)
 * - server error (5xx)
 * - anything else (shows the server's message)
 */
export function ErrorState({ error, onRetry, retrying = false }: ErrorStateProps) {
  const theme = useTheme();
  const apiError = toApiError(error);

  const { Icon, title } = apiError.isNetworkError
    ? { Icon: CloudOff, title: "Can't reach the server" }
    : apiError.isServerError
      ? { Icon: ServerCrash, title: 'Server error' }
      : { Icon: CircleAlert, title: 'Something went wrong' };

  return (
    <YStack
      flex={1}
      alignItems="center"
      justifyContent="center"
      gap="3"
      padding="4"
      role="alert"
      testID="error-state"
    >
      <Icon size={40} color={theme.danger?.val} />
      <H4 textAlign="center">{title}</H4>
      <Paragraph textAlign="center" color="placeholder-color">
        {apiError.message}
      </Paragraph>
      {onRetry ? (
        <Button onPress={onRetry} disabled={retrying} opacity={retrying ? 0.6 : 1}>
          {retrying ? 'Retrying…' : 'Try again'}
        </Button>
      ) : null}
    </YStack>
  );
}
