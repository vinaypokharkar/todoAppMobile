import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useTheme } from '../../../theme/ThemeProvider';
import { radius, spacing, typography } from '../../../theme/tokens';
import type { Task } from '../../../types/task.types';
import { formatRelativeDeadline } from '../../../utils/date';
import { PriorityPill } from './PriorityPill';
import { DeadlineChip } from './DeadlineChip';

export interface TaskCardProps {
  task: Task & { score?: number };
  onToggle: (id: string) => void;
  onPress: (id: string) => void;
}

export function TaskCard({ task, onToggle, onPress }: TaskCardProps) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const accessibilityLabel = `${task.title}, ${task.priority} priority, due ${formatRelativeDeadline(task.deadline)}`;

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        onPress={() => onPress(task.id)}
        onPressIn={() => { scale.value = withSpring(0.98, { damping: 18 }); }}
        onPressOut={() => { scale.value = withSpring(1, { damping: 18 }); }}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        style={[
          styles.card,
          {
            backgroundColor: task.completed ? theme.colors.surfaceAlt : theme.colors.surface,
            borderLeftColor: theme.colors.priority[task.priority],
          },
          theme.shadow.card,
        ]}
      >
        <View style={styles.row}>
          <Pressable
            onPress={() => onToggle(task.id)}
            hitSlop={10}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: task.completed }}
            style={[
              styles.checkbox,
              {
                borderColor: task.completed ? theme.colors.success : theme.colors.border,
                backgroundColor: task.completed ? theme.colors.success : 'transparent',
              },
            ]}
          >
            {task.completed ? (
              <Text style={[styles.check, { color: theme.colors.onSuccess }]}>✓</Text>
            ) : null}
          </Pressable>

          <View style={styles.content}>
            <Text
              numberOfLines={2}
              style={[
                styles.title,
                {
                  color: theme.colors.text,
                  textDecorationLine: task.completed ? 'line-through' : 'none',
                  opacity: task.completed ? 0.45 : 1,
                },
              ]}
            >
              {task.title}
            </Text>

            {task.description ? (
              <Text
                numberOfLines={1}
                style={[styles.description, { color: theme.colors.textMuted }]}
              >
                {task.description}
              </Text>
            ) : null}

            <View style={styles.metaRow}>
              <PriorityPill priority={task.priority} />
              <DeadlineChip deadline={task.deadline} completed={task.completed} />
              {task.tags.slice(0, 2).map(tag => (
                <View
                  key={tag}
                  style={[styles.tagChip, { backgroundColor: theme.colors.surfaceAlt }]}
                >
                  <Text style={[styles.tagLabel, { color: theme.colors.textMuted }]}>#{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    borderLeftWidth: 4,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  row: { flexDirection: 'row', alignItems: 'flex-start' },
  checkbox: {
    width: 17,
    height: 17,
    borderRadius: radius.sm,
    borderWidth: 1.6,
    marginRight: spacing.sm,
    marginTop: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  check: { fontSize: 11, fontWeight: '800' as const },
  content: { flex: 1 },
  title: { ...typography.heading, fontWeight: '700' as const },
  description: { ...typography.caption, marginTop: 2 },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  tagChip: {
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  tagLabel: { fontSize: typography.caption.fontSize, fontWeight: '600' as const },
});
