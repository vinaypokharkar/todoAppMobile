import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../../theme/ThemeProvider';
import { radius, spacing, typography } from '../../../theme/tokens';
import type { Priority } from '../../../types/task.types';

export interface MonthGridProps {
  /** Any date within the month to display. */
  month: Date;
  selected: Date;
  /** dayKey() -> up to 3 distinct priorities present that day, most severe first. */
  marks: Record<string, Priority[]>;
  onSelectDay: (day: Date) => void;
  onChangeMonth: (delta: 1 | -1) => void;
}

const WEEKDAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const MONTH_FMT = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' });

/**
 * Local calendar-day key. Deliberately NOT toISOString() — that reads UTC
 * fields, so a task due late evening would key under tomorrow for anyone
 * west of UTC.
 */
export function dayKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function buildWeeks(month: Date): Date[][] {
  const year = month.getFullYear();
  const m = month.getMonth();
  const firstOfMonth = new Date(year, m, 1);
  const mondayOffset = (firstOfMonth.getDay() + 6) % 7; // getDay(): 0=Sun..6=Sat -> Monday-first
  const start = new Date(year, m, 1 - mondayOffset);

  const days = Array.from({ length: 42 }, (_, i) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + i));
  const weeks = Array.from({ length: 6 }, (_, i) => days.slice(i * 7, i * 7 + 7));

  // Months that fit in 5 rows shouldn't render a trailing all-next-month row.
  while (weeks.length > 1 && weeks[weeks.length - 1].every(d => d.getMonth() !== m)) {
    weeks.pop();
  }
  return weeks;
}

export function MonthGrid({ month, selected, marks, onSelectDay, onChangeMonth }: MonthGridProps) {
  const { theme } = useTheme();
  const today = new Date();
  const weeks = useMemo(() => buildWeeks(month), [month]);

  return (
    <View>
      <View style={styles.head}>
        <Text style={[styles.monthLabel, { color: theme.colors.text }]}>{MONTH_FMT.format(month)}</Text>
        <View style={styles.nav}>
          <Pressable onPress={() => onChangeMonth(-1)} hitSlop={10} accessibilityRole="button" accessibilityLabel="Previous month">
            <Text style={[styles.navGlyph, { color: theme.colors.textMuted }]}>‹</Text>
          </Pressable>
          <Pressable onPress={() => onChangeMonth(1)} hitSlop={10} accessibilityRole="button" accessibilityLabel="Next month">
            <Text style={[styles.navGlyph, { color: theme.colors.textMuted }]}>›</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.week}>
        {WEEKDAYS.map((w, i) => (
          <Text key={i} style={[styles.weekHeadText, { color: theme.colors.textFaint }]}>{w}</Text>
        ))}
      </View>

      {weeks.map((week, wi) => (
        <View key={wi} style={styles.week}>
          {week.map(d => {
            const inMonth = d.getMonth() === month.getMonth();
            const isToday = isSameDay(d, today);
            const isSelected = isSameDay(d, selected);
            const dots = marks[dayKey(d)] ?? [];

            return (
              <Pressable
                key={dayKey(d)}
                onPress={() => onSelectDay(d)}
                accessibilityRole="button"
                accessibilityLabel={d.toDateString()}
                style={[
                  styles.cell,
                  isSelected && { backgroundColor: theme.colors.primary },
                  !isSelected && isToday && { borderWidth: 1.5, borderColor: theme.colors.accent },
                ]}
              >
                <Text
                  style={[
                    styles.cellText,
                    { color: theme.colors.text, opacity: inMonth ? 1 : 0.28 },
                    isSelected && { color: theme.colors.warm },
                    !isSelected && isToday && { color: theme.colors.accent },
                  ]}
                >
                  {d.getDate()}
                </Text>
                <View style={styles.dots}>
                  {dots.map(p => (
                    <View
                      key={p}
                      style={[
                        styles.dot,
                        { backgroundColor: isSelected ? theme.colors.warm : theme.colors.priority[p] },
                      ]}
                    />
                  ))}
                </View>
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const CELL_GAP = 3;

const styles = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.sm },
  monthLabel: { ...typography.heading },
  nav: { flexDirection: 'row', gap: spacing.md },
  navGlyph: { fontSize: 18, fontWeight: '700' as const },
  week: { flexDirection: 'row', gap: CELL_GAP, marginBottom: CELL_GAP },
  weekHeadText: {
    flex: 1,
    textAlign: 'center',
    fontSize: typography.overline.fontSize,
    fontWeight: '700' as const,
    letterSpacing: typography.overline.letterSpacing,
  },
  cell: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  cellText: { fontSize: 13, fontWeight: '700' as const },
  dots: { flexDirection: 'row', gap: 2, height: 4 },
  dot: { width: 4, height: 4, borderRadius: 2 },
});
