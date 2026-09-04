import React from 'react';
import { ActivityIndicator, Image, StyleSheet, View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';

/**
 * Shown while `authSlice.initialising` is true, i.e. until Clerk reports
 * the persisted session. Holding here is what prevents a Login flash on a
 * warm start — see RootNavigator.
 */
export default function SplashScreen() {
  const { theme } = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.bg }]}>
      <Image source={require('../assets/logo.png')} style={styles.brandmark} resizeMode="contain" />
      <ActivityIndicator color={theme.colors.accent} style={styles.spinner} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  brandmark: { width: 72, height: 72 },
  spinner: { marginTop: 24 },
});
