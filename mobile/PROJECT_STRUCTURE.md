# Project Structure: Submit-A-Day Mobile

Expo SDK 58 / React Native app for iOS, Android and Web.

| Concern | Tool |
|---|---|
| Navigation | Expo Router (file-based), `Stack.Protected` auth guards |
| UI & theming | Tamagui v3 (`@tamagui/config/v6` preset) |
| Server state | TanStack Query v5 + Axios |
| Forms | React Hook Form |
| Device storage | `expo-secure-store` (native) / `localStorage` (web) |
| GitHub sign-in | `expo-auth-session` (authorization code + PKCE); the server holds the secret |

> Keep this file updated whenever folders, conventions, or core dependencies change.

**New here?** Copy `.env.template` to `.env`, run `npm install` and `npm start`, press *Skip sign-in (mock mode)*, then read [Routing](#routing-expo-router) and [Conventions](#conventions).

**Contents:**
[Directory tree](#directory-tree) ·
[Domain model](#domain-model) ·
[Mock mode](#temporary-mock-mode) ·
[Routing](#routing-expo-router) ·
[Authentication](#authentication-flow) ·
[Data fetching](#data-fetching-tanstack-query) ·
[Theming](#theming-automatic-system-theme) ·
[Conventions](#conventions) ·
[Configuration](#configuration) ·
[Commands](#scripts--commands) ·
[Dependencies](#key-dependencies)

---

## Directory tree

```
mobile/
├── .env.template             # Env template (committed). Copy to .env
├── .env                      # Local env vars (git-ignored)
├── app.json                  # Expo config: icons, splash, plugins, experiments
├── eslint.config.js          # ESLint flat config (eslint-config-expo)
├── tamagui.config.ts         # Tamagui tokens/themes/media (v6 preset; longhand props enabled)
├── tsconfig.json             # Extends expo/tsconfig.base; `@/*` → src/*
├── assets/                   # App icon, splash, adaptive icons
└── src/
    ├── app/                          # ROUTES ONLY (thin files that render feature screens)
    │   ├── _layout.tsx               # Providers + splash + auth guard (Stack.Protected)
    │   ├── +not-found.tsx            # 404
    │   ├── oauth/github.tsx          # GitHub's OAuth redirect target (both auth states; web popup closes here)
    │   ├── (auth)/                   # 🔓 Signed-out only
    │   │   ├── _layout.tsx           #    Stack, no header, initial route sign-in
    │   │   ├── sign-in.tsx           #    /sign-in
    │   │   └── sign-up.tsx           #    /sign-up
    │   └── (app)/                    # 🔒 Signed-in only
    │       ├── _layout.tsx           #    Stack: tabs + pushed screens
    │       ├── (tabs)/
    │       │   ├── _layout.tsx       #    Bottom tabs (Today, History, Settings)
    │       │   ├── index.tsx         #    /          Today tab (main screen): checklist + "Submit a Day"
    │       │   ├── days.tsx          #    /days      History tab: all day submissions
    │       │   └── settings.tsx      #    /settings  Theme picker, sign out
    │       └── days/
    │           └── [id].tsx          #    /days/:id  One submission: tasks done / not done
    │
    ├── features/                     # One folder per feature; everything it needs lives inside
    │   ├── auth/
    │   │   ├── index.ts              # Public API: import only from '@/features/auth'
    │   │   ├── auth-provider.tsx     # Session context: status, token, signIn, signOut
    │   │   ├── api.ts                # /api/auth/login, /register, /me, /github, /github/link, DELETE /github
    │   │   ├── queries.ts            # authKeys, useCurrentUser, useSignIn, useSignUp, useGitHubSignIn, useLinkGitHub, useUnlinkGitHub
    │   │   ├── github.ts             # GitHub OAuth (expo-auth-session + PKCE): useGitHubAuthorization, useGitHubFlow
    │   │   ├── types.ts              # User (+ hasPassword, github), SignInInput, SignUpInput, AuthResponse, GitHubAuthInput
    │   │   ├── validation.ts         # react-hook-form rules
    │   │   ├── components/           # sign-in-form, sign-up-form, github-sign-in-button
    │   │   └── screens/              # sign-in-screen, sign-up-screen
    │   ├── days/
    │   │   ├── index.ts
    │   │   ├── api.ts                # GET /api/days, GET /api/days/:id, POST /api/days
    │   │   ├── queries.ts            # ⭐ Reference TanStack Query implementation (+ useDaySubmission)
    │   │   ├── types.ts              # Day, DayTask, CreateDayInput
    │   │   ├── utils.ts              # todayIsoDate, isSameDay, formatDayDate, getDayProgress
    │   │   ├── hooks/                # use-today: current date, flips at midnight / on app resume
    │   │   ├── components/           # day-list-item, task-row, submit-day-form (the checklist)
    │   │   └── screens/              # today-screen, days-screen, day-detail-screen
    │   ├── tasks/                    # Recurring tasks (the checklist each day is built from)
    │   │   ├── index.ts
    │   │   ├── api.ts                # GET /api/tasks
    │   │   ├── queries.ts            # taskKeys, useTasks
    │   │   └── types.ts              # Task
    │   └── settings/
    │       ├── index.ts
    │       ├── components/           # theme-picker
    │       └── screens/              # settings-screen
    │
    ├── components/                   # Shared, feature-agnostic UI
    │   ├── ui/                       # Screen (layout/safe-area/keyboard), QueryState (loading/error/empty)
    │   └── form/                     # TextField (Tamagui Input + RHF Controller), FormError
    │
    ├── lib/                          # Framework-level plumbing, no UI
    │   ├── api/                      # Axios client, auth header, 401 handling, ApiError
    │   ├── query/                    # QueryClient defaults, app-focus refetch, conventions doc
    │   └── storage.ts                # SecureStore / localStorage wrapper + StorageKeys
    │
    ├── theme/                        # Automatic light/dark system
    │   ├── theme-provider.tsx        # AppThemeProvider, useAppTheme, useColorScheme
    │   ├── use-system-color-scheme.ts / .web.ts
    │   └── types.ts                  # ThemePreference = 'system' | 'light' | 'dark'
    │
    ├── providers/
    │   └── app-providers.tsx         # QueryClient → Theme → Auth (in dependency order)
    │
    ├── constants/
    │   └── config.ts                 # API_URL from EXPO_PUBLIC_API_URL (throws if missing)
    │
    └── dev/                          # ⚠️ TEMP: mock backend + skip sign-in (see src/dev/README.md)
        ├── flags.ts                  # USE_MOCKS from EXPO_PUBLIC_USE_MOCKS
        └── mock-api.ts               # In-memory auth / tasks / days with seeded history
```

Generated / ignored: `node_modules/`, `.expo/` (incl. typed-route types), `dist/`, `/ios`, `/android` (Continuous Native Generation: never edit by hand).

---

## Domain model

```
Task (recurring)            Day (one submission per calendar date)
┌───────────────┐           ┌──────────────────────────────────────────┐
│ id            │──┐        │ id, date 'YYYY-MM-DD', note?, createdAt  │
│ title         │  │        │ tasks: DayTask[] ───────────────┐        │
└───────────────┘  │        └─────────────────────────────────┼────────┘
                   │        DayTask                           │
                   └──────▶ { taskId, title (snapshot), completed: boolean }
```

- **Task** is something the user repeats every day ("Read 20 pages").
- **Day** records, for one date, every recurring task and whether it was completed. Progress = `completed / total` (`getDayProgress`).
- Submitting sends only `completedTaskIds`. The server fills in the rest as not completed and snapshots the titles.
- At most one submission per date (same year, month and day: `isSameDay`).
- The **Today** screen (`/`) shows the checklist and a **Submit a Day** button until today is submitted, then **Already done** with the result. If the server answers 409 (submitted from another device), the list is refetched and the screen switches to Already done.

## Temporary mock mode

`EXPO_PUBLIC_USE_MOCKS=true` (the default in `.env.template`) swaps every feature's `api.ts` for an in-memory fake, so the full app works without a backend:
- Any email and password signs in, or press **Skip sign-in (mock mode)**. You land on **Today**. Switch between the **Today**, **History** and **Settings** tabs.
- 5 tasks and 7 days of history are seeded. Today is open so you can submit it.

Every temporary spot is marked `TEMP` (`grep -rn TEMP src`). The removal steps are in `src/dev/README.md`.

---

## Routing (Expo Router)

### How it works in 30 seconds

Navigation is **file-based**: every file in `src/app/` is a screen, and its path is its URL.

| Convention | Meaning | Example here |
|---|---|---|
| `name.tsx` | A screen at `/name` | `settings.tsx` → `/settings` |
| `index.tsx` | The folder's default screen | `(tabs)/index.tsx` → `/` |
| `_layout.tsx` | The **navigator** for its folder (Stack, Tabs…) wrapping its children | `(tabs)/_layout.tsx` = bottom tabs |
| `(group)/` | Organizes files and gets its own layout, **adds nothing to the URL** | `(auth)/sign-in.tsx` → `/sign-in` |
| `[param].tsx` | Dynamic segment, read with `useLocalSearchParams` | `days/[id].tsx` → `/days/42` |
| `+not-found.tsx` | Any URL that doesn't match | |

A static file beats a dynamic one: a `days/new.tsx` would win over `days/[id].tsx` for `/days/new`. `(tabs)/days.tsx` (`/days`) and `days/[id].tsx` (`/days/:id`) don't clash, because they are different paths.

### Navigator tree

```
Root Stack                      src/app/_layout.tsx        (providers, splash, auth guards)
├── (auth)  Stack               🔓 only when signed OUT
│   ├── sign-in                 /sign-in   (initial route of the group)
│   └── sign-up                 /sign-up
├── (app)   Stack               🔒 only when signed IN
│   ├── (tabs)  Tabs            bottom tab bar, header per tab
│   │   ├── index               /          "Today" tab (main screen after sign-in)
│   │   ├── days                /days      "History" tab
│   │   └── settings            /settings  "Settings" tab
│   └── days/[id]               /days/:id  pushed with a back button
└── +not-found
```

Screens inside `(app)` but outside `(tabs)` (like `days/[id]`) are pushed **over** the tab bar, so it's hidden there. Anything that should keep the tab bar visible belongs inside `(tabs)/`.

### Route map

| URL | Route file | Renders | Access | Shown as |
|---|---|---|---|---|
| `/sign-in` | `(auth)/sign-in.tsx` | `SignInScreen` | Signed out | Full screen, no header |
| `/sign-up` | `(auth)/sign-up.tsx` | `SignUpScreen` | Signed out | Full screen, no header |
| `/` | `(app)/(tabs)/index.tsx` | `TodayScreen` | Signed in | Tab "Today" (landing screen) |
| `/days` | `(app)/(tabs)/days.tsx` | `DaysScreen` | Signed in | Tab "History" |
| `/settings` | `(app)/(tabs)/settings.tsx` | `SettingsScreen` | Signed in | Tab "Settings" |
| `/days/:id` | `(app)/days/[id].tsx` | `DayDetailScreen` | Signed in | Pushed (title = the date) |
| `/oauth/github` | `oauth/github.tsx` | Spinner, then goes back | Everyone | GitHub's redirect target; not navigated to by the app |
| anything else | `+not-found.tsx` | 404 | Everyone | |

In development, open **`/_sitemap`** (web) to see every route Expo Router knows about.

### Navigating in code

Import everything from `expo-router`.

```tsx
import { Link, router, useLocalSearchParams } from 'expo-router';

// Declarative: preferred for anything tappable
<Link href="/settings">Settings</Link>
<Link href="/days" asChild><Button>History</Button></Link>      // asChild = the Button becomes the link
<Link href={{ pathname: '/days/[id]', params: { id: day.id } }} asChild>…</Link>

// Imperative: after an action (e.g. a successful submit)
router.push('/days');       // add to history
router.replace('/');        // swap the current screen (no back)
router.back();              // close modal / go back

// Reading params in a route file
const { id } = useLocalSearchParams<{ id: string }>();
```

**Typed routes are on.** Every `href` is type-checked, so a typo or a missing param is a compile error. The types are generated into `.expo/types/` by `npx expo start`. After adding or renaming a route file, run `expo start` once; until then `tsc` reports the new path as invalid.

### Route files stay thin

A route file only connects the URL to a feature screen:

```tsx
// src/app/(app)/days/[id].tsx
export default function DayDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <DayDetailScreen id={id} />;      // the screen lives in src/features/days/screens/
}
```

Screens receive plain props (`id`), not router objects, so they stay reusable and easy to test. Put **nothing except routes and `_layout.tsx`** in `src/app/`: every file there becomes a URL.

### Headers and titles

- **Static** title or presentation: set it in the parent `_layout.tsx`:
  `<Stack.Screen name="days/[id]" options={{ title: 'Day', headerBackTitle: 'Back' }} />` (add `presentation: 'modal'` to slide a screen up instead)
- **Dynamic** title (depends on data): set it from inside the screen:
  `<Stack.Screen options={{ title: formatDayDate(day.date) }} />` (see `day-detail-screen.tsx`).
- Tabs: title and icon live in `(tabs)/_layout.tsx` (`tabBarIcon` uses `lucide-react-native`).
- Header, tab bar and background colors come from the theme automatically (see *Theming*). Don't hard-code them.

### Recipes

| I want to… | Do this |
|---|---|
| **Add a tab** | Create `src/app/(app)/(tabs)/<name>.tsx`, then add a `<Tabs.Screen name="<name>" options={{ title, tabBarIcon }} />` in `(tabs)/_layout.tsx` (tabs appear in the order listed) |
| **Add a pushed screen** (behind login) | Create `src/app/(app)/<path>.tsx`; optionally add a `<Stack.Screen name="<path>" options={…} />` in `(app)/_layout.tsx` for its title |
| **Add a modal** | As above, with `options={{ presentation: 'modal' }}`; close it with `router.back()` |
| **Add a public screen** (e.g. forgot password) | Create `src/app/(auth)/<name>.tsx`. It's reachable only while signed out |
| **Add a page with a param** | `src/app/(app)/things/[thingId].tsx`, link with `{ pathname: '/things/[thingId]', params: { thingId } }` |
| **Add a screen visible to both** | Put it at the root of `src/app/` (outside both groups) and add `<Stack.Screen name="…" />` outside the `Stack.Protected` blocks in `src/app/_layout.tsx` |

The same URL can't exist in both groups (e.g. an `index.tsx` in `(auth)` **and** `(app)`). Expo Router would have two screens for `/`.

### Auth and routing together

- The **root layout decides** which group exists, based on `useAuth().status` (details in *Authentication flow* below).
- **Don't navigate after sign-in or sign-out.** Call `signIn()` / `signOut()` and the guard switches groups by itself. A manual `router.replace('/')` after login races the guard.
- **Opening a protected URL while signed out** (deep link, refresh on web) lands on `/sign-in`. After signing in the user goes to `/`, not back to the original URL. Add a `redirect` param if that's ever needed.
- `unstable_settings.anchor` in `(app)/_layout.tsx` is `(tabs)` (and `sign-in` in `(auth)`). A deep link straight to `/days/42` still has the tabs underneath, so the back button works. In SDK 58 use `anchor`; `initialRouteName` is deprecated.
- **Every `Stack.Protected` needs `redirectTo` pointing at a real URL.** Without it, a blocked route falls back to the first allowed sibling by its file path. Here that's a group (`/(auth)`, `/(tabs)`), which has no screen of its own, so the user sees a 404 and a URL containing the group name. If you add a guard anywhere, give it a `redirectTo`.

### Deep links

- Native URL scheme: `mobile://` (from `"scheme"` in `app.json`). `mobile://days/42` opens day 42, and `mobile://settings` opens Settings.
- On web the same paths are real URLs: `http://localhost:8081/days/42`.
- Test on a device or simulator: `npx uri-scheme open "mobile://days/42" --ios` (or `--android`).
- Change `"scheme"` to something unique (e.g. `submitaday`) before release.

---

## Authentication flow

1. On launch `AuthProvider` reads the token from secure storage. Until it's done, `status = 'loading'` and the splash screen stays visible.
2. The root layout renders two guarded groups:
   ```tsx
   <Stack.Protected guard={isSignedIn} redirectTo="/sign-in"><Stack.Screen name="(app)" /></Stack.Protected>
   <Stack.Protected guard={!isSignedIn} redirectTo="/"><Stack.Screen name="(auth)" /></Stack.Protected>
   ```
   When `status` changes, Expo Router moves to the allowed group by itself. **Never call `router.replace` after login or logout.**
3. `useSignIn` / `useSignUp` → `signIn(token)` saves the token, sets the `Authorization: Bearer` header, and seeds the `me` query.
4. `signOut()` (or **any 401** from the API) clears the token and the whole query cache, which returns the user to `/sign-in`.

Guards are client-side only. The backend must still authorize every request.

Where to put a new screen: see *Routing → Recipes* above.

### GitHub sign-in

**Continue with GitHub** (Sign in, Sign up) and **Settings → GitHub** (connect / disconnect) use `features/auth/github.ts`:

1. `useGitHubAuthorization()` wraps `useAuthRequest` from `expo-auth-session`: authorization code + **PKCE**, scopes `read:user user:email`, redirect `makeRedirectUri({ path: 'oauth/github' })`.
   - development build: `mobile://oauth/github`
   - web: `<origin>/oauth/github`
   - expo-auth-session generates and checks `state` itself; a mismatch comes back as an error result.
2. `useGitHubFlow(mutation)` starts the prompt **synchronously from the tap**: on web, a popup opened later is blocked. If GitHub returns a code, it runs the mutation with `{ code, redirectUri, codeVerifier }`.
   - `useGitHubSignIn` → `POST /api/auth/github` → `signIn(token)`, as with a password.
   - `useLinkGitHub` → `POST /api/auth/github/link` → updates the cached `me`.
   - Closing the browser, or **Cancel** on GitHub (`access_denied`), is not an error.
3. The **server** exchanges the code with the client secret. The app never holds a GitHub token or secret: only the public client ID (`EXPO_PUBLIC_GITHUB_CLIENT_ID`).
4. `src/app/oauth/github.tsx` is the redirect target. On web it calls `WebBrowser.maybeCompleteAuthSession()`, which hands the URL to the opener and closes the popup. On Android the deep link also lands here, and the screen just goes back. It sits outside both guards, because the redirect arrives signed out (sign in) or signed in (connect).

Rules from the server you'll see in the UI:
- An email that already has a password account gets 409 "Sign in with your password, then connect GitHub in Settings". The server never links by email.
- An account created with GitHub has `hasPassword: false`, so Settings shows no **Disconnect**.

Setup (registering the GitHub app, callback URLs, server env): [server/PROJECT_STRUCTURE.md → GitHub sign-in](../server/PROJECT_STRUCTURE.md#github-sign-in). **Expo Go can't do OAuth**: test on web or in a development build (`npx expo run:android` / `run:ios`). With `EXPO_PUBLIC_GITHUB_CLIENT_ID` unset the GitHub buttons are hidden. In mock mode the GitHub calls are faked, but the button still opens real GitHub, so it needs the client ID.

---

## Data fetching (TanStack Query)

| Piece | File | Role |
|---|---|---|
| Client & defaults | `lib/query/query-client.ts` | staleTime 30s, gcTime 5m, no retry on 4xx, `error` typed as `ApiError` globally |
| App focus | `setupQueryFocusManager()` | Refetches stale queries when the app returns to the foreground |
| Errors | `lib/api/errors.ts` | Every request rejects with `ApiError { message, status, data }` |
| UI states | `components/ui/query-state.tsx` | `<QueryState query={...}>{(data) => ...}</QueryState>` |

**Per-feature pattern** (copy `features/days/queries.ts`):

```ts
export const dayKeys = {                         // 1. hierarchical keys
  all: ['days'] as const,
  lists: () => [...dayKeys.all, 'list'] as const,
  detail: (id: string) => [...dayKeys.all, 'detail', id] as const,
};
export const dayQueries = {                      // 2. queryOptions (typed key + fetcher)
  list: () => queryOptions({ queryKey: dayKeys.lists(), queryFn: daysApi.list }),
};
export function useDays() { return useQuery(dayQueries.list()); }   // 3. hooks for screens
export function useCreateDay() {                 // mutations invalidate affected keys
  return useMutation({ mutationFn: daysApi.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: dayKeys.lists() }) });
}
```

Screens never call `api` or `useQuery` with raw keys directly; they use the feature's hooks.

---

## Theming (automatic system theme)

`AppThemeProvider` is the single source of truth:

- **Default `system`**: follows the OS and updates live when the user switches OS dark mode.
- **User override**: `light` / `dark` from Settings → Appearance, persisted on the device.
- One resolved scheme drives **everything**:
  - Tamagui theme (`<Theme name="light|dark">`)
  - React Navigation theme (headers, tab bar, screen backgrounds), built from Tamagui colors so they always match
  - Status bar style
  - Native UI (alerts, pickers, keyboard) via `Appearance.setColorScheme`
- Web: returns `light` during server rendering, then the real scheme after hydration (no mismatch).

**In components, use theme tokens and never hard-coded colors:**
```tsx
<YStack backgroundColor="background" padding="4" gap="3">
  <Paragraph color="placeholder-color">…</Paragraph>
</YStack>
```
Tamagui v3 tokens have **no `$` prefix** (`background`, `color`, `border-color`, `red-500`, space `"1"`–`"10"`).
Need the scheme in code? `useColorScheme()` from `@/theme` (not from `react-native`). Need to change it? `useAppTheme().setPreference('dark')`.

---

## Conventions

- **Routes are thin.** `src/app/**` files only import and render a screen from `src/features/*`.
- **Features own their code.** `api.ts`, `queries.ts`, `types.ts`, `components/`, `screens/`. Other code imports a feature only through its `index.ts`.
- **Shared ≠ feature.** Put something in `src/components` only once two or more features use it.
- **Adding a feature:** create `src/features/<name>/{index.ts,api.ts,queries.ts,types.ts,components/,screens/}`, then add route files under `(auth)` or `(app)`.
- File names: kebab-case; platform variants via `.web.ts` / `.ios.tsx` / `.android.tsx`.
- Imports via the `@/` alias across folders, relative imports inside a feature.
- Add packages with `npx expo install <pkg>`.
- Before finishing a task: `npx expo lint` and `npx tsc --noEmit`.

---

## Configuration

### Environment variables
| Name | Used in | Required |
|---|---|---|
| `EXPO_PUBLIC_API_URL` | `src/constants/config.ts` | Yes: the app throws on startup if it's missing |
| `EXPO_PUBLIC_USE_MOCKS` | `src/dev/flags.ts` | TEMP. `true` = fake backend |
| `EXPO_PUBLIC_GITHUB_CLIENT_ID` | `src/constants/config.ts` | No. Public GitHub client ID; unset = GitHub buttons hidden |

`cp .env.template .env` and set the real URL. `EXPO_PUBLIC_*` values are bundled into the app, so never put secrets in them.

### Backend contract

The backend is the NestJS API in [`../server`](../server). Its endpoints, request and response shapes, and status codes are listed in **[server/PROJECT_STRUCTURE.md → Endpoints](../server/PROJECT_STRUCTURE.md#endpoints)**. That table is the source of truth, so it isn't repeated here.

- The `/api` prefix is added once in `src/lib/api/client.ts` (`API_PREFIX`). Feature `api.ts` files use paths without it (`'/days'`), and `EXPO_PUBLIC_API_URL` is the bare server origin (`http://localhost:3000`).
- `features/*/types.ts` mirror the server's response shapes field for field. **Change both sides together**, along with that table.
- The server answers errors with `{ statusCode, message: string | string[], error }`. For 4xx, `toApiError` shows `message` (or its first item) to the user; for 5xx it shows its own generic text.
- The server returns 401 only for a missing, expired or invalid session, which is why any 401 signs the user out here.
- To use the real server: set `EXPO_PUBLIC_USE_MOCKS=false`, and set `EXPO_PUBLIC_API_URL` to an address the device can reach. See [server/PROJECT_STRUCTURE.md → Reaching the API from the app](../server/PROJECT_STRUCTURE.md#reaching-the-api-from-the-app): the Android emulator needs `10.0.2.2`, and a phone needs your PC's LAN IP. Restart `npx expo start` after changing `.env`.

### Running against the real server

In `server/`: `npm run db:up`, `npm run start:dev`, then `npm run db:seed`. Sign in with one of the seeded accounts:

| Email | History | Use it to test |
|---|---|---|
| `demo@example.com` | 5 tasks, the last 7 days submitted, today open | Same data as the app's mock mode: Today checklist, a 7-day streak, History, day detail |
| `streak@example.com` | 5 tasks, 51 days over ~2 months with gaps | Calendar and streaks: current **10**, best **22**, every completion level from 0/5 to 5/5 |
| `new@example.com` | 3 tasks, no submissions | First submission, 0-day streak, empty History |

Password for all three: **`password123`**.

Re-run `npm run db:seed` to reset them (for example, to re-open today after submitting it). The **Skip sign-in** button only exists in mock mode: its fake token gets a 401 from the real server. Details: [server/PROJECT_STRUCTURE.md → Seed data](../server/PROJECT_STRUCTURE.md#seed-data-test-accounts).

### app.json highlights
- Plugins: `expo-router`, `expo-splash-screen`, `expo-secure-store`
- `userInterfaceStyle: "automatic"` (required for the system theme)
- Experiments: `typedRoutes` (hrefs are type-checked; types regenerate on `expo start`), `reactCompiler`

---

## Scripts & commands

```bash
npm start               # expo start
npm run android | ios | web
npm run lint            # expo lint
npx tsc --noEmit        # typecheck
npx expo install <pkg>  # add SDK-compatible packages
npx expo-doctor         # diagnose dependency/config issues
```

`expo-secure-store` is a native module. It's included in Expo Go, but custom dev builds must be rebuilt after it's added (`npx expo run:ios|android` or `eas build --profile development`).

---

## Key dependencies

| Area | Packages |
|---|---|
| Framework | `expo` ~58, `react-native` 0.88, `react` 19.3 |
| Navigation | `expo-router`, `react-native-screens`, `react-native-safe-area-context` |
| UI | `tamagui`, `@tamagui/config`, `lucide-react-native` + `react-native-svg`, `expo-image`, `expo-symbols` |
| Data | `@tanstack/react-query`, `axios` |
| Forms | `react-hook-form` |
| Storage | `expo-secure-store` |
| OAuth (GitHub) | `expo-auth-session` + its peer `expo-crypto`, `expo-web-browser` |
| Animation | `react-native-reanimated`, `react-native-worklets`, `react-native-gesture-handler` |
