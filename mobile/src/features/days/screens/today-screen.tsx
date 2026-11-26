import { Link } from 'expo-router';
import { PartyPopper } from 'lucide-react-native';
import { Button, Card, H2, H4, Paragraph, Separator, Spinner, useTheme, YStack } from 'tamagui';

import { ErrorState, ProgressBar, Screen } from '@/components/ui';
import { useTasks } from '@/features/tasks';

import { StreakCard } from '../components/streak-card';
import { SubmitDayForm } from '../components/submit-day-form';
import { TaskRow } from '../components/task-row';
import { useToday } from '../hooks/use-today';
import { useDaySubmission, useStreak } from '../queries';
import type { Day } from '../types';
import { formatDayDate, getDayProgress } from '../utils';

/**
 * `/`: the main screen after sign-in.
 * Streak on top, then today's checklist:
 * - Not submitted yet: tick tasks, press "Submit a Day".
 * - Already submitted (a record with the same year, month and day): "Already done".
 * - Server unreachable / failing: an error with "Try again".
 */
export function TodayScreen() {
  const today = useToday();
  const submission = useDaySubmission(today);
  const streak = useStreak(today);
  const tasks = useTasks();

  const isPending = submission.isPending || tasks.isPending;
  const error = submission.error ?? tasks.error;

  const retry = () => {
    if (submission.isError) void submission.refetch();
    if (tasks.isError) void tasks.refetch();
  };

  return (
    <Screen scroll>
      <H2>{formatDayDate(today)}</H2>

      {isPending ? (
        <Spinner size="large" marginTop="6" />
      ) : error ? (
        <ErrorState
          error={error}
          onRetry={retry}
          retrying={submission.isFetching || tasks.isFetching}
        />
      ) : (
        <>
          {streak.data ? <StreakCard streak={streak.data} /> : null}
          {submission.data ? (
            <AlreadyDone day={submission.data} />
          ) : (
            // key: a fresh, empty checklist when the date rolls over.
            <SubmitDayForm key={today} date={today} tasks={tasks.data ?? []} />
          )}
        </>
      )}
    </Screen>
  );
}

function AlreadyDone({ day }: { day: Day }) {
  const theme = useTheme();
  const { completed, total, ratio } = getDayProgress(day);

  return (
    <YStack gap="4">
      <Card
        padding="4"
        gap="2"
        alignItems="center"
        borderRadius="4"
        borderWidth={1}
        borderColor="border-color"
        backgroundColor="background"
      >
        <PartyPopper size={36} color={theme.primary?.val} />
        <H4>Already done</H4>
        <Paragraph color="placeholder-color" textAlign="center">
          You submitted today with {completed} / {total} tasks. Come back tomorrow!
        </Paragraph>
      </Card>

      <ProgressBar value={ratio} label={`${completed} of ${total} tasks done`} />

      <Card backgroundColor="surface" paddingHorizontal="4" borderRadius="4">
        {day.tasks.map((task, index) => (
          <YStack key={task.taskId}>
            {index > 0 ? <Separator borderColor="border-color" /> : null}
            <TaskRow title={task.title} completed={task.completed} />
          </YStack>
        ))}
      </Card>

      <Link href={{ pathname: '/days/[id]', params: { id: day.id } }} asChild>
        <Button variant="outlined" borderColor="primary" color="primary">
          View details
        </Button>
      </Link>
    </YStack>
  );
}
