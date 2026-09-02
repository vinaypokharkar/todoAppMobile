import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeProvider';

interface ScreenProps {
  children: React.ReactNode;
  style?: ViewStyle;
  /** Disable edge insets when a child already manages its own (e.g. a full-bleed list). */
  edges?: ('top' | 'right' | 'bottom' | 'left')[];
}

/** SafeArea + themed background wrapper. Every screen mounts inside one of these. */
export function Screen({ children, style, edges = ['top', 'left', 'right'] }: ScreenProps) {
  const { theme } = useTheme();
  return (
    <SafeAreaView
      edges={edges}
      style={[styles.flex, { backgroundColor: theme.colors.bg }, style]}
    >
      <View style={styles.flex}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
});
