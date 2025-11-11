import '@walletconnect/react-native-compat';
import 'react-native-get-random-values';

import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
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
import * as Linking from 'expo-linking';
import React from 'react';
import 'react-native-reanimated';

import { AppNavigator } from '@/navigation/AppNavigator';
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { AnimatedSplashScreen } from '@/components/AnimatedSplashScreen';
import { WalletProvider } from '@/contexts/WalletProvider';
import TransactionMonitorService from '@/services/TransactionMonitorService';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    SpaceGrotesk_300Light,
    SpaceGrotesk_400Regular,
    SpaceGrotesk_500Medium,
    SpaceGrotesk_600SemiBold,
    SpaceGrotesk_700Bold,
    ...Feather.font,
  });

  const [showCustomSplash, setShowCustomSplash] = React.useState(true);
  const [transitionComplete, setTransitionComplete] = React.useState(false);

  // Handle deep linking for wallet returns
  React.useEffect(() => {
    const handleDeepLink = (event: { url: string }) => {
      console.log('Deep link received:', event.url);
      // The WalletConnect/AppKit will automatically handle the callback
    };

    // Handle initial URL if app was opened from a deep link
    Linking.getInitialURL().then((url) => {
      if (url) {
        console.log('Initial URL:', url);
      }
    });

    // Listen for deep link events
    const subscription = Linking.addEventListener('url', handleDeepLink);

    return () => {
      subscription.remove();
    };
  }, []);

  React.useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
      TransactionMonitorService.resumePendingTransactions();
    }
  }, [fontsLoaded]);

  const handleSplashComplete = () => {
    setTimeout(() => {
      setShowCustomSplash(false);
      setTransitionComplete(true);
    }, 100);
  };

  if (!fontsLoaded || showCustomSplash) {
    return fontsLoaded ? (
      <AnimatedSplashScreen
        onAnimationComplete={handleSplashComplete}
      />
    ) : null;
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <WalletProvider>
          <AuthProvider>
            <ThemedApp transitionComplete={transitionComplete} />
          </AuthProvider>
        </WalletProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

function ThemedApp({ transitionComplete }: { transitionComplete: boolean }) {
  const { actualTheme } = useTheme();

  return (
    <NavigationThemeProvider value={actualTheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AppNavigator splashTransitionComplete={transitionComplete} />
      <StatusBar style={actualTheme === 'dark' ? 'light' : 'dark'} />
    </NavigationThemeProvider>
  );
}
