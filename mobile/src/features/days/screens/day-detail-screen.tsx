import { Stack } from 'expo-router';
import { H3, Paragraph, Separator, YStack } from 'tamagui';

import { ProgressBar, QueryState, Screen } from '@/components/ui';

import { TaskRow } from '../components/task-row';
import { useDay } from '../queries';
import { formatDayDate, getDayProgress } from '../utils';

/** /days/:id: one submission with every recurring task and whether it was completed. */
export function DayDetailScreen({ id }: { id: string }) {
  const day = useDay(id);

  return (
    <Screen scroll>
      <QueryState query={day}>
        {(data) => {
          const { completed, total, ratio } = getDayProgress(data);
          return (
            <>
              <Stack.Screen options={{ title: formatDayDate(data.date) }} />
              <YStack gap="2">
                <H3>
                  {completed} / {total} tasks completed
                </H3>
                <ProgressBar value={ratio} label={`${completed} of ${total} tasks done`} />
              </YStack>
              <YStack>
                {data.tasks.map((task) => (
                  <TaskRow key={task.taskId} title={task.title} completed={task.completed} />
                ))}
              </YStack>
              {data.note ? (
                <>
                  <Separator />
                  <Paragraph>{data.note}</Paragraph>
                </>
              ) : null}
            </>
          );
        }}
      </QueryState>
    </Screen>
  );
}
