import React, { useRef } from 'react';
import { StyleSheet, Text, Vibration, View } from 'react-native';
// v3 dropped the top-level `Swipeable` export — it now lives at this subpath.
import Swipeable, { SwipeDirection, SwipeableMethods } from 'react-native-gesture-handler/ReanimatedSwipeable';
import { useTheme } from '../../../theme/ThemeProvider';
import { radius, spacing, typography } from '../../../theme/tokens';
import type { Task } from '../../../types/task.types';
import { TaskCard } from './TaskCard';

export interface SwipeableTaskRowProps {
  task: Task & { score?: number };
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onPress: (id: string) => void;
}

/**
 * Wraps TaskCard in gesture-handler's Swipeable. Swiping right reveals the
 * complete panel (renderLeftActions); swiping left reveals the delete panel
 * (renderRightActions). The action commits and the row auto-closes as soon
 * as a panel finishes opening.
 */
export function SwipeableTaskRow({ task, onToggle, onDelete, onPress }: SwipeableTaskRowProps) {
  const { theme } = useTheme();
  const ref = useRef<SwipeableMethods>(null);

  const handleOpen = (direction: SwipeDirection) => {
    Vibration.vibrate(10);
    if (direction === SwipeDirection.LEFT) {
      onToggle(task.id);
    } else {
      onDelete(task.id);
    }
    ref.current?.close();
  };

  return (
    <Swipeable
      ref={ref}
      friction={2}
      leftThreshold={72}
      rightThreshold={72}
      onSwipeableOpen={handleOpen}
      renderLeftActions={() => (
        <View style={[styles.actionPanel, { backgroundColor: theme.colors.success }]}>
          <Text style={[styles.actionGlyph, { color: theme.colors.onSuccess }]}>✓</Text>
        </View>
      )}
      renderRightActions={() => (
        <View
          style={[styles.actionPanel, styles.rightPanel, { backgroundColor: theme.colors.danger }]}
        >
          <Text style={[styles.actionGlyph, { color: theme.colors.onAccent }]}>🗑</Text>
        </View>
      )}
    >
      <TaskCard task={task} onToggle={onToggle} onPress={onPress} />
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  actionPanel: {
    width: 88,
    borderRadius: radius.lg,
    marginBottom: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightPanel: { alignSelf: 'flex-end' },
  actionGlyph: { fontSize: typography.title.fontSize },
});
