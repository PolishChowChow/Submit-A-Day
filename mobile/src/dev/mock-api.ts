/**
 * TEMP: in-memory fake backend used when USE_MOCKS is on.
 * Same shapes as the real API, so screens and queries don't know the difference.
 * Data resets on every reload. Only type imports from features (no runtime cycles).
 */
import type { AuthResponse, SignInInput, SignUpInput, User } from '@/features/auth/types';
import type { CreateDayInput, Day } from '@/features/days/types';
import type { Task } from '@/features/tasks/types';
import { ApiError } from '@/lib/api/errors';

export const MOCK_TOKEN = 'mock-token';

const LATENCY_MS = 400;
const wait = <T>(value: T) => new Promise<T>((resolve) => setTimeout(() => resolve(value), LATENCY_MS));

function isoDaysAgo(daysAgo: number): string {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

// ---- seed data ---------------------------------------------------------------

let user: User = { id: 'u1', name: 'Demo User', email: 'demo@example.com' };

const tasks: Task[] = [
  { id: 't1', title: 'Drink 2L of water' },
  { id: 't2', title: 'Workout 30 min' },
  { id: 't3', title: 'Read 20 pages' },
  { id: 't4', title: 'Meditate 10 min' },
  { id: 't5', title: 'No phone after 22:00' },
];

/** Which tasks were completed N days ago (yesterday back to a week ago; today is left open). */
const history: { daysAgo: number; done: string[]; note?: string }[] = [
  { daysAgo: 1, done: ['t1', 't2', 't3', 't4', 't5'], note: 'Perfect day!' },
  { daysAgo: 2, done: ['t1', 't3', 't4'] },
  { daysAgo: 3, done: ['t1', 't2'], note: 'Busy at work.' },
  { daysAgo: 4, done: ['t1', 't2', 't3', 't5'] },
  { daysAgo: 5, done: [] , note: 'Sick day.' },
  { daysAgo: 6, done: ['t2', 't3', 't4'] },
  { daysAgo: 7, done: ['t1', 't2', 't3', 't4'] },
];

function buildDay(id: string, date: string, completedIds: string[], note?: string): Day {
  return {
    id,
    date,
    note,
    createdAt: `${date}T21:00:00.000Z`,
    tasks: tasks.map((task) => ({
      taskId: task.id,
      title: task.title,
      completed: completedIds.includes(task.id),
    })),
  };
}

let days: Day[] = history.map((entry) =>
  buildDay(`d${entry.daysAgo}`, isoDaysAgo(entry.daysAgo), entry.done, entry.note)
);

// ---- endpoints ---------------------------------------------------------------

export const mockAuthApi = {
  signIn: (_input: SignInInput): Promise<AuthResponse> => wait({ token: MOCK_TOKEN, user }),
  signUp: (input: SignUpInput): Promise<AuthResponse> => {
    user = { id: 'u1', name: input.name, email: input.email };
    return wait({ token: MOCK_TOKEN, user });
  },
  me: (): Promise<User> => wait(user),
};

export const mockTasksApi = {
  list: (): Promise<Task[]> => wait([...tasks]),
};

export const mockDaysApi = {
  list: (): Promise<Day[]> => wait([...days].sort((a, b) => b.date.localeCompare(a.date))),
  get: async (id: string): Promise<Day> => {
    const day = days.find((d) => d.id === id);
    if (!day) {
      await wait(null);
      throw new ApiError('Day not found.', 404);
    }
    return wait(day);
  },
  create: async (input: CreateDayInput): Promise<Day> => {
    if (days.some((d) => d.date === input.date)) {
      await wait(null);
      throw new ApiError('You already submitted this day.', 409);
    }
    const day = buildDay(`d-${Date.now()}`, input.date, input.completedTaskIds, input.note);
    days = [day, ...days];
    return wait(day);
  },
};
