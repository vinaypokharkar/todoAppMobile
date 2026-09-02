module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    // ⚠ Reanimated 4 MOVED this plugin out of react-native-reanimated.
    // Using 'react-native-reanimated/plugin' here fails SILENTLY: worklets
    // are never transformed and you get cryptic runtime errors instead.
    // It must also be LAST in this array.
    'react-native-worklets/plugin',
  ],
};
