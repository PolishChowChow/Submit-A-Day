import { fireEvent, screen } from '@testing-library/react-native';

import { tasksApi } from '@/features/tasks/api';
import { ApiError, ERROR_MESSAGES } from '@/lib/api/errors';
import { renderWithProviders } from '@/test-utils/render';

import { daysApi } from '../api';
import { TodayScreen } from '../screens/today-screen';
import type { Day } from '../types';
import { addDays, todayIsoDate } from '../utils';

jest.mock('../api', () => ({
  daysApi: { list: jest.fn(), get: jest.fn(), create: jest.fn() },
}));
jest.mock('@/features/tasks/api', () => ({ tasksApi: { list: jest.fn() } }));

const listDays = jest.mocked(daysApi.list);
const createDay = jest.mocked(daysApi.create);
const listTasks = jest.mocked(tasksApi.list);

const serverDown = () => new ApiError(ERROR_MESSAGES.network, null);
const TASKS = [
  { id: 't1', title: 'Drink water' },
  { id: 't2', title: 'Read 20 pages' },
];

function day(date: string, done: string[]): Day {
  return {
    id: `d-${date}`,
    date,
    createdAt: `${date}T20:00:00.000Z`,
    tasks: TASKS.map((t) => ({ taskId: t.id, title: t.title, completed: done.includes(t.id) })),
  };
}

beforeEach(() => {
  jest.clearAllMocks();
  listTasks.mockResolvedValue(TASKS);
});

describe('TodayScreen when the server is down', () => {
  it('shows a "can\'t reach the server" error and recovers on "Try again"', async () => {
    listDays.mockRejectedValueOnce(serverDown()).mockResolvedValue([]);

    await renderWithProviders(<TodayScreen />);

    expect(await screen.findByText("Can't reach the server")).toBeOnTheScreen();
    expect(screen.getByText(ERROR_MESSAGES.network)).toBeOnTheScreen();
    expect(screen.queryByText('Submit a Day')).not.toBeOnTheScreen();

    await fireEvent.press(screen.getByText('Try again'));

    expect(await screen.findByText('Submit a Day')).toBeOnTheScreen();
    expect(screen.getByText('Drink water')).toBeOnTheScreen();
    expect(listDays).toHaveBeenCalledTimes(2);
  });

  it('keeps the checked tasks and shows the error when submitting fails', async () => {
    listDays.mockResolvedValue([]);
    createDay.mockRejectedValueOnce(serverDown());

    await renderWithProviders(<TodayScreen />);

    await fireEvent.press(await screen.findByLabelText('Drink water'));
    await fireEvent.press(screen.getByText('Submit a Day'));

    expect(await screen.findByText(ERROR_MESSAGES.network)).toBeOnTheScreen();
    expect(screen.getByText('Try again')).toBeOnTheScreen();
    expect(screen.getByLabelText('Drink water')).toBeChecked();
    expect(createDay.mock.calls[0]?.[0]).toEqual({ date: todayIsoDate(), completedTaskIds: ['t1'] });
  });
});

describe('TodayScreen', () => {
  it('shows "Already done" when today is already submitted', async () => {
    const today = todayIsoDate();
    listDays.mockResolvedValue([day(today, ['t1']), day(addDays(today, -1), [])]);

    await renderWithProviders(<TodayScreen />);

    expect(await screen.findByText('Already done')).toBeOnTheScreen();
    expect(screen.getByText('2-day streak')).toBeOnTheScreen();
    expect(screen.queryByText('Submit a Day')).not.toBeOnTheScreen();
  });
});
