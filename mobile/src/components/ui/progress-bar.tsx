import Animated, { useReducedMotion } from 'react-native-reanimated';
import { useTheme, YStack } from 'tamagui';

type ProgressBarProps = {
  /** 0–1. Values outside the range are clamped. */
  value: number;
  /** Accessible label, e.g. "2 of 5 tasks done". */
  label?: string;
};

/**
 * Green progress bar (theme keys `success` on `success-muted`).
 * The fill glides to its new width (Reanimated CSS transition); instant with "reduce motion" on.
 */
export function ProgressBar({ value, label }: ProgressBarProps) {
  const theme = useTheme();
  const reduceMotion = useReducedMotion();
  const ratio = Math.min(1, Math.max(0, value));
  const percent = Math.round(ratio * 100);

  return (
    <YStack
      height={10}
      borderRadius={999}
      overflow="hidden"
      backgroundColor="success-muted"
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={percent}
      testID="progress-bar"
    >
      <Animated.View
        style={{
          height: '100%',
          width: `${percent}%`,
          borderRadius: 999,
          backgroundColor: theme.success?.val,
          transitionProperty: 'width',
          transitionDuration: reduceMotion ? 0 : 300,
          transitionTimingFunction: 'ease-out',
        }}
      />
    </YStack>
  );
}
