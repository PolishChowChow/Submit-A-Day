# src/dev (temporary)

Lets you use the whole app (sign in, switch between the Today, History and Settings tabs, submit a day) before the backend exists.

## Turn on / off

In `.env`:

```
EXPO_PUBLIC_USE_MOCKS=true   # fake in-memory backend
EXPO_PUBLIC_USE_MOCKS=false  # real API at EXPO_PUBLIC_API_URL/api
```

Restart `npx expo start` after changing it (env vars are inlined at bundle time).

With mocks on:
- Any email and password signs in. There's also a **Skip sign-in (mock mode)** button on the sign-in screen.
- 5 recurring tasks and 7 days of history are seeded. Today is left open so you can submit it.
- Data resets on reload.

## Remove when the backend is ready

1. Delete `src/dev/`.
2. Delete `src/features/auth/components/dev-skip-sign-in.tsx` and its line in `sign-in-screen.tsx`.
3. In `features/{auth,days,tasks}/api.ts`, remove the `USE_MOCKS` import and export the `http…Api` object directly.
4. Remove `EXPO_PUBLIC_USE_MOCKS` from `.env` / `.env.template`.

`grep -rn "TEMP" src` lists every spot.
