import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { daysApi } from './api';
import { getStreak, isSameDay } from './utils';

/**
 * Reference implementation of the query pattern (see src/lib/query/index.ts).
 *
 * 1. Key factory: hierarchical, so `dayKeys.all` invalidates lists and details together.
 */
export const dayKeys = {
  all: ['days'] as const,
  lists: () => [...dayKeys.all, 'list'] as const,
  detail: (id: string) => [...dayKeys.all, 'detail', id] as const,
};

/** 2. queryOptions: one place for key + fetcher; reusable for prefetch / getQueryData. */
export const dayQueries = {
  list: () => queryOptions({ queryKey: dayKeys.lists(), queryFn: daysApi.list }),
  detail: (id: string) =>
    queryOptions({ queryKey: dayKeys.detail(id), queryFn: () => daysApi.get(id), enabled: !!id }),
};

/** 3. Hooks: what screens call. */

/** All day submissions, newest first. */
export function useDays() {
  return useQuery(dayQueries.list());
}

export function useDay(id: string) {
  const queryClient = useQueryClient();
  return useQuery({
    ...dayQueries.detail(id),
    // Show the list's copy instantly while the detail request runs.
    placeholderData: () =>
      queryClient.getQueryData(dayQueries.list().queryKey)?.find((day) => day.id === id),
  });
}

/**
 * The submission for `date` (same year, month and day), or `null` if that day isn't
 * submitted yet. Derived from the list, so no extra request.
 */
export function useDaySubmission(date: string) {
  return useQuery({
    ...dayQueries.list(),
    select: (days) => days.find((day) => isSameDay(day.date, date)) ?? null,
  });
}

/**
 * Current and longest streak as of `today` (`YYYY-MM-DD`).
 * TEMP: computed on the device from the submissions list. If the backend adds a streak
 * endpoint (e.g. GET /api/streak), swap the select for its own queryOptions here; screens
 * keep calling useStreak().
 */
export function useStreak(today: string) {
  return useQuery({
    ...dayQueries.list(),
    select: (days) => getStreak(days.map((day) => day.date), today),
  });
}

export function useCreateDay() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: daysApi.create,
    onSuccess: (day) => {
      queryClient.setQueryData(dayKeys.detail(day.id), day);
      return queryClient.invalidateQueries({ queryKey: dayKeys.lists() });
    },
    onError: (error) => {
      // 409 = this date is already submitted (e.g. from another device): refetch so the
      // screen switches to "already done" instead of showing an error.
      if (error.status === 409) return queryClient.invalidateQueries({ queryKey: dayKeys.lists() });
    },
  });
}
