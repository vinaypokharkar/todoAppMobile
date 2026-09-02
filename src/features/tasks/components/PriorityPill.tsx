import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../../theme/ThemeProvider';
import { radius, spacing, typography } from '../../../theme/tokens';
import type { Priority } from '../../../types/task.types';

/** Appends an alpha channel to a #RRGGBB hex colour. RN accepts 8-digit hex. */
const withAlpha = (hex: string, alphaHex: string) => `${hex}${alphaHex}`;

export interface PriorityPillProps {
  priority: Priority;
}

export function PriorityPill({ priority }: PriorityPillProps) {
  const { theme } = useTheme();
  const color = theme.colors.priority[priority];

  return (
    <View style={[styles.pill, { backgroundColor: withAlpha(color, '33') }]}>
      <Text style={[styles.label, { color }]}>{priority.toUpperCase()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    alignSelf: 'flex-start',
  },
  label: {
    fontSize: typography.overline.fontSize,
    fontWeight: '800' as const,
    letterSpacing: typography.overline.letterSpacing,
  },
});
