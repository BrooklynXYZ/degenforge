import { Platform } from 'react-native';

// UNIFIED DESIGN TOKENS
// Hybrid brutalist + modern design system

// ========================================
// COLORS
// ========================================

export const Colors = {
  // Base colors (brutalist foundation)
  base: {
    black: '#0A0A0A',
    white: '#FFFFFF',
    transparent: 'transparent',
  },

  // Neutral scale
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

  // Accent colors (with modern touches)
  accent: {
    primary: '#EAC119',       // Gold accent
    secondary: '#00BFA6',     // Teal
    tertiary: '#0066FF',      // Blue
    neon: '#00FF88',          // Neon green for positive changes
  },

  // Semantic colors
  semantic: {
    success: '#22C55E',
    successBg: '#F0FFF4',
    successBorder: '#22C55E',

    warning: '#F59E0B',
    warningBg: '#FFFBEB',
    warningBorder: '#F59E0B',

    error: '#EF4444',
    errorBg: '#FEF2F2',
    errorBorder: '#EF4444',

    info: '#3B82F6',
    infoBg: '#EFF6FF',
    infoBorder: '#3B82F6',

    pending: '#F59E0B',
    confirmed: '#22C55E',
    failed: '#EF4444',
  },

  // Background colors
  bg: {
    primary: '#FAFAFA',
    secondary: '#FFFFFF',
    tertiary: '#F5F5F5',
    overlay: 'rgba(10, 10, 10, 0.5)',
    modal: 'rgba(10, 10, 10, 0.7)',
    card: '#0A0A0A',          // Dark card backgrounds
    cardLight: '#FFFFFF',
  },

  // Text colors
  text: {
    primary: '#000000',
    secondary: '#666666',
    tertiary: '#999999',
    inverse: '#FFFFFF',
    disabled: '#CCCCCC',
  },

  // Border colors (brutalist emphasis)
  border: {
    primary: '#000000',
    secondary: '#E5E5E5',
    tertiary: '#F5F5F5',
    accent: '#EAC119',
  },

  // Dark mode colors
  dark: {
    background: '#0A0A0A',
    surface: '#1A1A1A',
    surfaceVariant: '#262626',
    border: '#404040',
    text: {
      primary: '#FFFFFF',
      secondary: '#A3A3A3',
      tertiary: '#737373',
    },
  },
};

// ========================================
// TYPOGRAPHY
// ========================================

export const Typography = {
  // Display styles (for large numbers, hero text)
  display: {
    large: {
      fontSize: 72,
      lineHeight: 80,
      fontWeight: '700' as const,
      letterSpacing: -1.5,
      fontFamily: 'SpaceGrotesk_700Bold',
    },
    medium: {
      fontSize: 56,
      lineHeight: 64,
      fontWeight: '700' as const,
      letterSpacing: -1,
      fontFamily: 'SpaceGrotesk_700Bold',
    },
    small: {
      fontSize: 38,
      lineHeight: 44,
      fontWeight: '700' as const,
      letterSpacing: -0.5,
      fontFamily: 'SpaceGrotesk_700Bold',
    },
  },

  // Headings
  h1: {
    fontSize: 32,
    lineHeight: 40,
    fontWeight: '700' as const,
    letterSpacing: -0.4,
    fontFamily: 'SpaceGrotesk_700Bold',
  },
  h2: {
    fontSize: 28,
    lineHeight: 36,
    fontWeight: '700' as const,
    letterSpacing: -0.3,
    fontFamily: 'SpaceGrotesk_700Bold',
  },
  h3: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '700' as const,
    letterSpacing: -0.2,
    fontFamily: 'SpaceGrotesk_700Bold',
  },
  h4: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '700' as const,
    letterSpacing: -0.2,
    fontFamily: 'SpaceGrotesk_700Bold',
  },
  h5: {
    fontSize: 18,
    lineHeight: 26,
    fontWeight: '600' as const,
    letterSpacing: -0.1,
    fontFamily: 'SpaceGrotesk_600SemiBold',
  },

  // Body text
  body: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400' as const,
    letterSpacing: 0,
    fontFamily: 'SpaceGrotesk_400Regular',
  },
  bodyMedium: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '500' as const,
    letterSpacing: 0,
    fontFamily: 'SpaceGrotesk_500Medium',
  },
  bodySemibold: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600' as const,
    letterSpacing: 0,
    fontFamily: 'SpaceGrotesk_600SemiBold',
  },
  bodySmall: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400' as const,
    letterSpacing: 0,
    fontFamily: 'SpaceGrotesk_400Regular',
  },
  bodySmallMedium: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500' as const,
    letterSpacing: 0,
    fontFamily: 'SpaceGrotesk_500Medium',
  },
  bodySmallSemibold: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600' as const,
    letterSpacing: 0,
    fontFamily: 'SpaceGrotesk_600SemiBold',
  },

  // Caption/small text
  caption: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400' as const,
    letterSpacing: 0.2,
    fontFamily: 'SpaceGrotesk_400Regular',
  },
  captionMedium: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500' as const,
    letterSpacing: 0.2,
    fontFamily: 'SpaceGrotesk_500Medium',
  },
  captionSemibold: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600' as const,
    letterSpacing: 0.5,
    fontFamily: 'SpaceGrotesk_600SemiBold',
  },

  // Labels (uppercase, bold)
  label: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '700' as const,
    letterSpacing: 1,
    fontFamily: 'SpaceGrotesk_700Bold',
  },
  labelMedium: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600' as const,
    letterSpacing: 0.8,
    fontFamily: 'SpaceGrotesk_600SemiBold',
  },
  labelSmall: {
    fontSize: 10,
    lineHeight: 12,
    fontWeight: '600' as const,
    letterSpacing: 0.5,
    fontFamily: 'SpaceGrotesk_600SemiBold',
  },

  // Button text
  button: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '700' as const,
    letterSpacing: 0.8,
    fontFamily: 'SpaceGrotesk_700Bold',
  },
  buttonSmall: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600' as const,
    letterSpacing: 0.6,
    fontFamily: 'SpaceGrotesk_600SemiBold',
  },

  // Monospace (for addresses, hashes)
  mono: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400' as const,
    letterSpacing: 0.3,
    fontFamily: Platform.select({
      ios: 'Courier',
      android: 'monospace',
      default: 'monospace',
    }),
  },
};

// Font families
export const FontFamily = {
  light: 'SpaceGrotesk_300Light',
  regular: 'SpaceGrotesk_400Regular',
  medium: 'SpaceGrotesk_500Medium',
  semibold: 'SpaceGrotesk_600SemiBold',
  bold: 'SpaceGrotesk_700Bold',
};

// ========================================
// SPACING (8pt grid system)
// ========================================

export const Spacing = {
  xxxs: 2,
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 48,
  xxxxl: 64,
  xxxxxl: 96,
};

// ========================================
// BORDER RADIUS (brutalist = minimal)
// ========================================

export const BorderRadius = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  pill: 100,
  circle: 9999,
};

// ========================================
// SHADOWS (subtle, modern touches)
// ========================================

export const Shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  xs: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sm: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  xl: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  xxl: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 12,
  },
  // Brutalist shadow for hero cards
  brutal: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 12,
  },
};

// ========================================
// BORDERS (brutalist emphasis)
// ========================================

export const Borders = {
  width: {
    none: 0,
    thin: 1,
    regular: 1.5,
    thick: 2,
    bold: 3,
    heavy: 4,
  },
  style: {
    solid: 'solid' as const,
    dashed: 'dashed' as const,
  },
};

// ========================================
// ANIMATIONS (smooth but purposeful)
// ========================================

export const Animations = {
  duration: {
    instant: 100,
    fast: 150,
    normal: 250,
    medium: 350,
    slow: 500,
    slower: 700,
    slowest: 1000,
  },
  easing: {
    linear: 'linear',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
    spring: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },
};

// ========================================
// LAYOUT CONSTANTS
// ========================================

export const Layout = {
  screenPadding: 20,
  cardPadding: 24,
  sectionSpacing: 32,

  // Navigation
  bottomNav: {
    height: 60,
    borderWidth: 2,
  },

  // Cards
  cardBorderRadius: 24,
  cardBorderWidth: 2,

  // Modals
  modalBorderRadius: 20,
  modalPadding: 24,

  // Inputs
  inputHeight: 56,
  inputBorderRadius: 0,
  inputBorderWidth: 2,

  // Buttons
  buttonHeight: {
    sm: 36,
    md: 48,
    lg: 56,
  },
  buttonBorderRadius: 0,
  buttonBorderWidth: 2,

  // Icons
  iconSize: {
    xs: 16,
    sm: 20,
    md: 24,
    lg: 32,
    xl: 40,
    xxl: 48,
  },
};

// ========================================
// BREAKPOINTS (responsive design)
// ========================================

export const Breakpoints = {
  xs: 320,
  sm: 375,
  md: 414,
  lg: 768,
  xl: 1024,
  xxl: 1280,
};

// ========================================
// Z-INDEX (layer management)
// ========================================

export const ZIndex = {
  base: 0,
  dropdown: 100,
  sticky: 200,
  fixed: 300,
  overlay: 400,
  modal: 500,
  popover: 600,
  tooltip: 700,
  notification: 800,
  max: 9999,
};

// ========================================
// OPACITY (for states and overlays)
// ========================================

export const Opacity = {
  disabled: 0.5,
  hover: 0.8,
  pressed: 0.6,
  overlay: {
    light: 0.1,
    medium: 0.3,
    heavy: 0.5,
    solid: 0.7,
  },
};
