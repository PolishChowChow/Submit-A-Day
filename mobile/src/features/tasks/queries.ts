import { queryOptions, useQuery } from '@tanstack/react-query';

import { tasksApi } from './api';

export const taskKeys = {
  all: ['tasks'] as const,
  lists: () => [...taskKeys.all, 'list'] as const,
};

export const taskQueries = {
  list: () =>
    queryOptions({ queryKey: taskKeys.lists(), queryFn: tasksApi.list, staleTime: 5 * 60_000 }),
};

/** The user's recurring tasks: the checklist for each day's submission. */
export function useTasks() {
  return useQuery(taskQueries.list());
}
