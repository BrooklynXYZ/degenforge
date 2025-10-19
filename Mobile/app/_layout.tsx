import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AppNavigator } from '@/navigation/AppNavigator';
import { ModernThemeProvider } from '@/components/providers/ModernThemeProvider';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ModernThemeProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <AppNavigator />
        <StatusBar style="auto" />
      </ThemeProvider>
    </ModernThemeProvider>
  );
}
