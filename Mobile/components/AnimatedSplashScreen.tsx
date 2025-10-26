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
import { useFonts, PlayfairDisplay_900Black } from '@expo-google-fonts/playfair-display';

interface AnimatedSplashScreenProps {
    onAnimationComplete?: () => void;
}

export const AnimatedSplashScreen: React.FC<AnimatedSplashScreenProps> = ({
    onAnimationComplete,
}) => {
    const [fontsLoaded] = useFonts({
        PlayfairDisplay_900Black,
    });

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

        const animConfig = {
            duration: 2400,
            easing: Easing.bezier(0.33, 0, 0.67, 1),
        };

        letterG.value = withTiming(1, animConfig);
        letterH.value = withTiming(1, animConfig);
        letterA1.value = withTiming(1, animConfig);
        letterL.value = withTiming(1, animConfig);
        letterA2.value = withTiming(1, animConfig);

        progress.value = withSequence(
            withTiming(1, { duration: 2400, easing: Easing.out(Easing.ease) }),
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
            }, 3000);

            return () => clearTimeout(timer);
        }
    }, [fontsLoaded, letterG, letterH, letterA1, letterL, letterA2, progress, translateY, scale, onAnimationComplete]);

    const styleG = useAnimatedStyle(() => ({
        opacity: letterG.value,
        transform: [
            { translateY: (1 - letterG.value) * 30 },
            { scale: 0.8 + letterG.value * 0.2 },
        ],
    }));

    const styleH = useAnimatedStyle(() => ({
        opacity: letterH.value,
        transform: [
            { translateY: (1 - letterH.value) * 30 },
            { scale: 0.8 + letterH.value * 0.2 },
        ],
    }));

    const styleA1 = useAnimatedStyle(() => ({
        opacity: letterA1.value,
        transform: [
            { translateY: (1 - letterA1.value) * 30 },
            { scale: 0.8 + letterA1.value * 0.2 },
        ],
    }));

    const styleL = useAnimatedStyle(() => ({
        opacity: letterL.value,
        transform: [
            { translateY: (1 - letterL.value) * 30 },
            { scale: 0.8 + letterL.value * 0.2 },
        ],
    }));

    const styleA2 = useAnimatedStyle(() => ({
        opacity: letterA2.value,
        transform: [
            { translateY: (1 - letterA2.value) * 30 },
            { scale: 0.8 + letterA2.value * 0.2 },
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
            <Animated.View style={[styles.textContainer, containerStyle]}>
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
    textContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    letter: {
        fontFamily: 'PlayfairDisplay_900Black',
        fontSize: 68,
        color: '#000000',
        letterSpacing: 4,
        fontWeight: '900',
        marginHorizontal: 2,
    },
});
