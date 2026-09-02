import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../../theme/ThemeProvider';
import { radius, spacing, typography } from '../../../theme/tokens';
import { formatRelativeDeadline, isOverdue } from '../../../utils/date';

export interface DeadlineChipProps {
  deadline: string;
  completed: boolean;
}

const HOUR_MS = 3_600_000;

export function DeadlineChip({ deadline, completed }: DeadlineChipProps) {
  const { theme } = useTheme();
  const label = completed ? formatRelativeDeadline(deadline) : formatRelativeDeadline(deadline);

  let backgroundColor = theme.colors.surfaceAlt;
  let color = theme.colors.textMuted;

  if (completed) {
    backgroundColor = 'transparent';
    color = theme.colors.textFaint;
  } else if (isOverdue(deadline)) {
    backgroundColor = theme.colors.priority.urgent;
    color = theme.colors.onAccent;
  } else {
    const hoursLeft = (new Date(deadline).getTime() - Date.now()) / HOUR_MS;
    if (hoursLeft < 6) {
      backgroundColor = theme.colors.warm;
      color = theme.colors.onWarm;
    }
  }

  return (
    <View style={[styles.chip, { backgroundColor }]}>
      <Text style={[styles.label, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    alignSelf: 'flex-start',
  },
  label: {
    fontSize: typography.caption.fontSize,
    fontWeight: '600' as const,
  },
});
