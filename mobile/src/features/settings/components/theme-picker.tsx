import { Button, Label, XStack, YStack } from 'tamagui';

import { THEME_PREFERENCES, useAppTheme, type ThemePreference } from '@/theme';

const LABELS: Record<ThemePreference, string> = {
  system: 'System',
  light: 'Light',
  dark: 'Dark',
};

/** System / Light / Dark switch. 'System' (the default) follows the OS automatically. */
export function ThemePicker() {
  const { preference, setPreference } = useAppTheme();

  return (
    <YStack gap="2">
      <Label>Appearance</Label>
      <XStack gap="2">
        {THEME_PREFERENCES.map((option) => {
          const selected = option === preference;
          return (
            <Button
              key={option}
              flex={1}
              variant={selected ? undefined : 'outlined'}
              aria-selected={selected}
              onPress={() => setPreference(option)}
            >
              {LABELS[option]}
            </Button>
          );
        })}
      </XStack>
    </YStack>
  );
}
