import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { radius, typography } from '../theme/tokens';

/**
 * Shown while `authSlice.initialising` is true, i.e. until Firebase reports
 * the persisted session. Holding here is what prevents a Login flash on a
 * warm start — see RootNavigator.
 */
export default function SplashScreen() {
  const { theme } = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.bg }]}>
      <View
        style={[
          styles.brandmark,
          { backgroundColor: theme.colors.primary, borderRadius: radius.lg },
        ]}
      >
        <Text style={[styles.brandmarkText, { color: theme.colors.onPrimary }]}>T</Text>
      </View>
      <ActivityIndicator color={theme.colors.accent} style={styles.spinner} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  brandmark: { width: 52, height: 52, alignItems: 'center', justifyContent: 'center' },
  brandmarkText: { fontSize: typography.title.fontSize, fontWeight: '800' as const },
  spinner: { marginTop: 24 },
});
