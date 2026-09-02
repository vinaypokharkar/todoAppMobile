require('react-native-gesture-handler/jestSetup');

// NOT `require('react-native-reanimated/mock')` — see __mocks__/reanimatedMock.js
// for why the package's own mock doesn't work under Jest at this version.
jest.mock('react-native-reanimated', () => require('./__mocks__/reanimatedMock'));

jest.mock('@react-native-firebase/auth', () => ({
  getAuth: () => ({ currentUser: { uid: 'test-uid', getIdToken: async () => 'test-token' } }),
  onAuthStateChanged: jest.fn(() => jest.fn()),
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
}));

// The subpath moved from '.../jest/async-storage-mock' to '.../jest' in
// this installed version (v3) — see the package's "exports" map.
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest'));
