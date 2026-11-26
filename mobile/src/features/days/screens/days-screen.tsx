import { router } from 'expo-router';
import { FlatList } from 'react-native';
import { SizableText, YStack } from 'tamagui';

import { QueryState, Screen } from '@/components/ui';

import { DayListItem } from '../components/day-list-item';
import { SubmissionCalendar } from '../components/submission-calendar';
import { useToday } from '../hooks/use-today';
import { useDays } from '../queries';

/** `/days`, the History tab: a calendar of submissions, then every submission, newest first. */
export function DaysScreen() {
  const days = useDays();
  const today = useToday();

  return (
    <Screen>
      <QueryState query={days}>
        {(list) => (
          <FlatList
            data={list}
            keyExtractor={(day) => day.id}
            renderItem={({ item }) => <DayListItem day={item} />}
            ItemSeparatorComponent={() => <YStack height="2" />}
            ListHeaderComponent={
              <YStack gap="4" paddingBottom="3">
                <SubmissionCalendar
                  days={list}
                  today={today}
                  onSelectDay={(day) =>
                    router.push({ pathname: '/days/[id]', params: { id: day.id } })
                  }
                />
                {list.length > 0 ? (
                  <SizableText size="4" fontWeight="700">
                    All submissions
                  </SizableText>
                ) : null}
              </YStack>
            }
            ListEmptyComponent={
              <SizableText textAlign="center" color="placeholder-color" paddingTop="4">
                No submissions yet. Submit your first day on the Today tab.
              </SizableText>
            }
            refreshing={days.isRefetching}
            onRefresh={() => days.refetch()}
            showsVerticalScrollIndicator={false}
          />
        )}
      </QueryState>
    </Screen>
  );
}
