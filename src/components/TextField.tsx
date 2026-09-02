import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { radius, spacing, typography } from '../theme/tokens';

export interface TextFieldProps extends TextInputProps {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  error?: string | null;
  /** Optional trailing accessory, e.g. the password eye toggle on Login/Register. */
  rightElement?: React.ReactNode;
}

/**
 * Label in typography.overline above the input. Border turns danger when
 * `error` is set (message below in typography.caption); focus raises the
 * border to accent.
 */
export function TextField({
  label,
  value,
  onChangeText,
  error,
  rightElement,
  style,
  ...rest
}: TextFieldProps) {
  const { theme } = useTheme();
  const [focused, setFocused] = useState(false);

  const borderColor = error
    ? theme.colors.danger
    : focused
      ? theme.colors.accent
      : theme.colors.border;

  return (
    <View style={styles.wrap}>
      <Text style={[styles.label, { color: theme.colors.textMuted }]}>{label}</Text>
      <View style={styles.inputRow}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholderTextColor={theme.colors.textFaint}
          style={[
            styles.input,
            {
              borderColor,
              color: theme.colors.text,
              backgroundColor: theme.colors.surface,
            },
            rest.multiline && styles.multiline,
            rightElement ? styles.inputWithAccessory : null,
            style,
          ]}
          {...rest}
        />
        {rightElement ? <View style={styles.accessory}>{rightElement}</View> : null}
      </View>
      {error ? (
        <Text style={[styles.error, { color: theme.colors.danger }]}>{error}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: spacing.md },
  label: {
    fontSize: typography.overline.fontSize,
    fontWeight: '800' as const,
    letterSpacing: typography.overline.letterSpacing,
    textTransform: 'uppercase',
    marginBottom: spacing.xs,
  },
  inputRow: { position: 'relative', justifyContent: 'center' },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    fontSize: typography.body.fontSize,
  },
  inputWithAccessory: { paddingRight: spacing.xl + spacing.md },
  accessory: { position: 'absolute', right: spacing.sm },
  multiline: {
    minHeight: 72,
    textAlignVertical: 'top',
    paddingTop: spacing.sm,
  },
  error: {
    fontSize: typography.caption.fontSize,
    fontWeight: '600' as const,
    marginTop: spacing.xs,
  },
});
