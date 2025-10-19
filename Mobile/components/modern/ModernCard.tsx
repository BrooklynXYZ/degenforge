import React from 'react';
import { View, ViewStyle, StyleSheet, TouchableOpacity } from 'react-native';
import { useModernTheme } from '@/components/providers/ModernThemeProvider';
import { ModernSpacing, ModernBorderRadius, Glassmorphism } from '@/constants/modernDesignTokens';

interface ModernCardProps {
    children: React.ReactNode;
    style?: ViewStyle;
    onPress?: () => void;
    variant?: 'default' | 'glass' | 'elevated' | 'outlined';
    padding?: keyof typeof ModernSpacing;
}

export const ModernCard: React.FC<ModernCardProps> = ({
    children,
    style,
    onPress,
    variant = 'default',
    padding = 'lg',
}) => {
    const { colors, isDark } = useModernTheme();

    const getCardStyle = (): ViewStyle => {
        const baseStyle: ViewStyle = {
            borderRadius: ModernBorderRadius.lg,
            padding: ModernSpacing[padding],
        };

        switch (variant) {
            case 'glass':
                return {
                    ...baseStyle,
                    ...Glassmorphism[isDark ? 'dark' : 'light'],
                };
            case 'elevated':
                return {
                    ...baseStyle,
                    backgroundColor: isDark ? colors.dark.surface : colors.light.surface,
                    shadowColor: colors.neutral[900],
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: isDark ? 0.3 : 0.1,
                    shadowRadius: 12,
                    elevation: 8,
                };
            case 'outlined':
                return {
                    ...baseStyle,
                    backgroundColor: isDark ? colors.dark.surface : colors.light.surface,
                    borderWidth: 1,
                    borderColor: isDark ? colors.neutral[700] : colors.neutral[200],
                };
            default:
                return {
                    ...baseStyle,
                    backgroundColor: isDark ? colors.dark.surface : colors.light.surface,
                };
        }
    };

    const cardStyle = [getCardStyle(), style];

    if (onPress) {
        return (
            <TouchableOpacity style={cardStyle} onPress={onPress} activeOpacity={0.8}>
                {children}
            </TouchableOpacity>
        );
    }

    return <View style={cardStyle}>{children}</View>;
};
