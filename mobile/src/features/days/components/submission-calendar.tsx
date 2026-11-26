import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Button, Card, SizableText, useTheme, XStack, YStack } from 'tamagui';

import type { Day } from '../types';
import { parseIsoDate, toIsoDate } from '../utils';

type SubmissionCalendarProps = {
  days: readonly Day[];
  /** `YYYY-MM-DD`: highlighted, and the last month you can navigate to. */
  today: string;
  /** Tapping a submitted date. */
  onSelectDay?: (day: Day) => void;
  /** 0 = Sunday, 1 = Monday (default). */
  weekStartsOn?: 0 | 1;
};

type Cell = { iso: string; dayOfMonth: number } | null;

/**
 * Month grid that marks every date with a submission (filled accent circle).
 * Today has an accent ring; future dates are dimmed. Swipe-free on purpose: arrows only.
 */
export function SubmissionCalendar({
  days,
  today,
  onSelectDay,
  weekStartsOn = 1,
}: SubmissionCalendarProps) {
  const theme = useTheme();
  const todayDate = parseIsoDate(today);
  const [month, setMonth] = useState(() => ({
    year: todayDate.getFullYear(),
    month: todayDate.getMonth(),
  }));

  const byDate = useMemo(() => new Map(days.map((day) => [day.date.slice(0, 10), day])), [days]);
  const weeks = useMemo(
    () => buildMonth(month.year, month.month, weekStartsOn),
    [month, weekStartsOn]
  );
  const weekdayLabels = useMemo(() => getWeekdayLabels(weekStartsOn), [weekStartsOn]);

  const isCurrentMonth =
    month.year === todayDate.getFullYear() && month.month === todayDate.getMonth();
  const submittedThisMonth = weeks
    .flat()
    .filter((cell) => cell && byDate.has(cell.iso)).length;

  const shift = (delta: number) =>
    setMonth(({ year, month: m }) => {
      const next = new Date(year, m + delta, 1);
      return { year: next.getFullYear(), month: next.getMonth() };
    });

  const title = new Date(month.year, month.month, 1).toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric',
  });

  return (
    <Card backgroundColor="surface" padding="3" borderRadius="4" gap="2" testID="submission-calendar">
      <XStack alignItems="center" justifyContent="space-between">
        <Button
          size="sm"
          backgroundColor="transparent"
          borderWidth={0}
          circular
          icon={<ChevronLeft color={theme.color?.val} />}
          onPress={() => shift(-1)}
          aria-label="Previous month"
        />
        <YStack alignItems="center">
          <SizableText size="4" fontWeight="700" textTransform="capitalize">
            {title}
          </SizableText>
          <SizableText size="1" color="placeholder-color">
            {submittedThisMonth} {submittedThisMonth === 1 ? 'submission' : 'submissions'}
          </SizableText>
        </YStack>
        <Button
          size="sm"
          backgroundColor="transparent"
          borderWidth={0}
          circular
          icon={<ChevronRight color={theme.color?.val} />}
          onPress={() => shift(1)}
          disabled={isCurrentMonth}
          opacity={isCurrentMonth ? 0.3 : 1}
          aria-label="Next month"
        />
      </XStack>

      <XStack>
        {weekdayLabels.map((label, index) => (
          <SizableText key={index} flex={1} textAlign="center" size="1" color="placeholder-color">
            {label}
          </SizableText>
        ))}
      </XStack>

      {weeks.map((week, weekIndex) => (
        <XStack key={weekIndex}>
          {week.map((cell, index) => {
            if (!cell) return <YStack key={index} flex={1} />;
            const day = byDate.get(cell.iso);
            const isToday = cell.iso === today;
            const isFuture = cell.iso > today;
            return (
              <YStack key={cell.iso} flex={1} alignItems="center" paddingVertical="1">
                <YStack
                  width={36}
                  height={36}
                  borderRadius={18}
                  alignItems="center"
                  justifyContent="center"
                  backgroundColor={day ? 'primary' : 'transparent'}
                  borderWidth={isToday ? 2 : 0}
                  borderColor={day ? 'primary-color' : 'primary'}
                  opacity={isFuture ? 0.35 : 1}
                  onPress={day && onSelectDay ? () => onSelectDay(day) : undefined}
                  cursor={day && onSelectDay ? 'pointer' : undefined}
                  role={day ? 'button' : undefined}
                  aria-label={`${cell.iso}${day ? ', submitted' : ''}`}
                >
                  <SizableText
                    size="3"
                    fontWeight={day || isToday ? '700' : '400'}
                    color={day ? 'primary-color' : 'color'}
                  >
                    {cell.dayOfMonth}
                  </SizableText>
                </YStack>
              </YStack>
            );
          })}
        </XStack>
      ))}
    </Card>
  );
}

/** Weeks of the month as rows of 7; `null` pads the first and last week. */
function buildMonth(year: number, month: number, weekStartsOn: 0 | 1): Cell[][] {
  const first = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const leading = (first.getDay() - weekStartsOn + 7) % 7;

  const cells: Cell[] = Array.from({ length: leading }, () => null);
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ iso: toIsoDate(new Date(year, month, d)), dayOfMonth: d });
  }
  while (cells.length % 7 !== 0) cells.push(null);

  const weeks: Cell[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

/** Narrow localized weekday names in display order (`M T W T F S S`). */
function getWeekdayLabels(weekStartsOn: 0 | 1): string[] {
  // 2023-01-01 was a Sunday.
  return Array.from({ length: 7 }, (_, i) =>
    new Date(2023, 0, 1 + ((i + weekStartsOn) % 7)).toLocaleDateString(undefined, {
      weekday: 'narrow',
    })
  );
}
