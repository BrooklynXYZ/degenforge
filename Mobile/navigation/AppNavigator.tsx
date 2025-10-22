import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Colors } from '@/constants/designTokens';
import PillBottomNav from '@/components/nav/PillBottomNav';
import { HomeScreen } from '@/screens/HomeScreen';
import { MintScreen } from '@/screens/MintScreen';
import { BridgeScreen } from '@/screens/BridgeScreen';
import { PoolDetailScreen } from '@/screens/PoolDetailScreen';
import { ActivityScreen } from '@/screens/ActivityScreen';
import { ProfileScreen } from '@/screens/ProfileScreen';

type ScreenName =
  | 'Home'
  | 'Markets'
  | 'Create'
  | 'Activity'
  | 'Profile'
  | 'Mint'
  | 'Bridge'
  | 'PoolDetail'
  | 'Redeem'
  | 'VaultDetail';

export const AppNavigator: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [currentScreen, setCurrentScreen] = useState<ScreenName>('Home');
  const TAB_SCREENS: ScreenName[] = ['Home', 'Markets', 'Create', 'Activity', 'Profile'];

  const handleTabChange = (index: number) => {
    setActiveTab(index);
    setCurrentScreen(TAB_SCREENS[index]);
  };

  const handleNavigate = (screen: ScreenName) => {
    setCurrentScreen(screen);
    const tabIndex = TAB_SCREENS.indexOf(screen as ScreenName);
    if (tabIndex !== -1) {
      setActiveTab(tabIndex);
    }
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'Home':
        return <HomeScreen onNavigate={handleNavigate} />;
      case 'Markets':
        return <PoolDetailScreen onNavigate={handleNavigate} />;
      case 'Create':
        return <MintScreen onNavigate={handleNavigate} />;
      case 'Activity':
        return <ActivityScreen onNavigate={handleNavigate} />;
      case 'Profile':
        return <ProfileScreen onNavigate={handleNavigate} />;
      case 'Mint':
        return <MintScreen onNavigate={handleNavigate} />;
      case 'Bridge':
        return <BridgeScreen onNavigate={handleNavigate} />;
      case 'PoolDetail':
        return <PoolDetailScreen onNavigate={handleNavigate} />;
      default:
        return <HomeScreen onNavigate={handleNavigate} />;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.screenContainer}>{renderScreen()}</View>

      {/* PillBottomNav expects activeIndex and onIndexChange */}
      <PillBottomNav activeIndex={activeTab} onIndexChange={handleTabChange} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg.primary,
  },
  screenContainer: {
    flex: 1,
    paddingBottom: 100,
  },
});
