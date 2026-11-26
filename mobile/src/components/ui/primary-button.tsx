import { Button, Spinner, type ButtonProps } from 'tamagui';

type PrimaryButtonProps = ButtonProps & {
  /** Shows a spinner and disables the button. */
  loading?: boolean;
};

/**
 * The screen's main action, in the accent color (the "10%" of the 60/30/10 palette).
 * Use at most one per screen; everything else uses the default `Button`.
 */
export function PrimaryButton({ loading = false, disabled, children, ...props }: PrimaryButtonProps) {
  const isDisabled = disabled || loading;
  return (
    <Button
      size="lg"
      backgroundColor="primary"
      color="primary-color"
      borderWidth={0}
      fontWeight="700"
      disabled={isDisabled}
      opacity={isDisabled ? 0.6 : 1}
      icon={loading ? <Spinner color="primary-color" /> : undefined}
      aria-busy={loading}
      {...props}
    >
      {children}
    </Button>
  );
}
