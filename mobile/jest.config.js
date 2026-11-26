// Jest config (Expo docs: https://docs.expo.dev/develop/unit-testing/).
// Tests are `*-test.ts(x)` files in `__tests__/` folders next to the code they cover.
const expoPreset = require('jest-expo/jest-preset');

// Reuse the preset's Babel transform for `.js/.ts` and also apply it to `.mjs`
// (Tamagui ships some ES-module-only files).
const [babelTransformKey, babelTransform] = Object.entries(expoPreset.transform).find(([key]) =>
  key.includes('[jt]sx?')
);

/** @type {import('jest').Config} */
module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testPathIgnorePatterns: ['/node_modules/', '/.expo/'],
  transform: {
    ...expoPreset.transform,
    [babelTransformKey]: babelTransform,
    '\.mjs$': babelTransform,
  },
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|standard-navigation|react-native-svg|tamagui|@tamagui/.*|lucide-react-native)',
  ],
  moduleNameMapper: {
    '^@/assets/(.*)$': '<rootDir>/assets/$1',
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};
