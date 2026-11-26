// Public API of the days feature. Import from '@/features/days', not from its internal files.
export { useToday } from './hooks/use-today';
export {
  dayKeys,
  dayQueries,
  useCreateDay,
  useDay,
  useDays,
  useDaySubmission,
  useStreak,
} from './queries';
export { DayDetailScreen } from './screens/day-detail-screen';
export { DaysScreen } from './screens/days-screen';
export { TodayScreen } from './screens/today-screen';
export type { CreateDayInput, Day, DayTask } from './types';
export { getStreak, type Streak } from './utils';
