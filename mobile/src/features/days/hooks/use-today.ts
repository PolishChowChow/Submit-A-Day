import { useEffect, useState } from 'react';
import { AppState } from 'react-native';

import { todayIsoDate } from '../utils';

/**
 * Today's `YYYY-MM-DD`, kept current: flips at local midnight and is re-checked when the
 * app returns to the foreground, so a screen left open overnight shows the new day.
 */
export function useToday(): string {
  const [today, setToday] = useState(todayIsoDate);

  useEffect(() => {
    const refresh = () => setToday(todayIsoDate());

    const now = new Date();
    const nextMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const timer = setTimeout(refresh, nextMidnight.getTime() - now.getTime() + 1000);

    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') refresh();
    });

    return () => {
      clearTimeout(timer);
      subscription.remove();
    };
  }, [today]);

  return today;
}
