import { Link } from 'expo-router';
import { Plus } from 'lucide-react-native';
import { FlatList } from 'react-native';
import { Button, Paragraph, YStack } from 'tamagui';

import { QueryState, Screen } from '@/components/ui';

import { DayListItem } from '../components/day-list-item';
import { useDays, useTodaySubmission } from '../queries';

/** Days tab: every day submission, newest first, plus a shortcut to submit today. */
export function DaysScreen() {
  const days = useDays();
  const today = useTodaySubmission();

  return (
    <Screen>
      {today.isSuccess && !today.data ? (
        <Link href="/days/new" asChild>
          <Button icon={Plus}>Submit today</Button>
        </Link>
      ) : null}
      {today.data ? (
        <Paragraph textAlign="center" color="placeholder-color">
          Today is submitted. See you tomorrow!
        </Paragraph>
      ) : null}

      <QueryState
        query={days}
        isEmpty={(list) => list.length === 0}
        emptyMessage="No submissions yet. Submit your first day above."
      >
        {(list) => (
          <FlatList
            data={list}
            keyExtractor={(day) => day.id}
            renderItem={({ item }) => <DayListItem day={item} />}
            ItemSeparatorComponent={() => <YStack height="2" />}
            refreshing={days.isRefetching}
            onRefresh={() => days.refetch()}
          />
        )}
      </QueryState>
    </Screen>
  );
}
