module.exports = {
  preset: 'react-native',
  // Not in the PRD's literal config: react-native-worklets ships a jest
  // resolver that skips its `.native.ts` entry point (which touches the
  // real native module and crashes under Jest) in favour of the
  // plain-JS fallback. Reanimated 4's mock pulls in worklets transitively,
  // so without this the TaskCard render test crashes at require-time.
  resolver: 'react-native-worklets/jest/resolver',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  transformIgnorePatterns: [
    // Beyond the PRD's literal list: react-native-worklets (Reanimated 4's
    // mock.ts imports its ESM build transitively) and
    // @react-native-async-storage (its compiled jest mock is also ESM) are
    // added so Jest transforms them instead of choking on bare `import`.
    'node_modules/(?!(@react-native|react-native|@react-navigation|react-native-reanimated|react-native-worklets|react-native-gesture-handler|@react-native-firebase|@react-native-google-signin|@react-native-async-storage)/)',
  ],
  moduleNameMapper: { '\\.(png|jpg|jpeg|svg)$': '<rootDir>/__mocks__/fileMock.js' },
};
