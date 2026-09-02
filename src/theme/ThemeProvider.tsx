import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Theme, lightTheme, darkTheme } from './tokens';

type Mode = 'light' | 'dark' | 'system';
const STORAGE_KEY = '@tasky/theme';

interface ThemeContextValue { theme: Theme; mode: Mode; setMode: (m: Mode) => void }
const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const system = useColorScheme();
  const [mode, setModeState] = useState<Mode>('light');

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then(v => { if (v === 'light' || v === 'dark' || v === 'system') setModeState(v); })
      .catch(() => { /* first launch, or storage unavailable — keep the default */ });
  }, []);

  const setMode = (m: Mode) => {
    setModeState(m);
    AsyncStorage.setItem(STORAGE_KEY, m).catch(() => {});
  };

  const theme = useMemo(() => {
    const resolved = mode === 'system' ? (system ?? 'light') : mode;
    return resolved === 'dark' ? darkTheme : lightTheme;
  }, [mode, system]);

  return (
    <ThemeContext.Provider value={{ theme, mode, setMode }}>{children}</ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside <ThemeProvider>');
  return ctx;
}
