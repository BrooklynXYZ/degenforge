import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { Colors, Typography, FontFamily } from '../constants/designTokens';

interface SplashScreenProps {
  onAnimationComplete: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onAnimationComplete }) => {
  // Individual letter animation values
  const letterG = useSharedValue(0);
  const letterH = useSharedValue(0);
  const letterA1 = useSharedValue(0);
  const letterL = useSharedValue(0);
  const letterA2 = useSharedValue(0);

  useEffect(() => {
    // Animate all letters simultaneously
    const animateLetters = () => {
      const springConfig = {
        damping: 15,
        stiffness: 100,
        mass: 1,
      };

      // Start all animations at the same time
      letterG.value = withSpring(1, springConfig);
      letterH.value = withSpring(1, springConfig);
      letterA1.value = withSpring(1, springConfig);
      letterL.value = withSpring(1, springConfig);
      letterA2.value = withSpring(1, springConfig);
    };

    // Start animation after a brief delay
    const startTimer = setTimeout(() => {
      animateLetters();
    }, 200);

    // Complete animation after 2.5 seconds
    const completeTimer = setTimeout(() => {
      onAnimationComplete();
    }, 2500);

    return () => {
      clearTimeout(startTimer);
      clearTimeout(completeTimer);
    };
  }, [onAnimationComplete]);

  // Create animated styles for each letter
  const createLetterStyle = (animatedValue: any) => {
    return useAnimatedStyle(() => {
      return {
        opacity: animatedValue.value,
        transform: [
          { scale: 0.5 + animatedValue.value * 0.5 },
          { translateY: (1 - animatedValue.value) * 20 },
        ],
      };
    });
  };

  const letterStyleG = createLetterStyle(letterG);
  const letterStyleH = createLetterStyle(letterH);
  const letterStyleA1 = createLetterStyle(letterA1);
  const letterStyleL = createLetterStyle(letterL);
  const letterStyleA2 = createLetterStyle(letterA2);

  return (
    <View style={styles.container}>
      <View style={styles.letterContainer}>
        <Animated.Text style={[styles.letter, letterStyleG]}>G</Animated.Text>
        <Animated.Text style={[styles.letter, letterStyleH]}>H</Animated.Text>
        <Animated.Text style={[styles.letter, letterStyleA1]}>A</Animated.Text>
        <Animated.Text style={[styles.letter, letterStyleL]}>L</Animated.Text>
        <Animated.Text style={[styles.letter, letterStyleA2]}>A</Animated.Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.base.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  letterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  letter: {
    fontSize: 72,
    fontFamily: FontFamily.bold,
    color: Colors.accent.ghalaGold,
    letterSpacing: -2,
    marginHorizontal: -1,
  },
});

export default SplashScreen;
