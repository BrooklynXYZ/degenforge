export const Colors = {
  base: {
    black: '#0B0B0B',
    white: '#FFFFFF',
  },
  neutral: {
    50: '#F6F6F6',
    100: '#EDEDED',
    200: '#E0E0E0',
    300: '#D0D0D0',
    400: '#A0A0A0',
    500: '#808080',
    600: '#606060',
    700: '#404040',
  },
  accent: {
    primary: '#00BFA6',
    secondary: '#F2C94C',
    tertiary: '#0066FF',
    light: '#E0F7F5',
    dark: '#008B7F',
  },
  semantic: {
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
    pending: '#F59E0B',
    confirmed: '#10B981',
    failed: '#EF4444',
  },
  bg: {
    primary: '#FFFFFF',
    secondary: '#F6F6F6',
    tertiary: '#EDEDED',
    overlay: 'rgba(11, 11, 11, 0.5)',
    modal: 'rgba(11, 11, 11, 0.7)',
  },
  text: {
    primary: '#0B0B0B',
    secondary: '#606060',
    tertiary: '#A0A0A0',
    inverse: '#FFFFFF',
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
};

export const Typography = {
  h1: {
    fontSize: 28,
    lineHeight: 36,
    fontWeight: '700' as const,
    letterSpacing: -0.5,
    fontFamily: 'SpaceGrotesk_700Bold',
  },
  h2: {
    fontSize: 22,
    lineHeight: 30,
    fontWeight: '700' as const,
    letterSpacing: -0.3,
    fontFamily: 'SpaceGrotesk_700Bold',
  },
  h3: {
    fontSize: 18,
    lineHeight: 26,
    fontWeight: '600' as const,
    letterSpacing: -0.2,
    fontFamily: 'SpaceGrotesk_600SemiBold',
  },
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
  caption: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400' as const,
    letterSpacing: 0.3,
    fontFamily: 'SpaceGrotesk_400Regular',
  },
  captionMedium: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500' as const,
    letterSpacing: 0.3,
    fontFamily: 'SpaceGrotesk_500Medium',
  },
  label: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '600' as const,
    letterSpacing: 0.5,
    fontFamily: 'SpaceGrotesk_600SemiBold',
  },
};

export const FontFamily = {
  light: 'SpaceGrotesk_300Light',
  regular: 'SpaceGrotesk_400Regular',
  medium: 'SpaceGrotesk_500Medium',
  semibold: 'SpaceGrotesk_600SemiBold',
  bold: 'SpaceGrotesk_700Bold',
};

export const BorderRadius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  pill: 36,
  circle: 999,
};

export const Shadows = {
  floating: {
    shadowColor: '#0B2545',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 20,
    elevation: 8,
    boxShadow: '0 6px 20px rgba(11, 37, 69, 0.06)',
  },
  card: {
    shadowColor: '#0B2545',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    boxShadow: '0 2px 8px rgba(11, 37, 69, 0.04)',
  },
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
    boxShadow: 'none',
  },
};

export const Animations = {
  fast: 150,
  normal: 200,
  slow: 300,
  stepper: 200,
};

export const Layout = {
  screenPadding: Spacing.lg,
  bottomNav: {
    height: 68,
    floatingHeight: 72,
    floatingMarginBottom: 20,
    floatingWidth: 'calc(100% - 32px)',
    centerIconSize: 56,
    centerIconElevation: 6,
    borderRadius: BorderRadius.pill,
  },
  cardPadding: Spacing.lg,
  cardBorderRadius: BorderRadius.lg,
  modalBorderRadius: 20,
  modalPadding: Spacing.lg,
};

export const Breakpoints = {
  xs: 320,
  sm: 375,
  md: 414,
  lg: 768,
  xl: 1024,
};

export const ZIndex = {
  base: 0,
  dropdown: 100,
  sticky: 200,
  fixed: 300,
  modal: 400,
  popover: 500,
  tooltip: 600,
  notification: 700,
};
