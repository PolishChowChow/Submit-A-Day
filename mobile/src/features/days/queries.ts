import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { daysApi } from './api';
import { todayIsoDate } from './utils';

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

/** Today's submission, if there is one (derived from the list, no extra request). */
export function useTodaySubmission() {
  const today = todayIsoDate();
  return useQuery({
    ...dayQueries.list(),
    select: (days) => days.find((day) => day.date === today) ?? null,
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
  });
}
