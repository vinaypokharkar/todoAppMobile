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
import { useSSO } from '@clerk/expo';
import { useSignIn } from '@clerk/expo/legacy';
import * as Linking from 'expo-linking';
import { useTheme } from '../../../theme/ThemeProvider';
import { radius, spacing, typography } from '../../../theme/tokens';
import { Screen } from '../../../components/Screen';
import { TextField } from '../../../components/TextField';
import { Button } from '../../../components/Button';
import { friendlyAuthError } from '../clerkErrors';
import { isValidEmail } from '../../../utils/validation';
import type { AuthStackParamList } from '../../../navigation/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const { signIn, setActive, isLoaded } = useSignIn();
  const { startSSOFlow } = useSSO();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [banner, setBanner] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const validate = (): boolean => {
    let ok = true;
    if (!isValidEmail(email)) {
      setEmailError('That email address doesn’t look right.');
      ok = false;
    } else {
      setEmailError(null);
    }
    if (password.length < 1) {
      setPasswordError('Enter your password.');
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
      const attempt = await signIn.create({ identifier: email.trim(), password });
      if (attempt.status === 'complete') {
        await setActive({ session: attempt.createdSessionId });
        // useAuthListener swaps the navigator — nothing to do here.
      } else {
        setBanner('Additional verification is required for this account.');
      }
    } catch (error) {
      setBanner(friendlyAuthError(error));
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogle = async () => {
    if (submitting) return;
    setBanner(null);
    setSubmitting(true);
    try {
      const { createdSessionId, setActive: setActiveSSO } = await startSSOFlow({
        strategy: 'oauth_google',
        redirectUrl: Linking.createURL('/oauth-native-callback'),
      });
      if (createdSessionId && setActiveSSO) {
        await setActiveSSO({ session: createdSessionId });
      }
      // else: user cancelled the browser flow — nothing to do.
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
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          <Image source={require('../../../assets/logo.png')} style={styles.brandmark} resizeMode="contain" />

          <Text style={[styles.heading, { color: theme.colors.text }]}>Welcome back</Text>
          <Text style={[styles.sub, { color: theme.colors.textMuted }]}>
            Sign in to pick up where you left off.
          </Text>

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

          {banner ? (
            <View style={[styles.banner, { backgroundColor: theme.colors.dangerSoft }]}>
              <Text style={[styles.bannerText, { color: theme.colors.danger }]}>{banner}</Text>
            </View>
          ) : null}

          <Button
            label="Sign in"
            onPress={handleSubmit}
            loading={submitting}
            disabled={submitting}
            fullWidth
            style={styles.submit}
          />

          <View style={styles.dividerRow}>
            <View style={[styles.dividerLine, { backgroundColor: theme.colors.border }]} />
            <Text style={[styles.dividerText, { color: theme.colors.textFaint }]}>or</Text>
            <View style={[styles.dividerLine, { backgroundColor: theme.colors.border }]} />
          </View>

          <Pressable
            onPress={handleGoogle}
            disabled={submitting}
            accessibilityRole="button"
            style={[
              styles.googleButton,
              { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, opacity: submitting ? 0.6 : 1 },
            ]}
          >
            <View style={[styles.gmark, { borderColor: theme.colors.border }]}>
              <Text style={{ color: theme.colors.text, fontWeight: '700' }}>G</Text>
            </View>
            <Text style={[styles.googleLabel, { color: theme.colors.text }]}>Continue with Google</Text>
          </Pressable>

          <Pressable onPress={() => navigation.navigate('Register')} style={styles.footer}>
            <Text style={{ color: theme.colors.textMuted }}>
              New here? <Text style={{ color: theme.colors.accent, fontWeight: '700' }}>Create an account</Text>
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
  banner: { borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.md },
  bannerText: { fontSize: typography.body.fontSize, fontWeight: '600' as const },
  submit: { marginTop: spacing.sm },
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginVertical: spacing.lg, gap: spacing.sm },
  dividerLine: { flex: 1, height: 1 },
  dividerText: { fontSize: typography.caption.fontSize, fontWeight: '700' as const },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    borderWidth: 1,
    borderRadius: radius.md,
    gap: spacing.sm,
  },
  gmark: {
    width: 22,
    height: 22,
    borderRadius: radius.pill,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleLabel: { fontSize: typography.body.fontSize, fontWeight: '700' as const },
  footer: { alignItems: 'center', marginTop: spacing.xl },
});
