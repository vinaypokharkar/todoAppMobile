// MUST be expo/metro-config, not @react-native/metro-config. MainApplication.kt
// boots via ExpoReactHostFactory, which asks Metro for `.expo/.virtual-metro-entry`
// — a virtual module only this config registers. The RN config 404s on it.
// Note: this package exports getDefaultConfig only, no mergeConfig.
const { getDefaultConfig } = require('expo/metro-config');

module.exports = getDefaultConfig(__dirname);
