import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { ModernColors, ModernTypography, ModernShadows, ModernGradients } from '@/constants/modernDesignTokens';

interface ThemeContextType {
    isDark: boolean;
    toggleTheme: () => void;
    colors: typeof ModernColors;
    typography: typeof ModernTypography;
    shadows: typeof ModernShadows;
    gradients: typeof ModernGradients;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useModernTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useModernTheme must be used within a ModernThemeProvider');
    }
    return context;
};

interface ModernThemeProviderProps {
    children: React.ReactNode;
}

export const ModernThemeProvider: React.FC<ModernThemeProviderProps> = ({ children }) => {
    const systemColorScheme = useColorScheme();
    const [isDark, setIsDark] = useState(systemColorScheme === 'dark');

    const toggleTheme = () => {
        setIsDark(prev => !prev);
    };

    // Auto-sync with system theme
    useEffect(() => {
        if (systemColorScheme) {
            setIsDark(systemColorScheme === 'dark');
        }
    }, [systemColorScheme]);

    const theme = {
        isDark,
        toggleTheme,
        colors: ModernColors,
        typography: ModernTypography,
        shadows: ModernShadows,
        gradients: ModernGradients,
    };

    return (
        <ThemeContext.Provider value={theme}>
            {children}
        </ThemeContext.Provider>
    );
};
