import React from 'react';
import { StyleSheet, View, ViewProps } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { radius, spacing } from '../theme/tokens';

/** Themed surface with the standard card shadow. */
export function Card({ style, children, ...rest }: ViewProps) {
  const { theme } = useTheme();
  return (
    <View
      style={[
        styles.base,
        { backgroundColor: theme.colors.surface, borderColor: theme.colors.borderSoft },
        theme.shadow.card,
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.md,
  },
});
