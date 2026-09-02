import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../../theme/ThemeProvider';
import { radius, spacing, typography } from '../../../theme/tokens';
import type { TaskSort } from '../../../types/task.types';

const OPTIONS: { value: TaskSort; label: string }[] = [
  { value: 'smart', label: '✦ Smart' },
  { value: 'deadline', label: 'Deadline' },
  { value: 'priority', label: 'Priority' },
];

export interface SortChipsProps {
  sort: TaskSort;
  onChange: (sort: TaskSort) => void;
  onOpenFilter: () => void;
}

/** Smart · Deadline · Priority chips, plus a search/filter icon opening FilterSheet. */
export function SortChips({ sort, onChange, onOpenFilter }: SortChipsProps) {
  const { theme } = useTheme();

  return (
    <View style={styles.row}>
      {OPTIONS.map(opt => {
        const on = opt.value === sort;
        return (
          <Pressable
            key={opt.value}
            onPress={() => onChange(opt.value)}
            accessibilityRole="button"
            accessibilityState={{ selected: on }}
            style={[
              styles.chip,
              {
                backgroundColor: on ? theme.colors.primary : theme.colors.surface,
                borderColor: on ? theme.colors.primary : theme.colors.border,
              },
            ]}
          >
            <Text style={[styles.chipLabel, { color: on ? theme.colors.onPrimary : theme.colors.textMuted }]}>
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
      <Pressable
        onPress={onOpenFilter}
        accessibilityRole="button"
        accessibilityLabel="Search and filter"
        style={[styles.iconChip, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
      >
        <Text style={{ color: theme.colors.textMuted }}>⌕</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.md,
  },
  chip: {
    borderRadius: radius.pill,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
  },
  chipLabel: { fontSize: typography.label.fontSize, fontWeight: '700' as const },
  iconChip: {
    marginLeft: 'auto',
    width: 34,
    height: 34,
    borderRadius: radius.pill,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
