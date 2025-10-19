import { Platform } from 'react-native';

// Modern Color Palette for Financial Apps
export const ModernColors = {
    // Primary Brand Colors
    primary: {
        50: '#E6F4FE',
        100: '#B3E0FC',
        200: '#80CCFA',
        300: '#4DB8F8',
        400: '#1AA4F6',
        500: '#0090F4', // Main brand color
        600: '#007CD1',
        700: '#0068AE',
        800: '#00548B',
        900: '#004068',
    },

    // Success/Positive Colors
    success: {
        50: '#E6FDF4',
        100: '#B3F7E0',
        200: '#80F1CC',
        300: '#4DEBB8',
        400: '#1AE5A4',
        500: '#00D4AA', // Main success color
        600: '#00B894',
        700: '#009C7E',
        800: '#008068',
        900: '#006452',
    },

    // Warning Colors
    warning: {
        50: '#FFF8E6',
        100: '#FFEDB3',
        200: '#FFE280',
        300: '#FFD74D',
        400: '#FFCC1A',
        500: '#FFB800', // Main warning color
        600: '#E6A600',
        700: '#CC9400',
        800: '#B38200',
        900: '#997000',
    },

    // Error Colors
    error: {
        50: '#FFE6E6',
        100: '#FFB3B3',
        200: '#FF8080',
        300: '#FF4D4D',
        400: '#FF1A1A',
        500: '#FF0000', // Main error color
        600: '#E60000',
        700: '#CC0000',
        800: '#B30000',
        900: '#990000',
    },

    // Neutral Colors
    neutral: {
        0: '#FFFFFF',
        50: '#FAFAFA',
        100: '#F5F5F5',
        200: '#E5E5E5',
        300: '#D4D4D4',
        400: '#A3A3A3',
        500: '#737373',
        600: '#525252',
        700: '#404040',
        800: '#262626',
        900: '#171717',
        950: '#0A0A0A',
    },

    // Dark Mode Colors
    dark: {
        background: '#0B1426',
        surface: '#1A2332',
        surfaceVariant: '#2A3441',
        onBackground: '#FFFFFF',
        onSurface: '#E5E7EB',
        onSurfaceVariant: '#9CA3AF',
    },

    // Light Mode Colors
    light: {
        background: '#FFFFFF',
        surface: '#FAFAFA',
        surfaceVariant: '#F5F5F5',
        onBackground: '#0B1426',
        onSurface: '#1A2332',
        onSurfaceVariant: '#6B7280',
    },
};

// Modern Typography Scale
export const ModernTypography = {
    // Display Styles
    displayLarge: {
        fontSize: 57,
        lineHeight: 64,
        fontWeight: '400' as const,
        letterSpacing: -0.25,
    },
    displayMedium: {
        fontSize: 45,
        lineHeight: 52,
        fontWeight: '400' as const,
        letterSpacing: 0,
    },
    displaySmall: {
        fontSize: 36,
        lineHeight: 44,
        fontWeight: '400' as const,
        letterSpacing: 0,
    },

    // Headline Styles
    headlineLarge: {
        fontSize: 32,
        lineHeight: 40,
        fontWeight: '600' as const,
        letterSpacing: 0,
    },
    headlineMedium: {
        fontSize: 28,
        lineHeight: 36,
        fontWeight: '600' as const,
        letterSpacing: 0,
    },
    headlineSmall: {
        fontSize: 24,
        lineHeight: 32,
        fontWeight: '600' as const,
        letterSpacing: 0,
    },

    // Title Styles
    titleLarge: {
        fontSize: 22,
        lineHeight: 28,
        fontWeight: '600' as const,
        letterSpacing: 0,
    },
    titleMedium: {
        fontSize: 16,
        lineHeight: 24,
        fontWeight: '600' as const,
        letterSpacing: 0.15,
    },
    titleSmall: {
        fontSize: 14,
        lineHeight: 20,
        fontWeight: '600' as const,
        letterSpacing: 0.1,
    },

    // Body Styles
    bodyLarge: {
        fontSize: 16,
        lineHeight: 24,
        fontWeight: '400' as const,
        letterSpacing: 0.15,
    },
    bodyMedium: {
        fontSize: 14,
        lineHeight: 20,
        fontWeight: '400' as const,
        letterSpacing: 0.25,
    },
    bodySmall: {
        fontSize: 12,
        lineHeight: 16,
        fontWeight: '400' as const,
        letterSpacing: 0.4,
    },

    // Label Styles
    labelLarge: {
        fontSize: 14,
        lineHeight: 20,
        fontWeight: '600' as const,
        letterSpacing: 0.1,
    },
    labelMedium: {
        fontSize: 12,
        lineHeight: 16,
        fontWeight: '600' as const,
        letterSpacing: 0.5,
    },
    labelSmall: {
        fontSize: 11,
        lineHeight: 16,
        fontWeight: '600' as const,
        letterSpacing: 0.5,
    },

    // Financial Specific
    currency: {
        fontSize: 24,
        lineHeight: 32,
        fontWeight: '700' as const,
        letterSpacing: -0.5,
        fontFamily: Platform.select({
            ios: 'SF Pro Display',
            android: 'Roboto',
            default: 'System',
        }),
    },

    // Monospace for addresses/hashes
    monospace: {
        fontSize: 12,
        lineHeight: 16,
        fontWeight: '400' as const,
        letterSpacing: 0.5,
        fontFamily: Platform.select({
            ios: 'SF Mono',
            android: 'Roboto Mono',
            default: 'monospace',
        }),
    },
};

// Modern Spacing Scale (8pt grid)
export const ModernSpacing = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
    xxxl: 64,
};

// Modern Border Radius
export const ModernBorderRadius = {
    none: 0,
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
    full: 9999,
};

// Modern Shadows (Material Design 3)
export const ModernShadows = {
    none: {
        shadowColor: 'transparent',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0,
        shadowRadius: 0,
        elevation: 0,
        boxShadow: 'none',
    },

    sm: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
    },

    md: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 3,
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    },

    lg: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.15,
        shadowRadius: 15,
        elevation: 5,
        boxShadow: '0 10px 15px rgba(0, 0, 0, 0.15)',
    },

    xl: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 20 },
        shadowOpacity: 0.25,
        shadowRadius: 25,
        elevation: 8,
        boxShadow: '0 20px 25px rgba(0, 0, 0, 0.25)',
    },
};

// Glassmorphism Effects
export const Glassmorphism = {
    light: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },

    medium: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        backdropFilter: 'blur(15px)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },

    dark: {
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        backdropFilter: 'blur(10px)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
};

// Professional Gradients
export const ModernGradients = {
    primary: ['#0090F4', '#007CD1'],
    success: ['#00D4AA', '#00B894'],
    warning: ['#FFB800', '#E6A600'],
    error: ['#FF0000', '#E60000'],
    neutral: ['#F5F5F5', '#E5E5E5'],
    dark: ['#0B1426', '#1A2332'],
    light: ['#FFFFFF', '#FAFAFA'],
};

// Animation Durations
export const ModernAnimations = {
    fast: 150,
    normal: 300,
    slow: 500,
    slower: 700,
};

// Layout Constants
export const ModernLayout = {
    screenPadding: 16,
    cardPadding: 20,
    sectionSpacing: 24,
    headerHeight: 60,
    tabBarHeight: 80,
    borderRadius: 16,
};
