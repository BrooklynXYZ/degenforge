import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import PillBottomNav from '@/components/nav/PillBottomNav';
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
  }, []);

  const handleNavigate = useCallback((screen: ScreenName) => {
    setCurrentScreen(screen);
    const tabIndex = TAB_SCREENS.indexOf(screen);
    if (tabIndex !== -1) {
      setActiveTab(tabIndex);
    }
  }, []);

  const navFunction = handleNavigate as (screen: string) => void;

  // Memoized screen component (must be at top level, not inside renderMainApp)
  const screenComponent = useMemo(() => {
    switch (currentScreen) {
      case 'Home':
        return <HomeScreen onNavigate={navFunction} />;
      case 'Create':
        return <MintScreen onNavigate={navFunction} />;
      case 'Activity':
        return <ActivityScreen onNavigate={navFunction} />;
      case 'Profile':
        return <ProfileScreen onNavigate={navFunction} />;
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
        return <HomeScreen onNavigate={navFunction} />;
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

  // Render main app screens
  const renderMainApp = () => {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.screenContainer}>{screenComponent}</View>
        <PillBottomNav activeIndex={activeTab} onIndexChange={handleTabChange} />
      </View>
    );
  };

  return <View style={[styles.container, { backgroundColor: colors.background }]}>{renderAuthFlow()}</View>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  screenContainer: {
    flex: 1,
  },
});
