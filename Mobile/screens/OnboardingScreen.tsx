import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions } from 'react-native';
import Carousel from 'react-native-reanimated-carousel';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Colors, Typography, Spacing, BorderRadius, FontFamily } from '../constants/designTokens';
import { useTheme } from '../contexts/ThemeContext';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface OnboardingSlide {
  id: number;
  title: string;
  description: string;
  icon: string;
}

const SLIDES: OnboardingSlide[] = [
  {
    id: 1,
    title: 'Welcome to Ghala',
    description: 'Transform your Bitcoin into productive capital with Bitcoin-backed DeFi',
    icon: '₿',
  },
  {
    id: 2,
    title: 'Borrow MUSD at 1%',
    description: 'Lock your Bitcoin as collateral and mint MUSD stablecoin at a fixed 1% rate',
    icon: '💰',
  },
  {
    id: 3,
    title: 'Full Control',
    description: 'Manage your positions, add collateral anytime, and close whenever you want',
    icon: '🔐',
  },
  {
    id: 4,
    title: 'Earn & Grow',
    description: 'Deploy MUSD across DeFi to earn yield while keeping your Bitcoin exposure',
    icon: '📈',
  },
];

interface OnboardingScreenProps {
  onComplete: () => void;
  onSkip: () => void;
}

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete, onSkip }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { colors } = useTheme();

  const isLastSlide = currentIndex === SLIDES.length - 1;

  const renderSlide = ({ item, index }: { item: OnboardingSlide; index: number }) => {
    return (
      <Animated.View
        entering={FadeInDown.duration(500).delay(200)}
        style={styles.slideContainer}
      >
        <View style={styles.iconContainer}>
          <Text style={[styles.icon, { color: Colors.accent.ghalaGold }]}>
            {item.icon}
          </Text>
        </View>

        <View style={styles.contentContainer}>
          <Text style={[styles.title, { color: colors.textPrimary }]}>
            {item.title}
          </Text>
          <Text style={[styles.description, { color: colors.textSecondary }]}>
            {item.description}
          </Text>
        </View>
      </Animated.View>
    );
  };

  const renderPaginationDots = () => {
    return (
      <View style={styles.paginationContainer}>
        {SLIDES.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              {
                backgroundColor:
                  index === currentIndex
                    ? Colors.accent.ghalaGold
                    : colors.border,
                width: index === currentIndex ? 24 : 8,
              },
            ]}
          />
        ))}
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Skip Button */}
      <Pressable
        onPress={onSkip}
        style={({ pressed }) => [
          styles.skipButton,
          { opacity: pressed ? 0.6 : 1 },
        ]}
      >
        <Text style={[styles.skipText, { color: colors.textSecondary }]}>
          Skip
        </Text>
      </Pressable>

      {/* Carousel */}
      <Carousel
        width={SCREEN_WIDTH}
        height={SCREEN_HEIGHT * 0.7}
        data={SLIDES}
        renderItem={renderSlide}
        onSnapToItem={(index) => setCurrentIndex(index)}
        mode="parallax"
        modeConfig={{
          parallaxScrollingScale: 0.9,
          parallaxScrollingOffset: 50,
        }}
      />

      {/* Pagination Dots */}
      {renderPaginationDots()}

      {/* Next/Get Started Button */}
      <View style={styles.buttonContainer}>
        <Pressable
          onPress={isLastSlide ? onComplete : () => setCurrentIndex(currentIndex + 1)}
          style={({ pressed }) => [
            styles.button,
            {
              backgroundColor: Colors.accent.ghalaGold,
              borderColor: Colors.base.black,
              opacity: pressed ? 0.8 : 1,
            },
          ]}
        >
          <Text style={styles.buttonText}>
            {isLastSlide ? 'Get Started' : 'Next'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  skipButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 100,
    padding: Spacing.sm,
  },
  skipText: {
    ...Typography.bodyMedium,
    fontFamily: FontFamily.semibold,
  },
  slideContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xxxl,
  },
  iconContainer: {
    width: 160,
    height: 160,
    borderRadius: BorderRadius.circle,
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    borderWidth: 2,
    borderColor: Colors.accent.ghalaGold,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xxxl,
  },
  icon: {
    fontSize: 80,
  },
  contentContainer: {
    alignItems: 'center',
    maxWidth: 340,
  },
  title: {
    ...Typography.h1,
    fontFamily: FontFamily.bold,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  description: {
    ...Typography.body,
    fontFamily: FontFamily.regular,
    textAlign: 'center',
    lineHeight: 28,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    gap: Spacing.xs,
  },
  dot: {
    height: 8,
    borderRadius: BorderRadius.pill,
  },
  buttonContainer: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xxxl,
  },
  button: {
    height: 56,
    borderRadius: 0,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    ...Typography.button,
    fontFamily: FontFamily.bold,
    color: Colors.base.black,
    textTransform: 'uppercase',
  },
});

export default OnboardingScreen;
