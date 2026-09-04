import React, { useEffect } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useTheme } from '../theme/ThemeProvider';
import { radius, spacing, typography } from '../theme/tokens';

export interface SnackbarProps {
  visible: boolean;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  onDismiss: () => void;
  bottom?: number;
}

const AUTO_DISMISS_MS = 4000;

/** Absolutely positioned above the tab bar. Auto-dismisses after 4s. */
export function Snackbar({ visible, message, actionLabel, onAction, onDismiss, bottom = 88 }: SnackbarProps) {
  const { theme } = useTheme();
  const translateY = useSharedValue(80);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      translateY.value = withSpring(0, { damping: 16 });
      opacity.value = withTiming(1, { duration: 180 });
      const timer = setTimeout(onDismiss, AUTO_DISMISS_MS);
      return () => clearTimeout(timer);
    }
    translateY.value = withSpring(80, { damping: 16 });
    opacity.value = withTiming(0, { duration: 150 });
    return undefined;
  }, [visible, onDismiss, translateY, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  if (!visible) return null;

  return (
    <Animated.View
      pointerEvents={visible ? 'box-none' : 'none'}
      style={[
        styles.container,
        { backgroundColor: theme.colors.primary, bottom },
        animatedStyle,
      ]}
    >
      <Text style={[styles.message, { color: theme.colors.onPrimary }]} numberOfLines={2}>
        {message}
      </Text>
      {actionLabel ? (
        <Pressable
          onPress={onAction}
          accessibilityRole="button"
          hitSlop={8}
          style={styles.action}
        >
          <Text style={[styles.actionLabel, { color: theme.colors.accent }]}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  message: { flex: 1, fontSize: typography.body.fontSize, fontWeight: '600' as const },
  action: { marginLeft: spacing.md },
  actionLabel: { fontSize: typography.label.fontSize, fontWeight: '800' as const },
});
