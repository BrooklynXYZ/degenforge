import React from 'react';
import { TouchableOpacity, Text, ViewStyle, TextStyle, ActivityIndicator } from 'react-native';
import { useModernTheme } from '@/components/providers/ModernThemeProvider';
import { ModernSpacing, ModernBorderRadius } from '@/constants/modernDesignTokens';

interface ModernButtonProps {
    title: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
    size?: 'small' | 'medium' | 'large';
    disabled?: boolean;
    loading?: boolean;
    style?: ViewStyle;
    textStyle?: TextStyle;
    icon?: React.ReactNode;
}

export const ModernButton: React.FC<ModernButtonProps> = ({
    title,
    onPress,
    variant = 'primary',
    size = 'medium',
    disabled = false,
    loading = false,
    style,
    textStyle,
    icon,
}) => {
    const { colors, typography, isDark } = useModernTheme();

    const getButtonStyle = (): ViewStyle => {
        const baseStyle: ViewStyle = {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: ModernBorderRadius.md,
            paddingHorizontal: ModernSpacing.lg,
            paddingVertical: ModernSpacing.md,
            minHeight: 48,
        };

        const sizeStyles: Record<typeof size, ViewStyle> = {
            small: {
                paddingHorizontal: ModernSpacing.md,
                paddingVertical: ModernSpacing.sm,
                minHeight: 36,
            },
            medium: baseStyle,
            large: {
                paddingHorizontal: ModernSpacing.xl,
                paddingVertical: ModernSpacing.lg,
                minHeight: 56,
            },
        };

        const variantStyles: Record<typeof variant, ViewStyle> = {
            primary: {
                backgroundColor: colors.primary[500],
                shadowColor: colors.primary[500],
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 4,
            },
            secondary: {
                backgroundColor: isDark ? colors.neutral[700] : colors.neutral[200],
            },
            outline: {
                backgroundColor: 'transparent',
                borderWidth: 1,
                borderColor: colors.primary[500],
            },
            ghost: {
                backgroundColor: 'transparent',
            },
            danger: {
                backgroundColor: colors.error[500],
                shadowColor: colors.error[500],
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 4,
            },
        };

        return {
            ...sizeStyles[size],
            ...variantStyles[variant],
            opacity: disabled ? 0.5 : 1,
        };
    };

    const getTextStyle = (): TextStyle => {
        const baseTextStyle: TextStyle = {
            fontWeight: '600',
            textAlign: 'center',
        };

        const sizeTextStyles: Record<typeof size, TextStyle> = {
            small: { ...typography.labelMedium },
            medium: { ...typography.labelLarge },
            large: { ...typography.titleSmall },
        };

        const variantTextStyles: Record<typeof variant, TextStyle> = {
            primary: { color: colors.neutral[0] },
            secondary: { color: isDark ? colors.neutral[100] : colors.neutral[800] },
            outline: { color: colors.primary[500] },
            ghost: { color: colors.primary[500] },
            danger: { color: colors.neutral[0] },
        };

        return {
            ...baseTextStyle,
            ...sizeTextStyles[size],
            ...variantTextStyles[variant],
        };
    };

    return (
        <TouchableOpacity
            style={[getButtonStyle(), style]}
            onPress={onPress}
            disabled={disabled || loading}
            activeOpacity={0.8}
        >
            {loading ? (
                <ActivityIndicator
                    size="small"
                    color={variant === 'outline' || variant === 'ghost' ? colors.primary[500] : colors.neutral[0]}
                />
            ) : (
                <>
                    {icon && <>{icon}</>}
                    <Text style={[getTextStyle(), textStyle]}>{title}</Text>
                </>
            )}
        </TouchableOpacity>
    );
};
