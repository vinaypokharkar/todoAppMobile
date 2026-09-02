import React from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '../../../theme/ThemeProvider';
import { radius, spacing, typography } from '../../../theme/tokens';
import { Screen } from '../../../components/Screen';
import { Button } from '../../../components/Button';
import { PriorityPill } from '../components/PriorityPill';
import { useAppSelector } from '../../../app/hooks';
import { useGetTasksQuery, useToggleTaskMutation, useDeleteTaskMutation } from '../../../api/tasksApi';
import { formatDateTime } from '../../../utils/date';
import type { AppStackParamList } from '../../../navigation/types';

type Props = NativeStackScreenProps<AppStackParamList, 'TaskDetail'>;

export default function TaskDetailScreen({ navigation, route }: Props) {
  const { theme } = useTheme();
  const ui = useAppSelector(s => s.ui);
  const [toggleTask] = useToggleTaskMutation();
  const [deleteTask] = useDeleteTaskMutation();

  const filters = {
    status: ui.status,
    priority: ui.priority ?? undefined,
    tag: ui.tag ?? undefined,
    search: ui.search || undefined,
    sort: ui.sort,
  };

  const { task } = useGetTasksQuery(filters, {
    selectFromResult: ({ data }) => ({ task: data?.data.find(t => t.id === route.params.id) }),
  });

  if (!task) {
    return (
      <Screen>
        <View style={styles.formHead}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={10}>
            <Text style={[styles.back, { color: theme.colors.text }]}>←</Text>
          </Pressable>
          <Text style={[styles.formTitle, { color: theme.colors.text }]}>Task</Text>
          <View style={{ width: 22 }} />
        </View>
        <Text style={{ color: theme.colors.textMuted, textAlign: 'center', marginTop: spacing.xxl }}>
          Task not found — it may have just been deleted.
        </Text>
      </Screen>
    );
  }

  const scorePercent = Math.max(0, Math.round((task.score ?? 0) * 100));

  const handleDelete = () => {
    Alert.alert('Delete task', `Delete "${task.title}"? This can’t be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          deleteTask(task.id);
          navigation.goBack();
        },
      },
    ]);
  };

  return (
    <Screen>
      <View style={styles.formHead}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={10}>
          <Text style={[styles.back, { color: theme.colors.text }]}>←</Text>
        </Pressable>
        <Text style={[styles.formTitle, { color: theme.colors.text }]}>Task</Text>
        <Pressable
          onPress={() => navigation.navigate('TaskForm', { task })}
          hitSlop={10}
        >
          <Text style={[styles.editLabel, { color: theme.colors.accent }]}>Edit</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View
          style={[
            styles.hero,
            { backgroundColor: theme.colors.surface, borderLeftColor: theme.colors.priority[task.priority] },
            theme.shadow.card,
          ]}
        >
          <PriorityPill priority={task.priority} />
          <Text style={[styles.title, { color: theme.colors.text }]}>{task.title}</Text>
          {task.description ? (
            <Text style={[styles.description, { color: theme.colors.textMuted }]}>{task.description}</Text>
          ) : null}
        </View>

        <KeyValue label="Starts" value={formatDateTime(task.startAt)} theme={theme} />
        <KeyValue
          label="Deadline"
          value={formatDateTime(task.deadline)}
          valueColor={theme.colors.accent}
          theme={theme}
        />
        <KeyValue label="Tags" value={task.tags.length ? task.tags.join(' · ') : '—'} theme={theme} />
        <KeyValue label="Status" value={task.completed ? 'Completed' : 'Active'} theme={theme} noBorder />

        <View style={styles.scoreBlock}>
          <View style={styles.scoreHeader}>
            <Text style={[styles.rowLabel, { color: theme.colors.textMuted }]}>SMART SCORE</Text>
            <Text style={[styles.scoreValue, { color: theme.colors.text }]}>
              {(task.score ?? 0).toFixed(2)}
            </Text>
          </View>
          <View style={[styles.scoreTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
            <View
              style={[
                styles.scoreFill,
                { width: `${scorePercent}%`, backgroundColor: theme.colors.accent },
              ]}
            />
          </View>
          <Text style={[styles.formula, { color: theme.colors.textFaint }]}>
            0.45 × priority + 0.40 × urgency + 0.15 × overdue
          </Text>
        </View>

        <View style={styles.actions}>
          <Button
            label={task.completed ? 'Mark active' : 'Complete'}
            onPress={() => toggleTask(task.id)}
            fullWidth
            style={styles.actionButton}
          />
          <Button label="Delete" variant="danger" onPress={handleDelete} fullWidth style={styles.actionButton} />
        </View>
      </ScrollView>
    </Screen>
  );
}

function KeyValue({
  label,
  value,
  valueColor,
  theme,
  noBorder,
}: {
  label: string;
  value: string;
  valueColor?: string;
  theme: ReturnType<typeof useTheme>['theme'];
  noBorder?: boolean;
}) {
  return (
    <View
      style={[styles.kv, { borderBottomColor: noBorder ? 'transparent' : theme.colors.borderSoft }]}
    >
      <Text style={[styles.kvKey, { color: theme.colors.textMuted }]}>{label}</Text>
      <Text style={[styles.kvValue, { color: valueColor ?? theme.colors.text }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  formHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  back: { fontSize: 22 },
  formTitle: { ...typography.heading },
  editLabel: { fontSize: typography.body.fontSize, fontWeight: '800' as const },
  scroll: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl },
  hero: {
    borderRadius: radius.lg,
    borderLeftWidth: 4,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  title: { ...typography.display, marginTop: spacing.sm },
  description: { ...typography.body, marginTop: spacing.sm },
  kv: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
  },
  kvKey: { ...typography.label },
  kvValue: { ...typography.body, fontWeight: '600' as const },
  scoreBlock: { marginTop: spacing.lg },
  scoreHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.xs },
  rowLabel: {
    fontSize: typography.overline.fontSize,
    fontWeight: '800' as const,
    letterSpacing: typography.overline.letterSpacing,
  },
  scoreValue: { ...typography.heading },
  scoreTrack: { height: 8, borderRadius: radius.sm, overflow: 'hidden' },
  scoreFill: { height: 8, borderRadius: radius.sm },
  formula: { fontSize: 10, marginTop: spacing.sm },
  actions: { marginTop: spacing.xl, gap: spacing.sm },
  actionButton: { marginBottom: 0 },
});
