import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../../theme/ThemeProvider';
import { radius, spacing, typography } from '../../../theme/tokens';
import { useGetStatsQuery } from '../../../api/tasksApi';

/** Three stat cards — Active / Overdue / Done — sourced from GET /tasks/stats. */
export function StatsHeader() {
  const { theme } = useTheme();
  const { data } = useGetStatsQuery();

  const stats = [
    { label: 'Active', value: data?.active ?? 0 },
    { label: 'Overdue', value: data?.overdue ?? 0 },
    { label: 'Done', value: data?.completed ?? 0 },
  ];

  return (
    <View style={styles.row}>
      {stats.map(s => (
        <View
          key={s.label}
          style={[
            styles.stat,
            { backgroundColor: theme.colors.surface, borderColor: theme.colors.borderSoft },
            theme.shadow.card,
          ]}
        >
          <Text style={[styles.value, { color: theme.colors.accent }]}>{s.value}</Text>
          <Text style={[styles.label, { color: theme.colors.textMuted }]}>{s.label}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing.sm, paddingHorizontal: spacing.lg, marginTop: spacing.md },
  stat: {
    flex: 1,
    borderRadius: radius.lg,
    borderWidth: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  value: { ...typography.title, fontWeight: '800' as const },
  label: { ...typography.caption, marginTop: 2 },
});
