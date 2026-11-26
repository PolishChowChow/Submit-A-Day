import { Stack } from 'expo-router';
import { H3, Paragraph, Progress, Separator, YStack } from 'tamagui';

import { QueryState, Screen } from '@/components/ui';

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
                <Progress value={Math.round(ratio * 100)} />
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
