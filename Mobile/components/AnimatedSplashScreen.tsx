import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withSequence,
    withDelay,
    Easing,
    runOnJS,
} from 'react-native-reanimated';

interface AnimatedSplashScreenProps {
    onAnimationComplete?: () => void;
}

export const AnimatedSplashScreen: React.FC<AnimatedSplashScreenProps> = ({
    onAnimationComplete,
}) => {
    const fontsLoaded = true;

    const letterG = useSharedValue(0);
    const letterH = useSharedValue(0);
    const letterA1 = useSharedValue(0);
    const letterL = useSharedValue(0);
    const letterA2 = useSharedValue(0);

    const progress = useSharedValue(0);
    const translateY = useSharedValue(0);
    const scale = useSharedValue(1);

    useEffect(() => {
        if (!fontsLoaded) return;

        const typingDuration = 200;
        const letterDelay = 180;
        const typingEasing = Easing.out(Easing.cubic);

        letterG.value = withDelay(
            0,
            withTiming(1, { duration: typingDuration, easing: typingEasing })
        );

        letterH.value = withDelay(
            letterDelay * 1,
            withTiming(1, { duration: typingDuration, easing: typingEasing })
        );

        letterA1.value = withDelay(
            letterDelay * 2,
            withTiming(1, { duration: typingDuration, easing: typingEasing })
        );

        letterL.value = withDelay(
            letterDelay * 3,
            withTiming(1, { duration: typingDuration, easing: typingEasing })
        );

        letterA2.value = withDelay(
            letterDelay * 4,
            withTiming(1, { duration: typingDuration, easing: typingEasing })
        );

        const totalTypingTime = letterDelay * 4 + typingDuration;

        progress.value = withSequence(
            withTiming(1, { duration: totalTypingTime, easing: Easing.linear }),
            withDelay(600, withTiming(2, { duration: 0 }))
        );

        if (onAnimationComplete) {
            const timer = setTimeout(() => {
                translateY.value = withTiming(-120, {
                    duration: 800,
                    easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
                });
                scale.value = withTiming(0.6, {
                    duration: 800,
                    easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
                }, (finished) => {
                    if (finished && onAnimationComplete) {
                        runOnJS(onAnimationComplete)();
                    }
                });
            }, totalTypingTime + 800);

            return () => clearTimeout(timer);
        }
    }, [fontsLoaded, letterG, letterH, letterA1, letterL, letterA2, progress, translateY, scale, onAnimationComplete]);

    const styleG = useAnimatedStyle(() => ({
        opacity: letterG.value > 0.1 ? 1 : 0,
        transform: [
            { scale: letterG.value < 0.5 ? 0 : 0.5 + letterG.value * 0.5 },
        ],
    }));

    const styleH = useAnimatedStyle(() => ({
        opacity: letterH.value > 0.1 ? 1 : 0,
        transform: [
            { scale: letterH.value < 0.5 ? 0 : 0.5 + letterH.value * 0.5 },
        ],
    }));

    const styleA1 = useAnimatedStyle(() => ({
        opacity: letterA1.value > 0.1 ? 1 : 0,
        transform: [
            { scale: letterA1.value < 0.5 ? 0 : 0.5 + letterA1.value * 0.5 },
        ],
    }));

    const styleL = useAnimatedStyle(() => ({
        opacity: letterL.value > 0.1 ? 1 : 0,
        transform: [
            { scale: letterL.value < 0.5 ? 0 : 0.5 + letterL.value * 0.5 },
        ],
    }));

    const styleA2 = useAnimatedStyle(() => ({
        opacity: letterA2.value > 0.1 ? 1 : 0,
        transform: [
            { scale: letterA2.value < 0.5 ? 0 : 0.5 + letterA2.value * 0.5 },
        ],
    }));

    const containerStyle = useAnimatedStyle(() => ({
        opacity: progress.value >= 2 ? 0 : 1,
        transform: [
            { translateY: translateY.value },
            { scale: scale.value },
        ],
    }));

    if (!fontsLoaded) {
        return null;
    }

    return (
        <View style={styles.container}>
            <Animated.View style={[styles.wordContainer, containerStyle]}>
                <Animated.Text style={[styles.letter, styleG]}>G</Animated.Text>
                <Animated.Text style={[styles.letter, styleH]}>H</Animated.Text>
                <Animated.Text style={[styles.letter, styleA1]}>A</Animated.Text>
                <Animated.Text style={[styles.letter, styleL]}>L</Animated.Text>
                <Animated.Text style={[styles.letter, styleA2]}>A</Animated.Text>
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    wordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    letter: {
        fontFamily: 'SpaceGrotesk_700Bold',
        fontSize: 72,
        color: '#000000',
        letterSpacing: 4,
        fontWeight: '700',
        marginHorizontal: 2,
    },
});
