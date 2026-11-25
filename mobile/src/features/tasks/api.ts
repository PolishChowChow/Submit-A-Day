import { mockTasksApi, USE_MOCKS } from '@/dev';
import { api } from '@/lib/api';

import type { Task } from './types';

// Endpoint paths are assumptions: change them to match the Submit-A-Day backend.
const httpTasksApi = {
  list: async () => (await api.get<Task[]>('/tasks')).data,
};

// TEMP: mock mode until the backend exists (see src/dev/README.md).
export const tasksApi = USE_MOCKS ? mockTasksApi : httpTasksApi;
