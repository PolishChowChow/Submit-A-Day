import { Flame } from 'lucide-react-native';
import { Card, Paragraph, SizableText, useTheme, XStack, YStack } from 'tamagui';

import type { Streak } from '../utils';

/** "🔥 7-day streak": shown above the checklist on the Today screen. */
export function StreakCard({ streak }: { streak: Streak }) {
  const theme = useTheme();
  const { current, longest, submittedToday } = streak;
  const active = current > 0;

  const hint = !active
    ? 'Submit today to start a streak.'
    : submittedToday
      ? 'Done for today. See you tomorrow!'
      : 'Submit today to keep it going.';

  return (
    <Card
      backgroundColor="surface"
      padding="4"
      borderRadius="4"
      aria-label={`${current}-day streak. ${hint}`}
      testID="streak-card"
    >
      <XStack alignItems="center" gap="3">
        <Flame
          size={32}
          color={active ? theme.streak?.val : theme['placeholder-color']?.val}
          fill={active ? theme.streak?.val : 'transparent'}
        />
        <YStack flex={1}>
          <SizableText size="5" fontWeight="800">
            {current}-day streak
          </SizableText>
          <Paragraph size="2" color="placeholder-color">
            {hint}
          </Paragraph>
        </YStack>
        {longest > 0 ? (
          <YStack alignItems="flex-end">
            <SizableText size="1" color="placeholder-color">
              Best
            </SizableText>
            <SizableText size="4" fontWeight="700">
              {longest}
            </SizableText>
          </YStack>
        ) : null}
      </XStack>
    </Card>
  );
}
