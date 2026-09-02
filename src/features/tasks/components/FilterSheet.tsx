import React from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useTheme } from '../../../theme/ThemeProvider';
import { radius, spacing, typography } from '../../../theme/tokens';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { setPriority, setSearch, setStatus, clearFilters } from '../uiSlice';
import { PRIORITIES, TASK_STATUSES, type Priority, type TaskStatus } from '../../../types/task.types';
import { Button } from '../../../components/Button';

export interface FilterSheetProps {
  visible: boolean;
  onClose: () => void;
}

/** Status / priority / search filters. Sort lives in SortChips, not here. */
export function FilterSheet({ visible, onClose }: FilterSheetProps) {
  const { theme } = useTheme();
  const dispatch = useAppDispatch();
  const ui = useAppSelector(s => s.ui);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={[styles.backdrop, { backgroundColor: theme.colors.overlay }]} onPress={onClose} />
      <View style={[styles.sheet, { backgroundColor: theme.colors.bg, borderColor: theme.colors.border }]}>
        <ScrollView>
          <Text style={[styles.heading, { color: theme.colors.text }]}>Filter tasks</Text>

          <TextInput
            value={ui.search}
            onChangeText={v => dispatch(setSearch(v))}
            placeholder="Search title or description"
            placeholderTextColor={theme.colors.textFaint}
            style={[
              styles.search,
              { borderColor: theme.colors.border, color: theme.colors.text, backgroundColor: theme.colors.surface },
            ]}
          />

          <Text style={[styles.label, { color: theme.colors.textMuted }]}>Status</Text>
          <View style={styles.chipRow}>
            {TASK_STATUSES.map((status: TaskStatus) => {
              const on = ui.status === status;
              return (
                <Pressable
                  key={status}
                  onPress={() => dispatch(setStatus(status))}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: on ? theme.colors.primary : theme.colors.surface,
                      borderColor: on ? theme.colors.primary : theme.colors.border,
                    },
                  ]}
                >
                  <Text style={{ color: on ? theme.colors.onPrimary : theme.colors.textMuted, fontWeight: '700' }}>
                    {status}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={[styles.label, { color: theme.colors.textMuted }]}>Priority</Text>
          <View style={styles.chipRow}>
            {PRIORITIES.map((p: Priority) => {
              const on = ui.priority === p;
              return (
                <Pressable
                  key={p}
                  onPress={() => dispatch(setPriority(on ? null : p))}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: on ? theme.colors.priority[p] : theme.colors.surface,
                      borderColor: on ? theme.colors.priority[p] : theme.colors.border,
                    },
                  ]}
                >
                  <Text style={{ color: on ? '#FFFFFF' : theme.colors.textMuted, fontWeight: '700' }}>{p}</Text>
                </Pressable>
              );
            })}
          </View>

          <Button
            label="Clear filters"
            variant="ghost"
            fullWidth
            onPress={() => dispatch(clearFilters())}
            style={styles.clearButton}
          />
          <Button label="Done" fullWidth onPress={onClose} />
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { ...StyleSheet.absoluteFillObject },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    maxHeight: '75%',
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    borderWidth: 1,
    padding: spacing.lg,
  },
  heading: { ...typography.title, marginBottom: spacing.md },
  search: {
    minHeight: 48,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
    fontSize: typography.body.fontSize,
  },
  label: { ...typography.overline, marginBottom: spacing.sm, textTransform: 'uppercase' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.lg },
  chip: {
    borderRadius: radius.pill,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
  },
  clearButton: { marginBottom: spacing.sm },
});
