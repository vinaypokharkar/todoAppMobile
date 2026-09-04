import React, { useCallback, useState } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Animated, { LinearTransition } from 'react-native-reanimated';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '../../../theme/ThemeProvider';
import { radius, spacing, typography } from '../../../theme/tokens';
import { Screen } from '../../../components/Screen';
import { Snackbar } from '../../../components/Snackbar';
import { StatsHeader } from '../components/StatsHeader';
import { SortChips } from '../components/SortChips';
import { FilterSheet } from '../components/FilterSheet';
import { SwipeableTaskRow } from '../components/SwipeableTaskRow';
import { TaskSkeleton } from '../components/TaskSkeleton';
import { EmptyState } from '../components/EmptyState';
import { VoiceFab } from '../components/VoiceFab';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { setSort, clearFilters } from '../uiSlice';
import {
  useGetTasksQuery,
  useToggleTaskMutation,
  useDeleteTaskMutation,
  useCreateTaskMutation,
} from '../../../api/tasksApi';
import { parseCommand, matchTask } from '../voiceCommand';
import { roundUpToQuarterHour, formatDateTime } from '../../../utils/date';
import { validateTitle } from '../../../utils/validation';
import type { TabParamList } from '../../../navigation/types';
import type { AppStackParamList } from '../../../navigation/types';

type Props = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, 'Tasks'>,
  NativeStackScreenProps<AppStackParamList>
>;

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

const dateFmt = new Intl.DateTimeFormat('en-US', { weekday: 'long', day: 'numeric', month: 'short' });

export default function TaskListScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const dispatch = useAppDispatch();
  const ui = useAppSelector(s => s.ui);
  const user = useAppSelector(s => s.auth.user);
  const [filterVisible, setFilterVisible] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    message: string;
    actionLabel?: string;
    onAction?: () => void;
  } | null>(null);

  const { data, isLoading, isFetching, isError, refetch } = useGetTasksQuery({
    status: ui.status,
    priority: ui.priority ?? undefined,
    tag: ui.tag ?? undefined,
    search: ui.search || undefined,
    sort: ui.sort,
  });

  // Unfiltered snapshot for voice matching — the visible `data` above is
  // narrowed by ui.status/priority/tag/search, so "delete X" on a task
  // hidden by the current filter would otherwise silently miss.
  const { data: allTasksData } = useGetTasksQuery({ status: 'all', sort: ui.sort });

  const [toggleTask] = useToggleTaskMutation();
  const [deleteTask] = useDeleteTaskMutation();
  const [createTask] = useCreateTaskMutation();

  const filtersActive =
    ui.status !== 'all' || ui.priority !== null || ui.tag !== null || ui.search !== '';

  const showSnackbar = useCallback(
    (message: string, actionLabel?: string, onAction?: () => void) => {
      setSnackbar({ message, actionLabel, onAction });
    },
    [],
  );

  const handleToggle = useCallback((id: string) => { toggleTask(id); }, [toggleTask]);

  const handleDelete = useCallback(
    (id: string) => {
      const task = data?.data.find(t => t.id === id) ?? null;
      deleteTask(id);
      showSnackbar('Task deleted', 'Undo', () => {
        if (task) {
          const { title, description, startAt, deadline, priority, tags } = task;
          createTask({ title, description, startAt, deadline, priority, tags });
        }
        setSnackbar(null);
      });
    },
    [data, deleteTask, createTask, showSnackbar],
  );

  const handleVoiceCommand = useCallback(
    async (transcript: string) => {
      const command = parseCommand(transcript);
      const tasks = allTasksData?.data ?? [];

      if (command.kind === 'unknown') {
        showSnackbar('Try "add buy milk"');
        return;
      }

      if (command.kind === 'add') {
        const titleError = validateTitle(command.title);
        if (titleError) {
          showSnackbar(titleError);
          return;
        }
        const now = new Date();
        const deadline = command.deadline ?? new Date(roundUpToQuarterHour(now).getTime() + 60 * 60 * 1000);
        // Rounding up can overshoot a near deadline ("in 5 minutes"), and the
        // form's rule is deadline >= startAt — fall back to the raw now.
        const rounded = roundUpToQuarterHour(now);
        const startAt = rounded.getTime() <= deadline.getTime() ? rounded : now;
        try {
          await createTask({
            title: command.title.trim(),
            description: null,
            startAt: startAt.toISOString(),
            deadline: deadline.toISOString(),
            priority: command.priority,
            tags: [],
          }).unwrap();
          showSnackbar(`Added "${command.title}" · ${formatDateTime(deadline.toISOString())}`);
        } catch {
          showSnackbar("Couldn't add task");
        }
        return;
      }

      if (tasks.length === 0) {
        showSnackbar('No tasks yet');
        return;
      }

      const task = matchTask(command.title, tasks);
      if (!task) {
        showSnackbar(`Couldn't find "${command.title}"`);
        return;
      }

      if (command.kind === 'complete') {
        if (task.completed) {
          showSnackbar(`"${task.title}" is already done`);
        } else {
          handleToggle(task.id);
          showSnackbar(`Completed "${task.title}"`);
        }
        return;
      }

      handleDelete(task.id);
    },
    [allTasksData, createTask, handleToggle, handleDelete, showSnackbar],
  );

  const handlePress = useCallback(
    (id: string) => navigation.navigate('TaskDetail', { id }),
    [navigation],
  );

  const initial = (user?.displayName?.[0] ?? user?.email?.[0] ?? '?').toUpperCase();

  return (
    <Screen edges={['top', 'left', 'right']}>
      <View style={styles.topBar}>
        <View>
          <Text style={[styles.greetDate, { color: theme.colors.textMuted }]}>
            {dateFmt.format(new Date())}
          </Text>
          <Text style={[styles.greetHeading, { color: theme.colors.text }]}>{greeting()}</Text>
        </View>
        <Pressable
          onPress={() => navigation.navigate('Profile')}
          accessibilityRole="button"
          accessibilityLabel="Open profile"
          style={[styles.avatar, { backgroundColor: theme.colors.primary }]}
        >
          <Text style={[styles.avatarText, { color: theme.colors.onPrimary }]}>{initial}</Text>
        </Pressable>
      </View>

      <StatsHeader />
      <SortChips
        sort={ui.sort}
        onChange={s => dispatch(setSort(s))}
        onOpenFilter={() => setFilterVisible(true)}
      />

      {isLoading ? (
        <View style={styles.list}>
          {[0, 1, 2, 3, 4].map(i => <TaskSkeleton key={i} />)}
        </View>
      ) : isError ? (
        <EmptyState
          icon="⚠️"
          title="Couldn’t load tasks"
          message="Check your connection and try again."
          actionLabel="Retry"
          onAction={refetch}
        />
      ) : data && data.count === 0 ? (
        filtersActive ? (
          <EmptyState
            icon="🔍"
            title="No tasks match these filters"
            message="Try a different status, priority or search term."
            actionLabel="Clear filters"
            onAction={() => dispatch(clearFilters())}
          />
        ) : (
          <EmptyState
            icon="📝"
            title="Nothing yet"
            message="Add your first task to get started."
            actionLabel="Add your first task"
            onAction={() => navigation.navigate('TaskForm')}
          />
        )
      ) : (
        <FlatList
          data={data?.data ?? []}
          keyExtractor={t => t.id}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} />}
          renderItem={({ item }) => (
            <Animated.View layout={LinearTransition.springify()}>
              <SwipeableTaskRow
                task={item}
                onToggle={handleToggle}
                onDelete={handleDelete}
                onPress={handlePress}
              />
            </Animated.View>
          )}
        />
      )}

      <Pressable
        onPress={() => navigation.navigate('TaskForm')}
        accessibilityRole="button"
        accessibilityLabel="Add task"
        style={[styles.fab, theme.shadow.fab]}
      >
        <LinearGradient colors={theme.colors.gradient} style={styles.fabGradient}>
          <Text style={[styles.fabIcon, { color: theme.colors.onAccent }]}>+</Text>
        </LinearGradient>
      </Pressable>

      <VoiceFab onCommand={handleVoiceCommand} onError={showSnackbar} />

      <FilterSheet visible={filterVisible} onClose={() => setFilterVisible(false)} />

      <Snackbar
        visible={snackbar !== null}
        message={snackbar?.message ?? ''}
        actionLabel={snackbar?.actionLabel}
        onAction={snackbar?.onAction}
        onDismiss={() => setSnackbar(null)}
        bottom={144}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  greetDate: { ...typography.caption },
  greetHeading: { ...typography.display, marginTop: 2 },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: typography.heading.fontSize, fontWeight: '800' as const },
  list: { padding: spacing.lg, paddingBottom: 96 },
  fab: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.lg,
    width: 56,
    height: 56,
    borderRadius: radius.pill,
  },
  fabGradient: {
    width: 56,
    height: 56,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabIcon: { fontSize: 28, fontWeight: '700' as const, marginTop: -2 },
});
