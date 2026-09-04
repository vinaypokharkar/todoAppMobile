module.exports = {
  // babel-preset-expo wraps @react-native/babel-preset and adds the transforms
  // the expo-* modules and the virtual entry need. Must match metro.config.js.
  presets: ['babel-preset-expo'],
  plugins: [
    // ⚠ Reanimated 4 MOVED this plugin out of react-native-reanimated.
    // Using 'react-native-reanimated/plugin' here fails SILENTLY: worklets
    // are never transformed and you get cryptic runtime errors instead.
    // It must also be LAST in this array.
    'react-native-worklets/plugin',
  ],
};
