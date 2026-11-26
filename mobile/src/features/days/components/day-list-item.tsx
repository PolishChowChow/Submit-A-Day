import { Link } from 'expo-router';
import { Card, Paragraph, SizableText, XStack } from 'tamagui';

import type { Day } from '../types';
import { formatDayDate, getDayProgress } from '../utils';

/** One submission in the Days list: date, "3 / 5 tasks", and which tasks were done. */
export function DayListItem({ day }: { day: Day }) {
  const { completed, total } = getDayProgress(day);
  const done = day.tasks.filter((task) => task.completed).map((task) => task.title);

  return (
    <Link href={{ pathname: '/days/[id]', params: { id: day.id } }} asChild>
      <Card padding="3" gap="1">
        <XStack justifyContent="space-between" alignItems="center">
          <SizableText size="3" fontWeight="700">
            {formatDayDate(day.date)}
          </SizableText>
          <SizableText size="3" color={completed === total ? 'color' : 'placeholder-color'}>
            {completed} / {total} tasks
          </SizableText>
        </XStack>
        <Paragraph numberOfLines={2} color="placeholder-color">
          {done.length > 0 ? done.join(' · ') : 'No tasks completed'}
        </Paragraph>
      </Card>
    </Link>
  );
}
