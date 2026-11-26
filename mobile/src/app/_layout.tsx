import { SplashScreen, Stack } from 'expo-router';
import { useEffect } from 'react';

import { useAuth } from '@/features/auth';
import { AppProviders } from '@/providers/app-providers';
import { useAppTheme } from '@/theme';

// Keep the splash screen up until the session and theme preference are restored.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  return (
    <AppProviders>
      <RootNavigator />
    </AppProviders>
  );
}

/**
 * Chooses the route group from the auth state:
 * - signed out → (auth)  sign-in, sign-up
 * - signed in  → (app)   tabs and everything behind login
 * When the state changes, Expo Router moves to the allowed group automatically.
 *
 * `redirectTo` is REQUIRED here. Without it a blocked route falls back to the first
 * allowed sibling by its file path, i.e. the group itself (`/(auth)`, `/(app)`), and a
 * group has no screen of its own, so that renders a 404. Always point at a real URL.
 */
function RootNavigator() {
  const { status } = useAuth();
  const theme = useAppTheme();
  const isReady = status !== 'loading' && theme.isReady;

  useEffect(() => {
    if (isReady) SplashScreen.hideAsync();
  }, [isReady]);

  if (!isReady) return null;

  const isSignedIn = status === 'signedIn';

  return (
    <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
      <Stack.Protected guard={isSignedIn} redirectTo="/sign-in">
        <Stack.Screen name="(app)" />
      </Stack.Protected>

      <Stack.Protected guard={!isSignedIn} redirectTo="/">
        <Stack.Screen name="(auth)" />
      </Stack.Protected>

      {/* GitHub's OAuth redirect: reachable signed in (connect) and signed out (sign in). */}
      <Stack.Screen name="oauth/github" />

      <Stack.Screen name="+not-found" options={{ headerShown: true, title: 'Not found' }} />
    </Stack>
  );
}
