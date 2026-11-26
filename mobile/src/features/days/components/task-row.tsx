import { Circle, CircleCheck, Square, SquareCheckBig } from 'lucide-react-native';
import { useState } from 'react';
import Animated, { css, useReducedMotion } from 'react-native-reanimated';
import { Paragraph, useTheme, XStack } from 'tamagui';

type TaskRowProps = {
  title: string;
  completed: boolean;
  /** Makes the row a checkbox (Today screen). Omit for read-only rows. */
  onToggle?: () => void;
};

/** Checkbox "pop" played when the box is toggled. */
const pop = css.keyframes({
  from: { transform: [{ scale: 0.6 }] },
  '60%': { transform: [{ scale: 1.15 }] },
  to: { transform: [{ scale: 1 }] },
});

/**
 * One recurring task. A done task is struck through (it's crossed off the list).
 * With `onToggle` it's a checkbox; without, a read-only done / not-done line.
 * Toggling pops the box and fades the title; nothing animates on first render or
 * with the system "reduce motion" setting on.
 */
export function TaskRow({ title, completed, onToggle }: TaskRowProps) {
  const theme = useTheme();
  const reduceMotion = useReducedMotion();
  // Only animate after the user toggled this row, not when the list first appears.
  const [toggled, setToggled] = useState(false);
  const animate = toggled && !reduceMotion;

  const Icon = onToggle ? (completed ? SquareCheckBig : Square) : completed ? CircleCheck : Circle;
  const iconColor = completed ? theme.primary?.val : theme['placeholder-color']?.val;

  const handlePress = onToggle
    ? () => {
        setToggled(true);
        onToggle();
      }
    : undefined;

  return (
    <XStack
      alignItems="center"
      gap="3"
      paddingVertical="3"
      onPress={handlePress}
      // One focusable element for screen readers: "Drink water, checkbox, checked".
      accessible={!!onToggle}
      role={onToggle ? 'checkbox' : undefined}
      aria-checked={onToggle ? completed : undefined}
      aria-label={title}
      cursor={onToggle ? 'pointer' : undefined}
    >
      {/* key: remount on change so the pop keyframes replay on every toggle. */}
      <Animated.View
        key={String(completed)}
        style={
          animate
            ? { animationName: pop, animationDuration: 250, animationTimingFunction: 'ease-out' }
            : undefined
        }
      >
        <Icon size={24} color={iconColor} />
      </Animated.View>
      <Animated.View
        style={{
          flex: 1,
          opacity: completed ? 0.55 : 1,
          transitionProperty: 'opacity',
          transitionDuration: animate ? 200 : 0,
        }}
      >
        <Paragraph color="color" textDecorationLine={completed ? 'line-through' : 'none'}>
          {title}
        </Paragraph>
      </Animated.View>
    </XStack>
  );
}
