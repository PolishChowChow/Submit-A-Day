import { Controller, useForm } from 'react-hook-form';
import { Button, Label, Paragraph, Spinner, YStack } from 'tamagui';

import { FormError, TextField } from '@/components/form';
import type { Task } from '@/features/tasks';

import { useCreateDay } from '../queries';
import { todayIsoDate } from '../utils';
import { TaskRow } from './task-row';

type FormValues = {
  completedTaskIds: string[];
  note: string;
};

type SubmitDayFormProps = {
  tasks: Task[];
  onSubmitted?: () => void;
};

/** Today's submission: tick the recurring tasks you completed, add an optional note. */
export function SubmitDayForm({ tasks, onSubmitted }: SubmitDayFormProps) {
  const createDay = useCreateDay();
  const { control, handleSubmit } = useForm<FormValues>({
    defaultValues: { completedTaskIds: [], note: '' },
  });

  const onSubmit = () =>
    void handleSubmit(({ completedTaskIds, note }) =>
      createDay.mutate(
        { date: todayIsoDate(), completedTaskIds, note: note.trim() || undefined },
        { onSuccess: () => onSubmitted?.() }
      )
    )();

  return (
    <YStack gap="4">
      <Controller
        control={control}
        name="completedTaskIds"
        render={({ field: { value, onChange } }) => (
          <YStack>
            <Label>
              Completed today ({value.length} / {tasks.length})
            </Label>
            {tasks.length === 0 ? (
              <Paragraph color="placeholder-color">You have no recurring tasks yet.</Paragraph>
            ) : (
              tasks.map((task) => {
                const checked = value.includes(task.id);
                return (
                  <TaskRow
                    key={task.id}
                    title={task.title}
                    completed={checked}
                    onToggle={() =>
                      onChange(checked ? value.filter((id) => id !== task.id) : [...value, task.id])
                    }
                  />
                );
              })
            )}
          </YStack>
        )}
      />
      <TextField
        control={control}
        name="note"
        label="Note (optional)"
        placeholder="Anything worth remembering about today…"
        multiline
        minHeight={80}
      />
      <FormError message={createDay.error?.message} />
      <Button
        onPress={onSubmit}
        disabled={createDay.isPending}
        icon={createDay.isPending ? <Spinner /> : undefined}
      >
        Submit today
      </Button>
    </YStack>
  );
}
