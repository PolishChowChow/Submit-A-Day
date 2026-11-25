import type { Day } from './types';

/** Today's date as `YYYY-MM-DD` in the device's local time zone. */
export function todayIsoDate(): string {
  return toIsoDate(new Date());
}

export function toIsoDate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

/** `2026-11-25` → `Wed, Nov 25, 2026` in the device locale. */
export function formatDayDate(isoDate: string): string {
  const [year, month, day] = isoDate.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/** `{ completed: 3, total: 5, ratio: 0.6 }` */
export function getDayProgress(day: Pick<Day, 'tasks'>) {
  const total = day.tasks.length;
  const completed = day.tasks.filter((task) => task.completed).length;
  return { completed, total, ratio: total === 0 ? 0 : completed / total };
}
