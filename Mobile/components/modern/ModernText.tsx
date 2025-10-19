import React from 'react';
import { Text, TextStyle } from 'react-native';
import { useModernTheme } from '@/components/providers/ModernThemeProvider';

interface ModernTextProps {
    children: React.ReactNode;
    variant?: keyof typeof import('@/constants/modernDesignTokens').ModernTypography;
    color?: string;
    style?: TextStyle;
    numberOfLines?: number;
}

export const ModernText: React.FC<ModernTextProps> = ({
    children,
    variant = 'bodyMedium',
    color,
    style,
    numberOfLines,
}) => {
    const { colors, typography, isDark } = useModernTheme();

    const getTextColor = (): string => {
        if (color) return color;

        // Default colors based on variant
        if (variant.includes('Display') || variant.includes('Headline')) {
            return isDark ? colors.dark.onBackground : colors.light.onBackground;
        }

        return isDark ? colors.dark.onSurface : colors.light.onSurface;
    };

    return (
        <Text
            style={[
                typography[variant],
                { color: getTextColor() },
                style,
            ]}
            numberOfLines={numberOfLines}
        >
            {children}
        </Text>
    );
};
