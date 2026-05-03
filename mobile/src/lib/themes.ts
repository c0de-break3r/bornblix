/**
 * Bornblix Design System - The Trinity of Modes
 * 
 * 1. SANCTUARY (Dark) - Home & Bible: Deep, spiritual, glassmorphism
 * 2. JOURNAL (Light) - Today & Prayer: Warm, inviting, soft shadows
 * 3. QUEST (Gamified) - Adventure Map: Vibrant gradients, RPG feel
 * 
 * Shared tokens from prompt:
 * --bornblix-orange: #F97316
 * --bornblix-gold: #F0C060
 * --bornblix-indigo: #6C63FF
 * --bornblix-cream: #FFFDF5
 * --bornblix-dark: #0D0D14
 * --bornblix-amber: #F59E0B
 */

export type ThemeMode = 'sanctuary' | 'journal' | 'quest';

export interface BornblixTheme {
  mode: ThemeMode;
  colors: {
    background: string;
    foreground: string;
    card: string;
    cardForeground: string;
    primary: string;
    primaryForeground: string;
    secondary: string;
    accent: string;
    gold: string;
    indigo: string;
    border: string;
    muted: string;
    text: string;
    success: string;
    warning: string;
  };
  fonts: {
    heading: string; // Playfair Display for verses/hero
    body: string; // DM Sans or Nunito
    rounded: string;
  };
  radius: {
    sm: number;
    md: number;
    lg: number;
    xl: number;
    full: number;
  };
  glassmorphism: {
    background: string;
    border: string;
    blur: number;
  };
}

// Core design tokens
export const designTokens = {
  colors: {
    orange: '#F97316',
    gold: '#F0C060',
    indigo: '#6C63FF',
    cream: '#FFFDF5',
    dark: '#0D0D14',
    amber: '#F59E0B',
    coral: '#FF6B6B',
    charcoal: '#0D0D14',
    violet: '#4F46E5',
  },
  radius: {
    xl: 24,
    full: 9999,
  },
} as const;

// Theme definitions
export const themes: Record<ThemeMode, BornblixTheme> = {
  sanctuary: {
    mode: 'sanctuary',
    colors: {
      background: '#0D0D14',
      foreground: '#F0F0F5',
      card: 'rgba(255,255,255,0.05)',
      cardForeground: '#FFFFFF',
      primary: '#6C63FF',
      primaryForeground: '#FFFFFF',
      secondary: '#1A1A2E',
      accent: '#F0C060',
      gold: '#F0C060',
      indigo: '#6C63FF',
      border: 'rgba(255,255,255,0.1)',
      muted: 'rgba(255,255,255,0.6)',
      text: '#E0E0FF',
      success: '#22C55E',
      warning: '#F59E0B',
    },
    fonts: {
      heading: 'PlayfairDisplay_700Bold',
      body: 'DMSans_400Regular',
      rounded: 'Nunito_600SemiBold',
    },
    radius: {
      sm: 8,
      md: 16,
      lg: 20,
      xl: 24,
      full: 9999,
    },
    glassmorphism: {
      background: 'rgba(13, 13, 20, 0.8)',
      border: 'rgba(255, 255, 255, 0.1)',
      blur: 20,
    },
  },
  journal: {
    mode: 'journal',
    colors: {
      background: '#FFFDF5',
      foreground: '#2C2520',
      card: '#FFFFFF',
      cardForeground: '#2C2520',
      primary: '#F59E0B',
      primaryForeground: '#FFFFFF',
      secondary: '#F5EDE0',
      accent: '#FF6B6B',
      gold: '#F0C060',
      indigo: '#6C63FF',
      border: 'rgba(180,120,40,0.1)',
      muted: '#8B7D6B',
      text: '#3F2E1E',
      success: '#22C55E',
      warning: '#F59E0B',
    },
    fonts: {
      heading: 'Nunito_700Bold',
      body: 'Nunito_400Regular',
      rounded: 'Nunito_600SemiBold',
    },
    radius: {
      sm: 12,
      md: 16,
      lg: 24,
      xl: 24,
      full: 9999,
    },
    glassmorphism: {
      background: 'rgba(255, 253, 245, 0.9)',
      border: 'rgba(245, 158, 11, 0.2)',
      blur: 12,
    },
  },
  quest: {
    mode: 'quest',
    colors: {
      background: '#0EA5E9', // sky blue start
      foreground: '#166534', // grass green
      card: 'rgba(255,255,255,0.95)',
      cardForeground: '#166534',
      primary: '#F97316',
      primaryForeground: '#FFFFFF',
      secondary: '#4ADE80',
      accent: '#F0C060',
      gold: '#F0C060',
      indigo: '#6C63FF',
      border: '#166534',
      muted: '#4B7C4B',
      text: '#052E16',
      success: '#22C55E',
      warning: '#F59E0B',
    },
    fonts: {
      heading: 'PlayfairDisplay_700Bold',
      body: 'DMSans_400Regular',
      rounded: 'Nunito_700Bold',
    },
    radius: {
      sm: 8,
      md: 16,
      lg: 20,
      xl: 24,
      full: 9999,
    },
    glassmorphism: {
      background: 'rgba(14, 165, 233, 0.7)',
      border: 'rgba(234, 179, 8, 0.3)',
      blur: 16,
    },
  },
};

export const getTheme = (mode: ThemeMode = 'sanctuary'): BornblixTheme => {
  return themes[mode];
};

/** Use `useBornblixTheme` from `@/src/components/ThemeProvider` in UI code. */

// Utility for Tailwind class mapping (for NativeWind)
export const themeClasses = {
  // Common classes that map to tokens
  container: 'flex-1',
  card: 'rounded-3xl shadow-xl',
  button: 'rounded-full px-8 py-4 font-semibold',
  // Mode specific can be prefixed in components like 'sanctuary:bg-[#0D0D14]'
} as const;

export default themes;
