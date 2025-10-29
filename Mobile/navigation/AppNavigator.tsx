import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import PillBottomNav from '@/components/nav/PillBottomNav';
import { SwipeableScreens } from '@/components/nav/SwipeableScreens';
import { HomeScreen } from '@/screens/HomeScreen';
import { MintScreen } from '@/screens/MintScreen';
import { BridgeScreen } from '@/screens/BridgeScreen';
import { SendScreen } from '@/screens/SendScreen';
import { SwapScreen } from '@/screens/SwapScreen';
import { PoolDetailScreen } from '@/screens/PoolDetailScreen';
import { ActivityScreen } from '@/screens/ActivityScreen';
import { ProfileScreen } from '@/screens/ProfileScreen';
import OnboardingScreen from '@/screens/OnboardingScreen';
import WalletConnectScreen from '@/screens/WalletConnectScreen';
import SignUpScreen from '@/screens/SignUpScreen';
import BiometricPromptScreen from '@/screens/BiometricPromptScreen';
import WalletRecoveryScreen from '@/screens/WalletRecoveryScreen';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';

type ScreenName =
  | 'Home'
  | 'Create'
  | 'Activity'
  | 'Profile'
  | 'Mint'
  | 'Bridge'
  | 'Send'
  | 'Swap'
  | 'PoolDetail';

type AuthFlow =
  | 'splash'
  | 'onboarding'
  | 'biometric-prompt'
  | 'wallet-connect'
  | 'signup'
  | 'recovery'
  | 'authenticated';

const TAB_SCREENS: ScreenName[] = ['Home', 'Create', 'Activity', 'Profile'];

export const AppNavigator: React.FC<{ splashTransitionComplete?: boolean }> = ({
  splashTransitionComplete = false,
}) => {
  const {
    isAuthenticated,
    isLoading,
    hasSeenOnboarding,
    biometricEnabled,
    login,
    markOnboardingSeen,
    enableBiometric,
  } = useAuth();

  const { colors } = useTheme();

  const [activeTab, setActiveTab] = useState(0);
  const [currentScreen, setCurrentScreen] = useState<ScreenName>('Home');
  const [authFlow, setAuthFlow] = useState<AuthFlow>('splash');
  const [tempWalletAddress, setTempWalletAddress] = useState<string | null>(null);
  const [screenKeys, setScreenKeys] = useState([0, 0, 0, 0]);

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        setAuthFlow('authenticated');
      } else if (!hasSeenOnboarding) {
        setAuthFlow('onboarding');
      } else if (biometricEnabled) {
        setAuthFlow('biometric-prompt');
      } else {
        setAuthFlow('wallet-connect');
      }
    }
  }, [isLoading, isAuthenticated, hasSeenOnboarding, biometricEnabled]);

  const handleTabChange = useCallback((index: number) => {
    setActiveTab(index);
    setCurrentScreen(TAB_SCREENS[index]);
    setScreenKeys(prev => {
      const newKeys = [...prev];
      newKeys[index] = newKeys[index] + 1;
      return newKeys;
    });
  }, []);

  const handlePageChange = useCallback((index: number) => {
    setActiveTab(index);
    setCurrentScreen(TAB_SCREENS[index]);
  }, []);

  const handleNavigate = useCallback((screen: ScreenName) => {
    setCurrentScreen(screen);
    const tabIndex = TAB_SCREENS.indexOf(screen);
    if (tabIndex !== -1) {
      setActiveTab(tabIndex);
    }
  }, []);

  const navFunction = handleNavigate as (screen: string) => void;

  const tabScreens = useMemo(() => [
    <View key={`home-${screenKeys[0]}`} style={styles.pageContainer}>
      <HomeScreen onNavigate={navFunction} />
    </View>,
    <View key={`create-${screenKeys[1]}`} style={styles.pageContainer}>
      <MintScreen onNavigate={navFunction} />
    </View>,
    <View key={`activity-${screenKeys[2]}`} style={styles.pageContainer}>
      <ActivityScreen onNavigate={navFunction} />
    </View>,
    <View key={`profile-${screenKeys[3]}`} style={styles.pageContainer}>
      <ProfileScreen onNavigate={navFunction} />
    </View>,
  ], [navFunction, screenKeys]);

  const nonTabScreen = useMemo(() => {
    switch (currentScreen) {
      case 'Mint':
        return <MintScreen onNavigate={navFunction} />;
      case 'Bridge':
        return <BridgeScreen onNavigate={navFunction} />;
      case 'Send':
        return <SendScreen onNavigate={navFunction} />;
      case 'Swap':
        return <SwapScreen onNavigate={navFunction} />;
      case 'PoolDetail':
        return <PoolDetailScreen onNavigate={navFunction} />;
      default:
        return null;
    }
  }, [currentScreen, navFunction]);


  const handleOnboardingComplete = async () => {
    await markOnboardingSeen();
    setAuthFlow('wallet-connect');
  };

  const handleOnboardingSkip = async () => {
    await markOnboardingSeen();
    setAuthFlow('wallet-connect');
  };

  const handleWalletConnectSuccess = (walletAddress: string) => {
    setTempWalletAddress(walletAddress);
    setAuthFlow('signup');
  };

  const handleSignUpComplete = async (username: string, enableBio: boolean) => {
    if (!tempWalletAddress) return;

    await login(tempWalletAddress, { username });

    if (enableBio) {
      await enableBiometric();
    }

    setAuthFlow('authenticated');
    setTempWalletAddress(null);
  };

  const handleBiometricSuccess = () => {
    setAuthFlow('authenticated');
  };

  const handleBiometricUseWallet = () => {
    setAuthFlow('wallet-connect');
  };

  const handleNeedHelp = () => {
    setAuthFlow('recovery');
  };

  const handleRecoveryGoBack = () => {
    setAuthFlow('wallet-connect');
  };

  const handleRecoveryConnectDifferent = () => {
    setAuthFlow('wallet-connect');
  };

  const renderAuthFlow = () => {
    switch (authFlow) {
      case 'splash':
        return null;

      case 'onboarding':
        return (
          <OnboardingScreen
            onComplete={handleOnboardingComplete}
            onSkip={handleOnboardingSkip}
          />
        );

      case 'biometric-prompt':
        return (
          <BiometricPromptScreen
            onAuthSuccess={handleBiometricSuccess}
            onUseWalletConnect={handleBiometricUseWallet}
            transitionComplete={splashTransitionComplete}
          />
        );

      case 'wallet-connect':
        return (
          <WalletConnectScreen
            onConnectSuccess={handleWalletConnectSuccess}
            onNeedHelp={handleNeedHelp}
          />
        );

      case 'signup':
        return tempWalletAddress ? (
          <SignUpScreen
            walletAddress={tempWalletAddress}
            onComplete={handleSignUpComplete}
          />
        ) : (
          <WalletConnectScreen
            onConnectSuccess={handleWalletConnectSuccess}
            onNeedHelp={handleNeedHelp}
          />
        );

      case 'recovery':
        return (
          <WalletRecoveryScreen
            onConnectDifferentWallet={handleRecoveryConnectDifferent}
            onGoBack={handleRecoveryGoBack}
          />
        );

      case 'authenticated':
        return renderMainApp();

      default:
        return null;
    }
  };

  const renderMainApp = () => {
    const isTabScreen = TAB_SCREENS.includes(currentScreen);

    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.screenContainer}>
          {isTabScreen ? (
            <SwipeableScreens
              currentIndex={activeTab}
              onPageChange={handlePageChange}
            >
              {tabScreens}
            </SwipeableScreens>
          ) : (
            nonTabScreen
          )}
        </View>
        <PillBottomNav activeIndex={activeTab} onIndexChange={handleTabChange} />
      </View>
    );
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>{renderAuthFlow()}</View>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  screenContainer: {
    flex: 1,
  },
  pageContainer: {
    flex: 1,
  },
});
