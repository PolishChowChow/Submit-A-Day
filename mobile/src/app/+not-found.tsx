import { Link } from 'expo-router';
import { H3, Paragraph } from 'tamagui';

import { Screen } from '@/components/ui';

export default function NotFoundRoute() {
  return (
    <Screen centered>
      <H3 textAlign="center">This page doesn&apos;t exist.</H3>
      <Link href="/" replace>
        <Paragraph textAlign="center" fontWeight="700">
          Go home
        </Paragraph>
      </Link>
    </Screen>
  );
}
