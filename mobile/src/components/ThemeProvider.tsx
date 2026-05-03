import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useMemo,
  useCallback,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';
import { useSegments } from 'expo-router';
import { ThemeMode, getTheme, themes } from '../lib/themes';

const STORAGE_KEY = 'bornblix-appearance';

export type AppearancePreference = 'system' | 'light' | 'dark';

interface ThemeContextType {
  mode: ThemeMode;
  theme: ReturnType<typeof getTheme>;
  routeMode: ThemeMode;
  appearance: AppearancePreference;
  setAppearance: (pref: AppearancePreference) => void;
  resolvedScheme: 'light' | 'dark';
}

const BornblixThemeContext = createContext<ThemeContextType | undefined>(undefined);

function routeModeFromSegments(segments: string[]): ThemeMode {
  const path = segments.join('/');
  if (path.includes('quest')) return 'quest';
  const onTodayTab =
    path.includes('today') ||
    path === '(tabs)' ||
    path === '(tabs)/index' ||
    path.endsWith('/(tabs)/index') ||
    segments[segments.length - 1] === 'index';
  if (onTodayTab) return 'journal';
  return 'sanctuary';
}

function effectiveThemeMode(routeMode: ThemeMode, scheme: 'light' | 'dark'): ThemeMode {
  if (routeMode === 'quest') return 'quest';
  if (routeMode === 'journal') return 'journal';
  return scheme === 'dark' ? 'sanctuary' : 'journal';
}

export function BornblixThemeProvider({ children }: { children: ReactNode }) {
  const segments = useSegments();
  const systemScheme = useColorScheme();
  const [appearance, setAppearanceState] = useState<AppearancePreference>('system');

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((stored) => {
      if (stored === 'light' || stored === 'dark' || stored === 'system') {
        setAppearanceState(stored);
      }
    });
  }, []);

  const setAppearance = useCallback((pref: AppearancePreference) => {
    setAppearanceState(pref);
    void AsyncStorage.setItem(STORAGE_KEY, pref);
  }, []);

  const resolvedScheme: 'light' | 'dark' =
    appearance === 'system' ? (systemScheme === 'dark' ? 'dark' : 'light') : appearance;

  const routeMode = useMemo(() => routeModeFromSegments(segments as string[]), [segments]);

  const mode = useMemo(
    () => effectiveThemeMode(routeMode, resolvedScheme),
    [routeMode, resolvedScheme],
  );

  const theme = useMemo(() => getTheme(mode), [mode]);

  const value = useMemo(
    () => ({
      mode,
      theme,
      routeMode,
      appearance,
      setAppearance,
      resolvedScheme,
    }),
    [mode, theme, routeMode, appearance, setAppearance, resolvedScheme],
  );

  return <BornblixThemeContext.Provider value={value}>{children}</BornblixThemeContext.Provider>;
}

export const useBornblixTheme = () => {
  const context = useContext(BornblixThemeContext);
  if (context === undefined) {
    return {
      mode: 'sanctuary' as ThemeMode,
      theme: themes.sanctuary,
      routeMode: 'sanctuary' as ThemeMode,
      appearance: 'system' as AppearancePreference,
      setAppearance: () => {},
      resolvedScheme: 'light' as const,
    };
  }
  return context;
};

export default BornblixThemeProvider;
