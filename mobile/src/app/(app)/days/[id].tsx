import { useLocalSearchParams } from 'expo-router';

import { DayDetailScreen } from '@/features/days';

export default function DayDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <DayDetailScreen id={id} />;
}
