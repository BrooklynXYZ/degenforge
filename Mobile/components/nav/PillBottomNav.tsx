import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';

interface PillBottomNavProps {
  activeIndex: number;
  onIndexChange: (index: number) => void;
}

const ICON_NAMES = ['Home', 'Create', 'Activity', 'Profile'];
const SCREEN_WIDTH = Dimensions.get('window').width;

const PillBottomNav: React.FC<PillBottomNavProps> = React.memo(({ activeIndex, onIndexChange }) => {
  const insets = useSafeAreaInsets();
  const { actualTheme } = useTheme();
  const [tooltipIndex, setTooltipIndex] = useState<number | null>(null);
  const tooltipTimeout = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const isDark = React.useMemo(() => actualTheme === 'dark', [actualTheme]);
  const colors = React.useMemo(() => ({
    bgColor: isDark ? '#000000' : '#FFFFFF',
    borderColor: isDark ? '#FFFFFF' : '#000000',
    activeColor: isDark ? '#FFFFFF' : '#000000',
    inactiveColor: '#737373',
    activeBgColor: isDark ? '#1A1A1A' : '#FAFAFA',
  }), [isDark]);

  const handlePress = React.useCallback((index: number) => {
    onIndexChange(index);
  }, [onIndexChange]);

  const handleLongPress = React.useCallback((index: number) => {
    setTooltipIndex(index);
    if (tooltipTimeout.current) {
      clearTimeout(tooltipTimeout.current);
    }
    tooltipTimeout.current = setTimeout(() => {
      setTooltipIndex(null);
    }, 2000);
  }, []);

  React.useEffect(() => {
    return () => {
      if (tooltipTimeout.current) {
        clearTimeout(tooltipTimeout.current);
      }
    };
  }, []);

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 8), backgroundColor: colors.bgColor }]}>
      <View style={[styles.navWrapper, { width: SCREEN_WIDTH, backgroundColor: colors.bgColor, borderColor: colors.borderColor }]}>
        {ICON_NAMES.map((name, index) => {
          const isActive = activeIndex === index;

          return (
            <Pressable
              key={index}
              style={({ pressed }) => [
                styles.navItem,
                isActive && { backgroundColor: colors.activeBgColor },
              ]}
              onPress={() => handlePress(index)}
              onLongPress={() => handleLongPress(index)}
              android_ripple={{ color: 'transparent' }}
            >
              {tooltipIndex === index && (
                <View style={[styles.tooltip, { backgroundColor: isDark ? '#FFFFFF' : '#000000', borderColor: colors.borderColor }]}>
                  <Text style={[styles.tooltipText, { color: isDark ? '#000000' : '#FFFFFF' }]}>{name}</Text>
                </View>
              )}
              <View style={styles.iconContainer}>
                <NavIcon name={name} active={isActive} activeColor={colors.activeColor} inactiveColor={colors.inactiveColor} />
              </View>
              {isActive && <View style={[styles.activeIndicator, { backgroundColor: colors.borderColor }]} />}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
});

PillBottomNav.displayName = 'PillBottomNav';

interface NavIconProps {
  name: string;
  active: boolean;
  activeColor: string;
  inactiveColor: string;
}

const NavIcon = React.memo<NavIconProps>(({ name, active, activeColor, inactiveColor }) => {
  const iconColor = active ? activeColor : inactiveColor;

  switch (name) {
    case 'Home':
      return <Feather name="home" size={24} color={iconColor} />;
    case 'Create':
      return <Feather name="plus-circle" size={24} color={iconColor} />;
    case 'Activity':
      return <Feather name="activity" size={24} color={iconColor} />;
    case 'Profile':
      return <Feather name="settings" size={24} color={iconColor} />;
    default:
      return <Feather name="circle" size={24} color={iconColor} />;
  }
});

NavIcon.displayName = 'NavIcon';

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    pointerEvents: 'box-none',
  },
  navWrapper: {
    flexDirection: 'row',
    height: 60,
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 0,
    paddingVertical: 0,
    borderTopWidth: 2,
  },
  navItem: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    position: 'relative',
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 44,
    height: 44,
  },
  activeIndicator: {
    position: 'absolute',
    top: 0,
    left: '50%',
    marginLeft: -16,
    width: 32,
    height: 3,
  },
  tooltip: {
    position: 'absolute',
    bottom: 65,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 2,
    zIndex: 1000,
  },
  tooltipText: {
    fontSize: 11,
    fontWeight: '600',
    fontFamily: 'SpaceGrotesk_600SemiBold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});

export default PillBottomNav;
