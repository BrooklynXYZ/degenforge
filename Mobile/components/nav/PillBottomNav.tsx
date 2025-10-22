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

interface PillBottomNavProps {
  activeIndex: number;
  onIndexChange: (index: number) => void;
}

const ICON_NAMES = ['Home', 'Create', 'Activity', 'Profile'];
const SCREEN_WIDTH = Dimensions.get('window').width;

const PillBottomNav: React.FC<PillBottomNavProps> = ({ activeIndex, onIndexChange }) => {
  const insets = useSafeAreaInsets();
  const [tooltipIndex, setTooltipIndex] = useState<number | null>(null);
  const tooltipTimeout = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const handlePress = (index: number) => {
    onIndexChange(index);
  };

  const handleLongPress = (index: number) => {
    setTooltipIndex(index);
    if (tooltipTimeout.current) {
      clearTimeout(tooltipTimeout.current);
    }
    tooltipTimeout.current = setTimeout(() => {
      setTooltipIndex(null);
    }, 2000);
  };

  React.useEffect(() => {
    return () => {
      if (tooltipTimeout.current) {
        clearTimeout(tooltipTimeout.current);
      }
    };
  }, []);

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      <View style={[styles.navWrapper, { width: SCREEN_WIDTH }]}>
        {ICON_NAMES.map((name, index) => {
          const isActive = activeIndex === index;

          return (
            <Pressable
              key={index}
              style={({ pressed }) => [
                styles.navItem,
                isActive && styles.navItemActive,
              ]}
              onPress={() => handlePress(index)}
              onLongPress={() => handleLongPress(index)}
              android_ripple={{ color: 'transparent' }}
            >
              {tooltipIndex === index && (
                <View style={styles.tooltip}>
                  <Text style={styles.tooltipText}>{name}</Text>
                </View>
              )}
              <View style={styles.iconContainer}>
                <NavIcon name={name} active={isActive} />
              </View>
              {isActive && <View style={styles.activeIndicator} />}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

interface NavIconProps {
  name: string;
  active: boolean;
}

const NavIcon = React.memo<NavIconProps>(({ name, active }) => {
  const iconColor = active ? '#000000' : '#737373';

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
    backgroundColor: '#FFFFFF',
  },
  navWrapper: {
    flexDirection: 'row',
    height: 60,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 0,
    paddingVertical: 0,
    borderTopWidth: 2,
    borderColor: '#000000',
  },
  navItem: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    position: 'relative',
  },
  navItemActive: {
    backgroundColor: '#FAFAFA',
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
    backgroundColor: '#000000',
  },
  tooltip: {
    position: 'absolute',
    bottom: 65,
    backgroundColor: '#000000',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 2,
    borderColor: '#000000',
    zIndex: 1000,
  },
  tooltipText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
    fontFamily: 'SpaceGrotesk_600SemiBold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});

export default PillBottomNav;
