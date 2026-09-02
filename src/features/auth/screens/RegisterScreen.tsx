import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { getAuth, createUserWithEmailAndPassword, updateProfile } from '@react-native-firebase/auth';
import { useTheme } from '../../../theme/ThemeProvider';
import { radius, spacing, typography } from '../../../theme/tokens';
import { Screen } from '../../../components/Screen';
import { TextField } from '../../../components/TextField';
import { Button } from '../../../components/Button';
import { friendlyAuthError } from '../firebaseErrors';
import { isValidEmail, passwordStrength } from '../../../utils/validation';
import type { AuthStackParamList } from '../../../navigation/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

export default function RegisterScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [banner, setBanner] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const strength = passwordStrength(password);

  const validate = (): boolean => {
    let ok = true;
    if (!isValidEmail(email)) {
      setEmailError('That email address doesn’t look right.');
      ok = false;
    } else {
      setEmailError(null);
    }
    if (password.length < 8) {
      setPasswordError('Use at least 8 characters.');
      ok = false;
    } else {
      setPasswordError(null);
    }
    return ok;
  };

  const handleSubmit = async () => {
    if (submitting) return;
    setBanner(null);
    if (!validate()) return;

    setSubmitting(true);
    try {
      const cred = await createUserWithEmailAndPassword(getAuth(), email.trim(), password);
      if (name.trim()) {
        await updateProfile(cred.user, { displayName: name.trim() });
      }
      // onAuthStateChanged swaps the navigator — nothing to do here.
    } catch (error) {
      setBanner(friendlyAuthError(error));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'android' ? 'height' : 'padding'}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={[styles.brandmark, { backgroundColor: theme.colors.primary }]}>
            <Text style={[styles.brandmarkText, { color: theme.colors.onPrimary }]}>T</Text>
          </View>

          <Text style={[styles.heading, { color: theme.colors.text }]}>Create account</Text>
          <Text style={[styles.sub, { color: theme.colors.textMuted }]}>
            Takes about ten seconds.
          </Text>

          <TextField label="Name" value={name} onChangeText={setName} autoCapitalize="words" />

          <TextField
            label="Email"
            value={email}
            onChangeText={setEmail}
            error={emailError}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />

          <TextField
            label="Password"
            value={password}
            onChangeText={setPassword}
            error={passwordError}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            rightElement={
              <Pressable onPress={() => setShowPassword(v => !v)} hitSlop={8}>
                <Text style={{ color: theme.colors.textFaint }}>{showPassword ? '🙈' : '👁'}</Text>
              </Pressable>
            }
          />

          <View style={styles.strengthRow}>
            {[0, 1, 2, 3].map(i => (
              <View
                key={i}
                style={[
                  styles.strengthBar,
                  { backgroundColor: i < strength ? theme.colors.success : theme.colors.border },
                ]}
              />
            ))}
          </View>

          {banner ? (
            <View style={[styles.banner, { backgroundColor: theme.colors.dangerSoft }]}>
              <Text style={[styles.bannerText, { color: theme.colors.danger }]}>{banner}</Text>
            </View>
          ) : null}

          <Button
            label="Create account"
            onPress={handleSubmit}
            loading={submitting}
            disabled={submitting}
            fullWidth
            style={styles.submit}
          />

          <Pressable onPress={() => navigation.navigate('Login')} style={styles.footer}>
            <Text style={{ color: theme.colors.textMuted }}>
              Already registered? <Text style={{ color: theme.colors.accent, fontWeight: '700' }}>Sign in</Text>
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: spacing.lg, paddingVertical: spacing.xxl },
  brandmark: {
    width: 52,
    height: 52,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  brandmarkText: { fontSize: typography.title.fontSize, fontWeight: '800' as const },
  heading: { ...typography.display, marginBottom: spacing.xs },
  sub: { ...typography.body, marginBottom: spacing.xl },
  strengthRow: { flexDirection: 'row', gap: spacing.xs, marginTop: -spacing.sm, marginBottom: spacing.md },
  strengthBar: { flex: 1, height: 4, borderRadius: radius.sm },
  banner: { borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.md },
  bannerText: { fontSize: typography.body.fontSize, fontWeight: '600' as const },
  submit: { marginTop: spacing.sm },
  footer: { alignItems: 'center', marginTop: spacing.xl },
});
