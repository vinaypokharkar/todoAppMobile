import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '../../../theme/ThemeProvider';
import { radius, spacing, typography } from '../../../theme/tokens';
import { Screen } from '../../../components/Screen';
import { TextField } from '../../../components/TextField';
import { Button } from '../../../components/Button';
import { useCreateTaskMutation, useUpdateTaskMutation } from '../../../api/tasksApi';
import { PRIORITIES, type Priority } from '../../../types/task.types';
import { formatDateTime, roundUpToQuarterHour } from '../../../utils/date';
import { validateTitle } from '../../../utils/validation';
import type { AppStackParamList } from '../../../navigation/types';

type Props = NativeStackScreenProps<AppStackParamList, 'TaskForm'>;

/**
 * Android date-time picker is imperative and shows one mode at a time.
 * Chain date -> time so the caller gets a single merged Date back.
 */
const pickDateTime = (current: Date, onDone: (d: Date) => void) => {
  DateTimePickerAndroid.open({
    value: current,
    mode: 'date',
    onChange: (_e, date) => {
      if (!date) return;
      DateTimePickerAndroid.open({
        value: date,
        mode: 'time',
        is24Hour: true,
        onChange: (_e2, time) => {
          if (!time) return;
          const merged = new Date(date);
          merged.setHours(time.getHours(), time.getMinutes(), 0, 0);
          onDone(merged);
        },
      });
    },
  });
};

export default function TaskFormScreen({ navigation, route }: Props) {
  const { theme } = useTheme();
  const editingTask = route.params?.task;
  const isEdit = !!editingTask;

  const [createTask, { isLoading: creating }] = useCreateTaskMutation();
  const [updateTask, { isLoading: updating }] = useUpdateTaskMutation();
  const submitting = creating || updating;

  const [title, setTitle] = useState(editingTask?.title ?? '');
  const [description, setDescription] = useState(editingTask?.description ?? '');
  const [startAt, setStartAt] = useState<Date>(
    editingTask ? new Date(editingTask.startAt) : roundUpToQuarterHour(new Date()),
  );
  const [deadline, setDeadline] = useState<Date>(
    editingTask
      ? new Date(editingTask.deadline)
      : new Date(roundUpToQuarterHour(new Date()).getTime() + 60 * 60 * 1000),
  );
  const [priority, setPriority] = useState<Priority>(editingTask?.priority ?? 'medium');
  const [tags, setTags] = useState<string[]>(editingTask?.tags ?? []);
  const [tagDraft, setTagDraft] = useState('');
  const [titleError, setTitleError] = useState<string | null>(null);
  const [dateError, setDateError] = useState<string | null>(null);

  const commitTag = () => {
    const t = tagDraft.trim().toLowerCase().slice(0, 24);
    if (t && tags.length < 10 && !tags.includes(t)) {
      setTags([...tags, t]);
    }
    setTagDraft('');
  };

  const removeTag = (t: string) => setTags(tags.filter(x => x !== t));

  const validate = (): boolean => {
    const titleErr = validateTitle(title);
    setTitleError(titleErr);

    const deadlineOk = deadline.getTime() >= startAt.getTime();
    setDateError(deadlineOk ? null : 'Deadline must be after the start time');

    return !titleErr && deadlineOk;
  };

  const handleSubmit = async () => {
    if (submitting || !validate()) return;

    const body = {
      title: title.trim(),
      description: description.trim() || null,
      startAt: startAt.toISOString(),
      deadline: deadline.toISOString(),
      priority,
      tags,
    };

    if (isEdit && editingTask) {
      await updateTask({ id: editingTask.id, body });
    } else {
      await createTask(body);
    }
    navigation.goBack();
  };

  return (
    <Screen>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'android' ? 'height' : 'padding'}>
        <View style={styles.formHead}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={10}>
            <Text style={[styles.back, { color: theme.colors.text }]}>←</Text>
          </Pressable>
          <Text style={[styles.formTitle, { color: theme.colors.text }]}>
            {isEdit ? 'Edit task' : 'New task'}
          </Text>
          <Pressable onPress={handleSubmit} disabled={submitting} hitSlop={10}>
            <Text style={[styles.save, { color: theme.colors.accent, opacity: submitting ? 0.5 : 1 }]}>
              {isEdit ? 'Save' : 'Create'}
            </Text>
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <TextField label="Title" value={title} onChangeText={setTitle} error={titleError} autoFocus />

          <TextField
            label="Description"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
          />

          <View style={styles.twoCol}>
            <Pressable style={styles.col} onPress={() => pickDateTime(startAt, setStartAt)}>
              <Text style={[styles.rowLabel, { color: theme.colors.textMuted }]}>STARTS</Text>
              <View style={[styles.dateBox, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface }]}>
                <Text style={{ color: theme.colors.text }}>{formatDateTime(startAt.toISOString())}</Text>
              </View>
            </Pressable>
            <Pressable style={styles.col} onPress={() => pickDateTime(deadline, setDeadline)}>
              <Text style={[styles.rowLabel, { color: theme.colors.textMuted }]}>DEADLINE</Text>
              <View
                style={[
                  styles.dateBox,
                  {
                    borderColor: dateError ? theme.colors.danger : theme.colors.border,
                    backgroundColor: theme.colors.surface,
                  },
                ]}
              >
                <Text style={{ color: theme.colors.text }}>{formatDateTime(deadline.toISOString())}</Text>
              </View>
            </Pressable>
          </View>
          {dateError ? (
            <Text style={[styles.errorText, { color: theme.colors.danger }]}>{dateError}</Text>
          ) : null}

          <Text style={[styles.rowLabel, { color: theme.colors.textMuted, marginTop: spacing.md }]}>
            PRIORITY
          </Text>
          <View style={styles.segments}>
            {PRIORITIES.map(p => {
              const on = p === priority;
              const color = theme.colors.priority[p];
              return (
                <Pressable
                  key={p}
                  onPress={() => setPriority(p)}
                  style={[
                    styles.segment,
                    { borderColor: on ? color : theme.colors.border, backgroundColor: on ? color : theme.colors.surface },
                  ]}
                >
                  <Text style={{ color: on ? '#FFFFFF' : theme.colors.textMuted, fontWeight: '700' }}>
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={[styles.rowLabel, { color: theme.colors.textMuted, marginTop: spacing.md }]}>
            TAGS
          </Text>
          <View style={styles.tagRow}>
            {tags.map(t => (
              <Pressable
                key={t}
                onPress={() => removeTag(t)}
                style={[styles.tagChip, { backgroundColor: theme.colors.surfaceAlt }]}
              >
                <Text style={{ color: theme.colors.textMuted }}>#{t} ✕</Text>
              </Pressable>
            ))}
            <TextInput
              value={tagDraft}
              onChangeText={v => {
                if (v.endsWith(' ')) { commitTag(); return; }
                setTagDraft(v);
              }}
              onSubmitEditing={commitTag}
              placeholder="+ add"
              placeholderTextColor={theme.colors.textFaint}
              style={[styles.tagInput, { color: theme.colors.text }]}
            />
          </View>

          <Button
            label={isEdit ? 'Save changes' : 'Create task'}
            onPress={handleSubmit}
            loading={submitting}
            disabled={submitting}
            fullWidth
            style={styles.submit}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  formHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  back: { fontSize: 22 },
  formTitle: { ...typography.heading },
  save: { fontSize: typography.body.fontSize, fontWeight: '800' as const },
  scroll: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl },
  twoCol: { flexDirection: 'row', gap: spacing.md },
  col: { flex: 1 },
  rowLabel: {
    fontSize: typography.overline.fontSize,
    fontWeight: '800' as const,
    letterSpacing: typography.overline.letterSpacing,
    marginBottom: spacing.xs,
  },
  dateBox: {
    minHeight: 48,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    justifyContent: 'center',
  },
  errorText: { fontSize: typography.caption.fontSize, fontWeight: '600' as const, marginTop: spacing.xs },
  segments: { flexDirection: 'row', gap: spacing.sm },
  segment: {
    flex: 1,
    minHeight: 40,
    borderWidth: 1,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: spacing.sm },
  tagChip: { borderRadius: radius.sm, paddingHorizontal: spacing.sm, paddingVertical: 4 },
  tagInput: { minWidth: 80, paddingVertical: 4, fontSize: typography.body.fontSize },
  submit: { marginTop: spacing.xl },
});
