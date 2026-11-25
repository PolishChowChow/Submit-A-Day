import { router } from 'expo-router';
import { H3, Paragraph } from 'tamagui';

import { QueryState, Screen } from '@/components/ui';
import { useTasks } from '@/features/tasks';

import { SubmitDayForm } from '../components/submit-day-form';
import { formatDayDate, todayIsoDate } from '../utils';

/** /days/new: tick off today's recurring tasks and submit. */
export function NewDayScreen() {
  const tasks = useTasks();

  return (
    <Screen scroll>
      <H3>{formatDayDate(todayIsoDate())}</H3>
      <Paragraph color="placeholder-color">Which of your daily tasks did you complete?</Paragraph>
      <QueryState query={tasks}>
        {(list) => <SubmitDayForm tasks={list} onSubmitted={() => router.back()} />}
      </QueryState>
    </Screen>
  );
}
