import { Paragraph } from 'tamagui';

/** Form-level error (e.g. "Invalid credentials" from the server). Renders nothing when empty. */
export function FormError({ message }: { message?: string | null }) {
  if (!message) return null;
  return (
    <Paragraph color="danger" textAlign="center">
      {message}
    </Paragraph>
  );
}
