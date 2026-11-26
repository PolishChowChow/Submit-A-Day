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

/**
 * True when both dates fall on the same year, month and day.
 * Compares the `YYYY-MM-DD` part only, so `2026-11-25` and `2026-11-25T08:00:00Z` match.
 */
export function isSameDay(a: string, b: string): boolean {
  return a.slice(0, 10) === b.slice(0, 10);
}

/** `2026-11-25` → `Wed, Nov 25, 2026` in the device locale. */
export function formatDayDate(isoDate: string): string {
  return parseIsoDate(isoDate).toLocaleDateString(undefined, {
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

/** `2026-11-25` → a local Date at midnight. */
export function parseIsoDate(isoDate: string): Date {
  const [year, month, day] = isoDate.slice(0, 10).split('-').map(Number);
  return new Date(year, month - 1, day);
}

/** `2026-11-25`, -1 → `2026-11-24`. Month and year boundaries and DST are handled by Date. */
export function addDays(isoDate: string, amount: number): string {
  const date = parseIsoDate(isoDate);
  date.setDate(date.getDate() + amount);
  return toIsoDate(date);
}

export type Streak = {
  /** Consecutive submitted days ending today, or yesterday if today isn't submitted yet. */
  current: number;
  /** Longest run of consecutive submitted days ever. */
  longest: number;
  /** Today is submitted. */
  submittedToday: boolean;
};

/**
 * Streak from the list of submissions. Any submission counts, however many tasks were done.
 * The current streak stays alive until the end of today: missing only today doesn't break it
 * yet, so the UI can say "submit today to keep it going".
 */
export function getStreak(dates: readonly string[], today: string): Streak {
  const submitted = new Set(dates.map((date) => date.slice(0, 10)));
  const submittedToday = submitted.has(today);

  let current = 0;
  for (let day = submittedToday ? today : addDays(today, -1); submitted.has(day); day = addDays(day, -1)) {
    current += 1;
  }

  let longest = 0;
  for (const date of submitted) {
    if (submitted.has(addDays(date, -1))) continue; // not the start of a run
    let length = 1;
    while (submitted.has(addDays(date, length))) length += 1;
    longest = Math.max(longest, length);
  }

  return { current, longest, submittedToday };
}
