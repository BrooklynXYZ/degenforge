import React, { useState, useCallback, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import PillBottomNav from '@/components/nav/PillBottomNav';
import { HomeScreen } from '@/screens/HomeScreen';
import { MintScreen } from '@/screens/MintScreen';
import { BridgeScreen } from '@/screens/BridgeScreen';
import { PoolDetailScreen } from '@/screens/PoolDetailScreen';
import { ActivityScreen } from '@/screens/ActivityScreen';
import { ProfileScreen } from '@/screens/ProfileScreen';

type ScreenName =
  | 'Home'
  | 'Create'
  | 'Activity'
  | 'Profile'
  | 'Mint'
  | 'Bridge'
  | 'PoolDetail';

const TAB_SCREENS: ScreenName[] = ['Home', 'Create', 'Activity', 'Profile'];

export const AppNavigator: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [currentScreen, setCurrentScreen] = useState<ScreenName>('Home');

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
      case 'PoolDetail':
        return <PoolDetailScreen onNavigate={navFunction} />;
      default:
        return <HomeScreen onNavigate={navFunction} />;
    }
  }, [currentScreen, navFunction]);

  return (
    <View style={styles.container}>
      <View style={styles.screenContainer}>{screenComponent}</View>
      <PillBottomNav activeIndex={activeTab} onIndexChange={handleTabChange} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  screenContainer: {
    flex: 1,
  },
});
