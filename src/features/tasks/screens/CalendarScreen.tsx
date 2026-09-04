import React, { useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '../../../theme/ThemeProvider';
import { spacing, typography } from '../../../theme/tokens';
import { Screen } from '../../../components/Screen';
import { EmptyState } from '../components/EmptyState';
import { SwipeableTaskRow } from '../components/SwipeableTaskRow';
import { MonthGrid, dayKey } from '../components/MonthGrid';
import { useGetTasksQuery, useToggleTaskMutation, useDeleteTaskMutation } from '../../../api/tasksApi';
import type { Priority, Task } from '../../../types/task.types';
import type { TabParamList, AppStackParamList } from '../../../navigation/types';

type Props = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, 'Calendar'>,
  NativeStackScreenProps<AppStackParamList>
>;

const SEVERITY: Record<Priority, number> = { urgent: 3, high: 2, medium: 1, low: 0 };
const agendaFmt = new Intl.DateTimeFormat('en-US', { weekday: 'short', day: 'numeric', month: 'short' });

export default function CalendarScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const [month, setMonth] = useState(() => new Date());
  const [selected, setSelected] = useState(() => new Date());

  // 'all' (not 'active') — a completed task should still show on the day it was due.
  const { data } = useGetTasksQuery({ status: 'all', sort: 'deadline' });
  const [toggleTask] = useToggleTaskMutation();
  const [deleteTask] = useDeleteTaskMutation();

  const tasksByDay = useMemo(() => {
    const map = new Map<string, (Task & { score: number })[]>();
    for (const task of data?.data ?? []) {
      const key = dayKey(new Date(task.deadline));
      const bucket = map.get(key);
      if (bucket) bucket.push(task);
      else map.set(key, [task]);
    }
    return map;
  }, [data]);

  const marks = useMemo(() => {
    const result: Record<string, Priority[]> = {};
    for (const [key, tasks] of tasksByDay) {
      result[key] = [...new Set(tasks.map(t => t.priority))]
        .sort((a, b) => SEVERITY[b] - SEVERITY[a])
        .slice(0, 3);
    }
    return result;
  }, [tasksByDay]);

  const dayTasks = tasksByDay.get(dayKey(selected)) ?? [];

  const changeMonth = (delta: 1 | -1) => {
    setMonth(m => new Date(m.getFullYear(), m.getMonth() + delta, 1));
  };

  const selectDay = (day: Date) => {
    setSelected(day);
    if (day.getMonth() !== month.getMonth() || day.getFullYear() !== month.getFullYear()) {
      setMonth(new Date(day.getFullYear(), day.getMonth(), 1));
    }
  };

  return (
    <Screen edges={['top', 'left', 'right']}>
      <View style={styles.body}>
        <MonthGrid
          month={month}
          selected={selected}
          marks={marks}
          onChangeMonth={changeMonth}
          onSelectDay={selectDay}
        />

        <View style={styles.agendaHead}>
          <Text style={[styles.agendaDay, { color: theme.colors.text }]}>{agendaFmt.format(selected)}</Text>
          <Text style={[styles.agendaCount, { color: theme.colors.textMuted }]}>
            {dayTasks.length} {dayTasks.length === 1 ? 'task' : 'tasks'}
          </Text>
        </View>

        {dayTasks.length === 0 ? (
          <EmptyState icon="📅" title="Nothing due" message="No tasks are due on this day." />
        ) : (
          <FlatList
            data={dayTasks}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.list}
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
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1, paddingHorizontal: spacing.lg, paddingTop: spacing.sm },
  agendaHead: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  agendaDay: { ...typography.heading },
  agendaCount: { ...typography.caption },
  list: { paddingBottom: 96 },
  row: { marginBottom: 0 },
});
