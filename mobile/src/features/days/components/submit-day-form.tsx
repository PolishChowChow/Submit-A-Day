import { useState } from 'react';
import { Card, Paragraph, Separator, YStack } from 'tamagui';

import { FormError } from '@/components/form';
import { PrimaryButton, ProgressBar } from '@/components/ui';
import type { Task } from '@/features/tasks';

import { useCreateDay } from '../queries';
import { TaskRow } from './task-row';

type SubmitDayFormProps = {
  /** `YYYY-MM-DD` being submitted. */
  date: string;
  tasks: Task[];
};

/** The day's checklist: tick what you completed, then "Submit a Day" sends it to the backend. */
export function SubmitDayForm({ date, tasks }: SubmitDayFormProps) {
  const createDay = useCreateDay();
  const [checked, setChecked] = useState<ReadonlySet<string>>(() => new Set());

  const toggle = (id: string) =>
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  // Checks stay as they are on failure, so pressing the button again simply retries.
  const submit = () => createDay.mutate({ date, completedTaskIds: [...checked] });

  // 409 (already submitted) isn't shown: the Today screen switches to "Already done" instead.
  const errorMessage = createDay.error?.status === 409 ? undefined : createDay.error?.message;

  return (
    <YStack gap="4">
      {tasks.length === 0 ? (
        <Paragraph color="placeholder-color">You have no recurring tasks yet.</Paragraph>
      ) : (
        <>
          <ProgressBar
            value={checked.size / tasks.length}
            label={`${checked.size} of ${tasks.length} tasks done`}
          />
          <Card backgroundColor="surface" paddingHorizontal="4" borderRadius="4">
            {tasks.map((task, index) => (
              <YStack key={task.id}>
                {index > 0 ? <Separator borderColor="border-color" /> : null}
                <TaskRow
                  title={task.title}
                  completed={checked.has(task.id)}
                  onToggle={createDay.isPending ? undefined : () => toggle(task.id)}
                />
              </YStack>
            ))}
          </Card>
        </>
      )}

      <FormError message={errorMessage} />

      <PrimaryButton onPress={submit} loading={createDay.isPending}>
        {createDay.isError && errorMessage ? 'Try again' : 'Submit a Day'}
      </PrimaryButton>
    </YStack>
  );
}
