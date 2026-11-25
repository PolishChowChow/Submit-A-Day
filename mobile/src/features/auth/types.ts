export type User = {
  id: string;
  email: string;
  name: string;
};

export type SignInInput = {
  email: string;
  password: string;
};

export type SignUpInput = {
  name: string;
  email: string;
  password: string;
};

/** Response of the sign-in and sign-up endpoints. Adjust to match the backend. */
export type AuthResponse = {
  token: string;
  user: User;
};
