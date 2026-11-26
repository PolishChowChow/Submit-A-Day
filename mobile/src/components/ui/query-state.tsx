import type { UseQueryResult } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { Button, Paragraph, Spinner, YStack } from 'tamagui';

type QueryStateProps<TData> = {
  query: UseQueryResult<TData>;
  /** Rendered once data is available. */
  children: (data: TData) => ReactNode;
  /** Return true to show `emptyMessage` instead of `children` (e.g. `(days) => days.length === 0`). */
  isEmpty?: (data: TData) => boolean;
  emptyMessage?: string;
};

/**
 * Standard loading / error / empty / success rendering for a useQuery result.
 *
 *   <QueryState query={useDays()} isEmpty={(d) => d.length === 0}>
 *     {(days) => <DayList days={days} />}
 *   </QueryState>
 */
export function QueryState<TData>({
  query,
  children,
  isEmpty,
  emptyMessage = 'Nothing here yet.',
}: QueryStateProps<TData>) {
  if (query.isPending) {
    return (
      <Centered>
        <Spinner size="large" />
      </Centered>
    );
  }

  if (query.isError) {
    return (
      <Centered>
        <Paragraph textAlign="center">{query.error.message}</Paragraph>
        <Button onPress={() => query.refetch()} disabled={query.isFetching}>
          Try again
        </Button>
      </Centered>
    );
  }

  if (isEmpty?.(query.data)) {
    return (
      <Centered>
        <Paragraph textAlign="center" color="placeholder-color">
          {emptyMessage}
        </Paragraph>
      </Centered>
    );
  }

  return <>{children(query.data)}</>;
}

function Centered({ children }: { children: ReactNode }) {
  return (
    <YStack flex={1} alignItems="center" justifyContent="center" gap="3" padding="4">
      {children}
    </YStack>
  );
}
