import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
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

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AppNavigator } from '@/navigation/AppNavigator';
import { ModernThemeProvider, useModernTheme } from '@/components/providers/ModernThemeProvider';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
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
      <ModernThemeProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <ThemedPaperProvider>
            <AppNavigator />
            <StatusBar style="auto" />
          </ThemedPaperProvider>
        </ThemeProvider>
      </ModernThemeProvider>
    </SafeAreaProvider>
  );
}

function ThemedPaperProvider({ children }: { children: React.ReactNode }) {
  const colorScheme = useColorScheme();
  const base = colorScheme === 'dark' ? MD3DarkTheme : MD3LightTheme;
  const { colors } = useModernTheme();

  const theme = {
    ...base,
    colors: {
      ...base.colors,
      primary: '#EAC119',
      background: colors.light.background,
      surface: colors.light.surface,
      onSurface: colors.light.onSurface,
      outline: colors.neutral[200],
    },
    fonts: {
      ...base.fonts,
    },
  } as typeof base;

  return <PaperProvider theme={theme}>{children}</PaperProvider>;
}
