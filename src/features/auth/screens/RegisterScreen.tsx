import React, { useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSignUp } from '@clerk/expo/legacy';
import { useTheme } from '../../../theme/ThemeProvider';
import { radius, spacing, typography } from '../../../theme/tokens';
import { Screen } from '../../../components/Screen';
import { TextField } from '../../../components/TextField';
import { Button } from '../../../components/Button';
import { friendlyAuthError } from '../clerkErrors';
import { isValidEmail, passwordStrength } from '../../../utils/validation';
import type { AuthStackParamList } from '../../../navigation/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

export default function RegisterScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const { signUp, setActive, isLoaded } = useSignUp();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [banner, setBanner] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Clerk requires an emailed code before a password account is activated.
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState('');
  const [codeError, setCodeError] = useState<string | null>(null);

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
    if (submitting || !isLoaded) return;
    setBanner(null);
    if (!validate()) return;

    setSubmitting(true);
    try {
      const [firstName, ...rest] = name.trim().split(/\s+/).filter(Boolean);
      await signUp.create({
        emailAddress: email.trim(),
        password,
        ...(firstName ? { firstName, lastName: rest.join(' ') || undefined } : {}),
      });
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      setPendingVerification(true);
    } catch (error) {
      setBanner(friendlyAuthError(error));
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerify = async () => {
    if (submitting || !isLoaded) return;
    setCodeError(null);
    if (!code.trim()) {
      setCodeError('Enter the code we emailed you.');
      return;
    }

    setSubmitting(true);
    try {
      const attempt = await signUp.attemptEmailAddressVerification({ code: code.trim() });
      if (attempt.status === 'complete') {
        await setActive({ session: attempt.createdSessionId });
        // useAuthListener swaps the navigator — nothing to do here.
      } else {
        setCodeError('That code didn’t work. Check it and try again.');
      }
    } catch (error) {
      setCodeError(friendlyAuthError(error));
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
          <Image source={require('../../../assets/logo.png')} style={styles.brandmark} resizeMode="contain" />

          {pendingVerification ? (
            <>
              <Text style={[styles.heading, { color: theme.colors.text }]}>Check your email</Text>
              <Text style={[styles.sub, { color: theme.colors.textMuted }]}>
                Enter the code we sent to {email.trim()}.
              </Text>

              <TextField
                label="Verification code"
                value={code}
                onChangeText={setCode}
                error={codeError}
                keyboardType="number-pad"
                autoCapitalize="none"
              />

              <Button
                label="Verify"
                onPress={handleVerify}
                loading={submitting}
                disabled={submitting}
                fullWidth
                style={styles.submit}
              />
            </>
          ) : (
            <>
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
            </>
          )}

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
    width: 64,
    height: 64,
    marginBottom: spacing.lg,
  },
  heading: { ...typography.display, marginBottom: spacing.xs },
  sub: { ...typography.body, marginBottom: spacing.xl },
  strengthRow: { flexDirection: 'row', gap: spacing.xs, marginTop: -spacing.sm, marginBottom: spacing.md },
  strengthBar: { flex: 1, height: 4, borderRadius: radius.sm },
  banner: { borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.md },
  bannerText: { fontSize: typography.body.fontSize, fontWeight: '600' as const },
  submit: { marginTop: spacing.sm },
  footer: { alignItems: 'center', marginTop: spacing.xl },
});
