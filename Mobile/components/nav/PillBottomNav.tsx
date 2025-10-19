import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { Colors, Spacing, BorderRadius, Animations, Shadows, Layout } from '@/constants/designTokens';

interface PillBottomNavProps {
  activeIndex: number;
  onIndexChange: (index: number) => void;
}

const ICON_NAMES = ['Home', 'Markets', 'Create', 'Activity', 'Profile'];
const SCREEN_WIDTH = Dimensions.get('window').width;

export const PillBottomNav: React.FC<PillBottomNavProps> = ({
  activeIndex,
  onIndexChange,
}) => {
  const scaleAnim = React.useRef(new Animated.Value(1)).current;
  const pillPositionAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1.06,
        useNativeDriver: true,
        speed: 12,
        bounciness: 8,
      }),
      Animated.timing(pillPositionAnim, {
        toValue: activeIndex,
        duration: Animations.normal,
        useNativeDriver: false,
      }),
    ]).start();
  }, [activeIndex]);

  const handlePress = (index: number) => {
    onIndexChange(index);
  };

  // Calculate pill background position
  const pillWidth = (SCREEN_WIDTH - 32) / 5;
  const pillLeft = pillPositionAnim.interpolate({
    inputRange: [0, 1, 2, 3, 4],
    outputRange: [0, pillWidth, pillWidth * 2, pillWidth * 3, pillWidth * 4],
  });

  return (
    <View style={styles.container}>
      <View style={[styles.navWrapper, { width: SCREEN_WIDTH - 32 }]}>
        {/* Animated pill background */}
        <Animated.View
          style={[
            styles.activePill,
            {
              left: pillLeft,
              width: pillWidth,
            },
          ]}
        />

        {/* Nav items */}
        {ICON_NAMES.map((name, index) => {
          const isActive = activeIndex === index;
          const isCenter = index === 2;

          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.navItem,
                isCenter && styles.centerItem,
                isActive && isCenter && styles.centerItemActive,
              ]}
              onPress={() => handlePress(index)}
              activeOpacity={0.7}
            >
              <Animated.View
                style={[
                  styles.iconContainer,
                  isActive && isCenter && { transform: [{ scale: scaleAnim }] },
                ]}
              >
                <NavIcon name={name} active={isActive} isCenter={isCenter} />
              </Animated.View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

interface NavIconProps {
  name: string;
  active: boolean;
  isCenter: boolean;
}

const NavIcon: React.FC<NavIconProps> = ({ name, active, isCenter }) => {
  const iconColor = active ? Colors.accent.primary : Colors.text.tertiary;

  // Simple icon representations (replace with actual icon library)
  const getIcon = () => {
    switch (name) {
      case 'Home':
        return '🏠';
      case 'Markets':
        return '📊';
      case 'Create':
        return '➕';
      case 'Activity':
        return '📋';
      case 'Profile':
        return '👤';
      default:
        return '•';
    }
  };

  return (
    <View
      style={[
        styles.icon,
        isCenter && styles.centerIcon,
        active && isCenter && styles.centerIconActive,
      ]}
    >
      <Text style={{ fontSize: isCenter ? 24 : 20, color: iconColor }}>
        {getIcon()}
      </Text>
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: Layout.bottomNav.floatingMarginBottom,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 400,
  },
  navWrapper: {
    flexDirection: 'row',
    height: Layout.bottomNav.floatingHeight,
    backgroundColor: Colors.base.white,
    borderRadius: Layout.bottomNav.borderRadius,
    alignItems: 'center',
    justifyContent: 'space-around',
    ...Shadows.floating,
    paddingHorizontal: Spacing.sm,
  },
  activePill: {
    position: 'absolute',
    height: 48,
    backgroundColor: Colors.accent.light,
    borderRadius: BorderRadius.pill,
    opacity: 0.3,
  },
  navItem: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  centerItem: {
    marginVertical: -Spacing.lg,
  },
  centerItemActive: {
    marginVertical: -Spacing.xl,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.circle,
  },
  centerIcon: {
    width: Layout.bottomNav.centerIconSize,
    height: Layout.bottomNav.centerIconSize,
    backgroundColor: Colors.base.white,
    borderRadius: BorderRadius.circle,
    ...Shadows.card,
  },
  centerIconActive: {
    backgroundColor: Colors.accent.primary,
  },
});
