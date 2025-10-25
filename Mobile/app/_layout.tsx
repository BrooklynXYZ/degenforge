import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { Provider as PaperProvider, MD3LightTheme, MD3DarkTheme } from 'react-native-paper';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import {
  SpaceGrotesk_300Light,
  SpaceGrotesk_400Regular,
  SpaceGrotesk_500Medium,
  SpaceGrotesk_600SemiBold,
  SpaceGrotesk_700Bold
} from '@expo-google-fonts/space-grotesk';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import * as SplashScreen from 'expo-splash-screen';
import React from 'react';
import 'react-native-reanimated';

import { AppNavigator } from '@/navigation/AppNavigator';
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    SpaceGrotesk_300Light,
    SpaceGrotesk_400Regular,
    SpaceGrotesk_500Medium,
    SpaceGrotesk_600SemiBold,
    SpaceGrotesk_700Bold,
    ...Feather.font,
  });

  React.useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <ThemedApp />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

function ThemedApp() {
  const { actualTheme, colors } = useTheme();

  return (
    <NavigationThemeProvider value={actualTheme === 'dark' ? DarkTheme : DefaultTheme}>
      <ThemedPaperProvider>
        <AppNavigator />
        <StatusBar style={actualTheme === 'dark' ? 'light' : 'dark'} />
      </ThemedPaperProvider>
    </NavigationThemeProvider>
  );
}

function ThemedPaperProvider({ children }: { children: React.ReactNode }) {
  const { actualTheme, colors } = useTheme();
  const base = actualTheme === 'dark' ? MD3DarkTheme : MD3LightTheme;

  const theme = {
    ...base,
    colors: {
      ...base.colors,
      primary: colors.accent,
      background: colors.background,
      surface: colors.surface,
      onSurface: colors.textPrimary,
      outline: colors.border,
    },
    fonts: {
      ...base.fonts,
    },
  } as typeof base;

  return <PaperProvider theme={theme}>{children}</PaperProvider>;
}
