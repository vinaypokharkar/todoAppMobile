import React, { useMemo } from 'react';
import { SectionList, StyleSheet, Text, View } from 'react-native';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '../../../theme/ThemeProvider';
import { spacing, typography } from '../../../theme/tokens';
import { Screen } from '../../../components/Screen';
import { EmptyState } from '../components/EmptyState';
import { SwipeableTaskRow } from '../components/SwipeableTaskRow';
import { useAppSelector } from '../../../app/hooks';
import { useGetTasksQuery, useToggleTaskMutation, useDeleteTaskMutation } from '../../../api/tasksApi';
import type { Task } from '../../../types/task.types';
import type { TabParamList, AppStackParamList } from '../../../navigation/types';

type Props = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, 'Upcoming'>,
  NativeStackScreenProps<AppStackParamList>
>;

type Bucket = (Task & { score: number })[];

function bucketize(tasks: (Task & { score: number })[]) {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfTomorrow = new Date(startOfToday.getTime() + 86_400_000);
  const startOfWeek = new Date(startOfToday.getTime() + 7 * 86_400_000);

  const buckets: Record<'Today' | 'Tomorrow' | 'This week' | 'Later', Bucket> = {
    Today: [], Tomorrow: [], 'This week': [], Later: [],
  };

  for (const task of tasks) {
    if (task.completed) continue;
    const deadline = new Date(task.deadline);
    if (deadline < startOfTomorrow) buckets.Today.push(task);
    else if (deadline < startOfWeek && deadline.getTime() - startOfTomorrow.getTime() < 86_400_000) buckets.Tomorrow.push(task);
    else if (deadline < startOfWeek) buckets['This week'].push(task);
    else buckets.Later.push(task);
  }

  return (['Today', 'Tomorrow', 'This week', 'Later'] as const)
    .map(title => ({ title, data: buckets[title] }))
    .filter(section => section.data.length > 0);
}

export default function UpcomingScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const ui = useAppSelector(s => s.ui);
  const { data } = useGetTasksQuery({ status: 'active', sort: 'deadline' });
  const [toggleTask] = useToggleTaskMutation();
  const [deleteTask] = useDeleteTaskMutation();

  const sections = useMemo(() => bucketize(data?.data ?? []), [data]);

  void ui; // filters intentionally do not apply here — Upcoming always shows active work.

  if (sections.length === 0) {
    return (
      <Screen>
        <EmptyState icon="📅" title="Nothing upcoming" message="Active tasks with a deadline will show up here." />
      </Screen>
    );
  }

  return (
    <Screen>
      <SectionList
        sections={sections}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        renderSectionHeader={({ section }) => (
          <Text style={[styles.sectionHeader, { color: theme.colors.textMuted, backgroundColor: theme.colors.bg }]}>
            {section.title.toUpperCase()}
          </Text>
        )}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <SwipeableTaskRow
              task={item}
              onToggle={id => toggleTask(id)}
              onDelete={id => deleteTask(id)}
              onPress={id => navigation.navigate('TaskDetail', { id })}
            />
          </View>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { padding: spacing.lg, paddingBottom: 96 },
  sectionHeader: {
    fontSize: typography.overline.fontSize,
    fontWeight: '800' as const,
    letterSpacing: typography.overline.letterSpacing,
    paddingVertical: spacing.sm,
  },
  row: { marginBottom: 0 },
});
