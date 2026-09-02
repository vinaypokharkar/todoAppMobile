/**
 * Hand-rolled Reanimated mock for Jest.
 *
 * NOT the package's own `react-native-reanimated/mock` export: Reanimated 4's
 * mock.ts pulls in the real native init chain (via react-native-worklets),
 * which throws ("createShareable is not supported on web") outside a real
 * RN/JSI runtime. Rather than fight that version-specific breakage, this
 * stubs the handful of APIs the app actually uses — useSharedValue,
 * useAnimatedStyle, withSpring/withTiming/withRepeat, Easing, and
 * Animated.View/LinearTransition — synchronously and without worklets.
 */
const React = require('react');
const { View } = require('react-native');

const useSharedValue = initial => {
  const ref = React.useRef({ value: initial });
  return ref.current;
};

const useAnimatedStyle = styleFactory => styleFactory();

const withSpring = (toValue, _config, callback) => {
  if (callback) callback(true);
  return toValue;
};
const withTiming = (toValue, _config, callback) => {
  if (callback) callback(true);
  return toValue;
};
const withRepeat = toValue => toValue;

const Easing = {
  inOut: fn => fn,
  ease: v => v,
  linear: v => v,
};

const LinearTransition = { springify: () => ({ springify: () => ({}) }) };

module.exports = {
  __esModule: true,
  default: { View, Text: View, ScrollView: View, createAnimatedComponent: c => c },
  View,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withRepeat,
  Easing,
  LinearTransition,
};
