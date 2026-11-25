/**
 * One recurring task as recorded in a specific day's submission.
 * `title` is a snapshot, so renaming a task later doesn't rewrite history.
 */
export type DayTask = {
  taskId: string;
  title: string;
  completed: boolean;
};

/** A day submission: which of the user's recurring tasks were completed that day. */
export type Day = {
  id: string;
  /** Calendar date of the submission, `YYYY-MM-DD`. */
  date: string;
  /** Every recurring task that existed that day, completed or not. */
  tasks: DayTask[];
  note?: string;
  createdAt: string;
};

export type CreateDayInput = {
  date: string;
  /** IDs of the recurring tasks completed that day. The server records the rest as not completed. */
  completedTaskIds: string[];
  note?: string;
};
