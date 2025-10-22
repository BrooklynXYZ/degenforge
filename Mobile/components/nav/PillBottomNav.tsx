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
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

interface PillBottomNavProps {
  activeIndex: number;
  onIndexChange: (index: number) => void;
}

const ICON_NAMES = ['Home', 'Markets', 'Create', 'Activity', 'Profile'];
const SCREEN_WIDTH = Dimensions.get('window').width;

const PillBottomNav: React.FC<PillBottomNavProps> = ({ activeIndex, onIndexChange }) => {
  const scaleAnims = React.useRef(ICON_NAMES.map(() => new Animated.Value(1))).current;
  const STEADY_SCALE = 1.12;

  React.useEffect(() => {
    scaleAnims.forEach((anim, idx) => {
      Animated.spring(anim, {
        toValue: idx === activeIndex ? STEADY_SCALE : 1,
        friction: 8,
        tension: 80,
        useNativeDriver: true,
      }).start();
    });
  }, [activeIndex, scaleAnims]);

  const handlePress = (index: number) => {
    onIndexChange(index);
    const anim = scaleAnims[index];
    anim.stopAnimation();
    anim.setValue(STEADY_SCALE);
    Animated.sequence([
      Animated.spring(anim, {
        toValue: 1.22,
        friction: 6,
        tension: 120,
        useNativeDriver: true,
      }),
      Animated.spring(anim, {
        toValue: STEADY_SCALE,
        friction: 8,
        tension: 80,
        useNativeDriver: true,
      }),
    ]).start();
  };

  return (
    <View style={styles.container}>
      <View style={[styles.navWrapper, { width: SCREEN_WIDTH - 40 }]}>
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
              activeOpacity={0.75}
            >
              <Animated.View
                style={[
                  styles.iconContainer,
                  isCenter && styles.centerIcon,
                  isActive && isCenter && styles.centerIconActive,
                  { transform: [{ scale: scaleAnims[index] }] },
                ]}
              >
                <NavIcon name={name} active={isActive} isCenter={isCenter} />
              </Animated.View>

              {!isCenter && (
                <Text
                  style={[
                    styles.label,
                    {
                      color: isActive ? '#000000' : '#737373',
                      fontWeight: isActive ? '700' : '400',
                    },
                  ]}
                >
                  {name}
                </Text>
              )}
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
  const iconColor = isCenter && active ? '#FFFFFF' : active ? '#000000' : '#737373';
  const iconSize = isCenter ? 28 : 24;

  switch (name) {
    case 'Home':
      return <Feather name="home" size={iconSize} color={iconColor} />;
    case 'Markets':
      return <MaterialCommunityIcons name="chart-line" size={iconSize} color={iconColor} />;
    case 'Create':
      return <Feather name="plus-circle" size={iconSize} color={iconColor} />;
    case 'Activity':
      return <Feather name="activity" size={iconSize} color={iconColor} />;
    case 'Profile':
      return <Feather name="user" size={iconSize} color={iconColor} />;
    default:
      return <Feather name="circle" size={iconSize} color={iconColor} />;
  }
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 34 : 25,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 1000,
    pointerEvents: 'box-none',
  },
  navWrapper: {
    flexDirection: 'row',
    height: 70,
    backgroundColor: '#FFFFFF',
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 8,
    paddingVertical: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
  },
  navItem: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  centerItem: { marginTop: -8 },
  centerItemActive: { marginTop: -12 },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 42,
    height: 42,
    borderRadius: 21,
  },
  centerIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    shadowColor: 'rgba(238, 162, 184, 0.5)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  centerIconActive: {
    backgroundColor: 'rgb(255, 0, 77)',
    shadowColor: 'rgb(255, 0, 77)',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 12,
  },
  label: {
    fontSize: 11,
    marginTop: 4,
    letterSpacing: 0.2,
  },
});

export default PillBottomNav;
