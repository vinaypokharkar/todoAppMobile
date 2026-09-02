import React from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { getAuth, signOut } from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { useTheme } from '../../../theme/ThemeProvider';
import { radius, spacing, typography } from '../../../theme/tokens';
import { Screen } from '../../../components/Screen';
import { Card } from '../../../components/Card';
import { Button } from '../../../components/Button';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { baseApi } from '../../../api/baseApi';
import { useGetStatsQuery } from '../../../api/tasksApi';

const MODES: { value: 'light' | 'dark' | 'system'; label: string }[] = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'System' },
];

export default function ProfileScreen() {
  const { theme, mode, setMode } = useTheme();
  const dispatch = useAppDispatch();
  const user = useAppSelector(s => s.auth.user);
  const { data: stats } = useGetStatsQuery();

  const initial = (user?.displayName?.[0] ?? user?.email?.[0] ?? '?').toUpperCase();

  const handleSignOut = async () => {
    const firebaseUser = getAuth().currentUser;
    const usedGoogle = firebaseUser?.providerData.some(p => p.providerId === 'google.com');

    await signOut(getAuth());
    if (usedGoogle) {
      try {
        await GoogleSignin.signOut();
      } catch {
        // best-effort — the Firebase sign-out already ended the session
      }
    }
    // REQUIRED: without this, the next user who signs in on this device
    // sees the previous user's cached task list.
    dispatch(baseApi.util.resetApiState());
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          {user?.photoURL ? (
            <Image source={{ uri: user.photoURL }} style={styles.avatarImg} />
          ) : (
            <View style={[styles.avatar, { backgroundColor: theme.colors.primary }]}>
              <Text style={[styles.avatarText, { color: theme.colors.onPrimary }]}>{initial}</Text>
            </View>
          )}
          <Text style={[styles.name, { color: theme.colors.text }]}>
            {user?.displayName || 'Tasky user'}
          </Text>
          <Text style={[styles.email, { color: theme.colors.textMuted }]}>{user?.email}</Text>
        </View>

        <View style={styles.statsRow}>
          <Card style={styles.statCard}>
            <Text style={[styles.statValue, { color: theme.colors.accent }]}>{stats?.total ?? 0}</Text>
            <Text style={[styles.statLabel, { color: theme.colors.textMuted }]}>Total</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={[styles.statValue, { color: theme.colors.accent }]}>
              {stats ? Math.round(stats.completionRate * 100) : 0}%
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.textMuted }]}>Completed</Text>
          </Card>
        </View>

        <Text style={[styles.sectionLabel, { color: theme.colors.textMuted }]}>THEME</Text>
        <View style={styles.themeRow}>
          {MODES.map(m => {
            const on = mode === m.value;
            return (
              <Pressable
                key={m.value}
                onPress={() => setMode(m.value)}
                style={[
                  styles.themeChip,
                  { backgroundColor: on ? theme.colors.primary : theme.colors.surface, borderColor: theme.colors.border },
                ]}
              >
                <Text style={{ color: on ? theme.colors.onPrimary : theme.colors.textMuted, fontWeight: '700' }}>
                  {m.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Button label="Sign out" variant="ghost" onPress={handleSignOut} fullWidth style={styles.signOut} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: spacing.lg, paddingBottom: spacing.xxl },
  header: { alignItems: 'center', marginBottom: spacing.xl },
  avatar: { width: 72, height: 72, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  avatarImg: { width: 72, height: 72, borderRadius: radius.pill },
  avatarText: { fontSize: typography.title.fontSize, fontWeight: '800' as const },
  name: { ...typography.title, marginTop: spacing.md },
  email: { ...typography.body, marginTop: 2 },
  statsRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.xl },
  statCard: { flex: 1, alignItems: 'center' },
  statValue: { ...typography.title, fontWeight: '800' as const },
  statLabel: { ...typography.caption, marginTop: 2 },
  sectionLabel: {
    fontSize: typography.overline.fontSize,
    fontWeight: '800' as const,
    letterSpacing: typography.overline.letterSpacing,
    marginBottom: spacing.sm,
  },
  themeRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.xxl },
  themeChip: {
    flex: 1,
    minHeight: 44,
    borderWidth: 1,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signOut: { marginTop: spacing.md },
});
