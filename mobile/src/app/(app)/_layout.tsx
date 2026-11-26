import { Stack } from 'expo-router';

/** Routes behind login (guarded in src/app/_layout.tsx). Tabs plus pushed detail screens. */
export const unstable_settings = {
  anchor: '(tabs)',
};

export default function AppLayout() {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="days/[id]" options={{ title: 'Day', headerBackTitle: 'Back' }} />
    </Stack>
  );
}
