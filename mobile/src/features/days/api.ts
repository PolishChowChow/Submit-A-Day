import { mockDaysApi, USE_MOCKS } from '@/dev';
import { api } from '@/lib/api';

import type { CreateDayInput, Day } from './types';

// Endpoint paths are assumptions: change them to match the Submit-A-Day backend.
const httpDaysApi = {
  /** Newest first. */
  list: async () => (await api.get<Day[]>('/days')).data,
  get: async (id: string) => (await api.get<Day>(`/days/${id}`)).data,
  create: async (input: CreateDayInput) => (await api.post<Day>('/days', input)).data,
};

// TEMP: mock mode until the backend exists (see src/dev/README.md).
export const daysApi = USE_MOCKS ? mockDaysApi : httpDaysApi;
