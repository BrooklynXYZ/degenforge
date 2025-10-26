import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '@/constants/designTokens';

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeColors {
  // Base colors
  background: string;
  surface: string;
  surfaceSecondary: string;
  surfaceElevated: string;

  // Text colors
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  textInverse: string;

  // Border colors
  border: string;
  borderSecondary: string;
  borderFocus: string;

  // Semantic colors (these remain the same in both themes)
  accent: string;
  success: string;
  warning: string;
  error: string;

  // Component-specific
  cardBg: string;
  cardBorder: string;
  inputBg: string;
  inputBorder: string;
}

interface ThemeContextType {
  themeMode: ThemeMode;
  actualTheme: 'light' | 'dark';
  colors: ThemeColors;
  setThemeMode: (mode: ThemeMode) => Promise<void>;
  isSystemTheme: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = '@degenforge_theme_mode';

// Light theme colors
const lightColors: ThemeColors = {
  background: Colors.base.white,
  surface: Colors.base.white,
  surfaceSecondary: Colors.neutral[50],
  surfaceElevated: Colors.base.white,

  textPrimary: Colors.base.black,
  textSecondary: Colors.neutral[600],
  textTertiary: Colors.neutral[400],
  textInverse: Colors.base.white,

  border: Colors.neutral[200],
  borderSecondary: Colors.neutral[100],
  borderFocus: Colors.base.black,

  accent: Colors.accent.primary,
  success: Colors.semantic.success,
  warning: Colors.semantic.warning,
  error: Colors.semantic.error,

  cardBg: Colors.base.white,
  cardBorder: Colors.neutral[200],
  inputBg: Colors.neutral[50],
  inputBorder: Colors.neutral[200],
};

// Dark theme colors
const darkColors: ThemeColors = {
  background: Colors.dark.background,
  surface: Colors.dark.surface,
  surfaceSecondary: Colors.dark.elevated,
  surfaceElevated: Colors.dark.elevated,

  textPrimary: Colors.dark.text.primary,
  textSecondary: Colors.dark.text.secondary,
  textTertiary: Colors.dark.text.tertiary,
  textInverse: Colors.base.black,

  border: Colors.dark.border,
  borderSecondary: Colors.neutral[800],
  borderFocus: Colors.accent.primary,

  accent: Colors.accent.primary,
  success: Colors.semantic.success,
  warning: Colors.semantic.warning,
  error: Colors.semantic.error,

  cardBg: Colors.dark.surface,
  cardBorder: Colors.dark.border,
  inputBg: Colors.dark.elevated,
  inputBorder: Colors.dark.border,
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>('system');
  const [isLoading, setIsLoading] = useState(true);

  // Load saved theme preference on mount
  useEffect(() => {
    loadThemePreference();
  }, []);

  const loadThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
        setThemeModeState(savedTheme as ThemeMode);
      }
    } catch (error) {
      console.error('Failed to load theme preference:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setThemeMode = async (mode: ThemeMode) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
      setThemeModeState(mode);
    } catch (error) {
      console.error('Failed to save theme preference:', error);
    }
  };

  // Determine the actual theme to use
  const actualTheme: 'light' | 'dark' =
    themeMode === 'system'
      ? (systemColorScheme === 'dark' ? 'dark' : 'light')
      : themeMode;

  const colors = actualTheme === 'dark' ? darkColors : lightColors;

  const value: ThemeContextType = {
    themeMode,
    actualTheme,
    colors,
    setThemeMode,
    isSystemTheme: themeMode === 'system',
  };

  // Don't render children until theme is loaded
  if (isLoading) {
    return null;
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
