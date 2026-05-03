import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useSegments } from 'expo-router';
import { ThemeMode, getTheme, themes } from '../lib/themes';

interface ThemeContextType {
  mode: ThemeMode;
  theme: ReturnType<typeof getTheme>;
  setMode: (mode: ThemeMode) => void;
}

const BornblixThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function BornblixThemeProvider({ children }: { children: ReactNode }) {
  const segments = useSegments();
  const [mode, setMode] = useState<ThemeMode>('sanctuary');

  // Auto-detect mode based on route for contextual theming
  useEffect(() => {
    const currentPath = segments.join('/');
    if (currentPath.includes('today') || currentPath.includes('journal')) {
      setMode('journal');
    } else if (currentPath.includes('quest')) {
      setMode('quest');
    } else if (currentPath.includes('bible') || currentPath.includes('chat') || currentPath.includes('home')) {
      setMode('sanctuary');
    }
    // Default to sanctuary for auth/splash
  }, [segments]);

  const theme = getTheme(mode);

  return (
    <BornblixThemeContext.Provider value={{ mode, theme, setMode }}>
      {children}
    </BornblixThemeContext.Provider>
  );
}

export const useBornblixTheme = () => {
  const context = useContext(BornblixThemeContext);
  if (context === undefined) {
    // Fallback for when used outside provider (e.g. during initial render)
    return { mode: 'sanctuary' as ThemeMode, theme: themes.sanctuary, setMode: () => {} };
  }
  return context;
};

export default BornblixThemeProvider;
