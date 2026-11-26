import { Circle, CircleCheck } from 'lucide-react-native';
import { Paragraph, useTheme, XStack } from 'tamagui';

type TaskRowProps = {
  title: string;
  completed: boolean;
  /** Makes the row a toggle (used in the submit form). Omit for read-only rows. */
  onToggle?: () => void;
};

/** One recurring task with a done / not-done indicator. */
export function TaskRow({ title, completed, onToggle }: TaskRowProps) {
  const theme = useTheme();
  const color = completed ? theme.color?.val : theme['placeholder-color']?.val;
  const Icon = completed ? CircleCheck : Circle;

  return (
    <XStack
      alignItems="center"
      gap="3"
      paddingVertical="2"
      onPress={onToggle}
      role={onToggle ? 'checkbox' : undefined}
      aria-checked={onToggle ? completed : undefined}
      cursor={onToggle ? 'pointer' : undefined}
    >
      <Icon size={22} color={color} />
      <Paragraph
        flex={1}
        color={completed ? 'color' : 'placeholder-color'}
        textDecorationLine={!onToggle && !completed ? 'line-through' : 'none'}
      >
        {title}
      </Paragraph>
    </XStack>
  );
}
