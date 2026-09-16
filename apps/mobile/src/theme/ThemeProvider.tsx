import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Appearance, ImageStyle, Platform, StyleSheet, TextStyle, ViewStyle } from 'react-native';
import { Theme, ThemeMode, themes } from './palettes';

const STORAGE_KEY = 'onegridai-theme';

type Preference = ThemeMode | 'system';

interface ThemeContextValue extends Theme {
  /** What the user picked — `system` follows the OS setting. */
  preference: Preference;
  setPreference: (p: Preference) => void;
  /** Flip straight between light and dark, pinning the choice. */
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function readStoredPreference(): Preference {
  if (Platform.OS !== 'web') return 'system';
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored === 'light' || stored === 'dark' || stored === 'system' ? stored : 'system';
  } catch {
    return 'system';
  }
}

function persistPreference(preference: Preference): void {
  if (Platform.OS !== 'web') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, preference);
  } catch {
    /* private mode / blocked storage — the in-memory choice still applies */
  }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [preference, setPreferenceState] = useState<Preference>(readStoredPreference);
  const [systemMode, setSystemMode] = useState<ThemeMode>(() => (Appearance.getColorScheme() === 'light' ? 'light' : 'dark'));

  useEffect(() => {
    const sub = Appearance.addChangeListener(({ colorScheme }) => setSystemMode(colorScheme === 'light' ? 'light' : 'dark'));
    return () => sub.remove();
  }, []);

  const setPreference = useCallback((next: Preference) => {
    setPreferenceState(next);
    persistPreference(next);
  }, []);

  const mode: ThemeMode = preference === 'system' ? systemMode : preference;

  const toggle = useCallback(() => setPreference(mode === 'dark' ? 'light' : 'dark'), [mode, setPreference]);

  const value = useMemo<ThemeContextValue>(
    () => ({ ...themes[mode], preference, setPreference, toggle }),
    [mode, preference, setPreference, toggle]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside <ThemeProvider>.');
  return ctx;
}

type NamedStyles<T> = { [P in keyof T]: ViewStyle | TextStyle | ImageStyle };

/**
 * Build a StyleSheet from the active theme, recomputed only when the theme
 * changes.
 *
 * Declare the factory at module scope (never inline in the component body) so
 * its identity is stable and the memo actually holds:
 *
 *   const useStyles = makeStyles((t) => ({ root: { backgroundColor: t.colors.page } }));
 *   function Screen() { const styles = useStyles(); }
 */
export function makeStyles<T extends NamedStyles<T> | NamedStyles<unknown>>(factory: (theme: Theme) => T & NamedStyles<T>) {
  const cache = new WeakMap<Theme, T>();
  return function useStyles(): T {
    const theme = useTheme();
    return useMemo(() => {
      const cached = cache.get(theme);
      if (cached) return cached;
      const created = StyleSheet.create(factory(theme));
      cache.set(theme, created);
      return created;
    }, [theme]);
  };
}
