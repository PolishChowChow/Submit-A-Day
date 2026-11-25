import type { RegisterOptions } from 'react-hook-form';

/** Reusable react-hook-form rules for auth forms. */
export const authRules = {
  name: {
    required: 'Name is required',
    minLength: { value: 2, message: 'Name is too short' },
  },
  email: {
    required: 'Email is required',
    pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email' },
  },
  password: {
    required: 'Password is required',
    minLength: { value: 8, message: 'Use at least 8 characters' },
  },
} satisfies Record<string, RegisterOptions>;
