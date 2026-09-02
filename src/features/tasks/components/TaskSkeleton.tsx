import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useTheme } from '../../../theme/ThemeProvider';
import { radius, spacing } from '../../../theme/tokens';

function ShimmerBlock({ style }: { style: object }) {
  const { theme } = useTheme();
  const opacity = useSharedValue(0.4);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(1, { duration: 700, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      style={[{ backgroundColor: theme.colors.borderSoft, borderRadius: radius.sm }, style, animatedStyle]}
    />
  );
}

/** A single shimmering placeholder card. Render 5 in a loading list. */
export function TaskSkeleton() {
  const { theme } = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.borderSoft }]}>
      <View style={styles.row}>
        <ShimmerBlock style={styles.checkbox} />
        <View style={styles.content}>
          <ShimmerBlock style={styles.titleLine} />
          <ShimmerBlock style={styles.metaLine} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  row: { flexDirection: 'row', alignItems: 'flex-start' },
  checkbox: { width: 17, height: 17, marginRight: spacing.sm, marginTop: 3 },
  content: { flex: 1, gap: spacing.sm },
  titleLine: { height: 16, width: '70%' },
  metaLine: { height: 12, width: '45%' },
});
