// Runs before every test file (jest.config.js → setupFilesAfterEnv).

// The real config throws when EXPO_PUBLIC_API_URL is missing; tests never hit a real server.
jest.mock('@/constants/config', () => ({ API_URL: 'http://api.test' }));

// Tests use the real HTTP code paths (or mock feature api modules themselves), never src/dev mocks.
jest.mock('@/dev/flags', () => ({ USE_MOCKS: false }));

jest.mock('react-native-safe-area-context', () =>
  jest.requireActual('react-native-safe-area-context/jest/mock').default
);

// Reanimated's native/CSS runtime doesn't load in Jest (and its bundled mock pulls it in).
// The app only uses CSS transitions/keyframes, so render Animated.View as a plain View.
// Extend this if you start using shared values / useAnimatedStyle.
jest.mock('react-native-reanimated', () => {
  const { View } = jest.requireActual<typeof import('react-native')>('react-native');
  return {
    __esModule: true,
    default: { View },
    css: { keyframes: (keyframes: unknown) => keyframes, create: (styles: unknown) => styles },
    useReducedMotion: () => false,
  };
});
