import { Stack } from 'expo-router';

/** Public routes, reachable only while signed out (guarded in src/app/_layout.tsx). */
export const unstable_settings = {
  anchor: 'sign-in',
};

export default function AuthLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
