require('react-native-gesture-handler/jestSetup');

// NOT `require('react-native-reanimated/mock')` — see __mocks__/reanimatedMock.js
// for why the package's own mock doesn't work under Jest at this version.
jest.mock('react-native-reanimated', () => require('./__mocks__/reanimatedMock'));

jest.mock('@clerk/expo', () => ({
  getClerkInstance: () => ({ session: { getToken: async () => 'test-token' } }),
  useAuth: () => ({ isLoaded: true, isSignedIn: false, userId: null, signOut: jest.fn() }),
  useUser: () => ({ isLoaded: true, isSignedIn: false, user: null }),
  useSSO: () => ({ startSSOFlow: jest.fn() }),
  isClerkAPIResponseError: () => false,
  ClerkProvider: ({ children }) => children,
}));

jest.mock('@clerk/expo/legacy', () => ({
  useSignIn: () => ({ isLoaded: true, signIn: { create: jest.fn() }, setActive: jest.fn() }),
  useSignUp: () => ({ isLoaded: true, signUp: { create: jest.fn() }, setActive: jest.fn() }),
}));

// The subpath moved from '.../jest/async-storage-mock' to '.../jest' in
// this installed version (v3) — see the package's "exports" map.
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest'));

jest.mock('expo-speech-recognition', () => ({
  ExpoSpeechRecognitionModule: {
    requestPermissionsAsync: jest.fn(async () => ({ granted: true, canAskAgain: true })),
    start: jest.fn(),
    stop: jest.fn(),
  },
  useSpeechRecognitionEvent: jest.fn(),
}));
