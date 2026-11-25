/**
 * TanStack Query conventions for this app
 * ---------------------------------------
 * Each feature owns a `queries.ts` that exports:
 *   1. a key factory          → `dayKeys.detail(id)` (hierarchical, so
 *      `invalidateQueries({ queryKey: dayKeys.all })` hits every days query)
 *   2. `queryOptions` objects → reusable in hooks, prefetching and `setQueryData`
 *   3. hooks                  → `useDays()`, `useCreateDay()`; screens only call these
 *
 * Render loading / error / empty states with <QueryState> from `@/components/ui`.
 * Reference implementation: `src/features/days/queries.ts`.
 */
export { queryClient, setupQueryFocusManager } from './query-client';
