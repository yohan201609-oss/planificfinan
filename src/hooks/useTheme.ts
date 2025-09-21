import { useState, useEffect, useCallback } from 'react';

export type ThemeMode = 'light' | 'dark' | 'auto';
export type ColorScheme = 'blue' | 'green' | 'purple' | 'red' | 'orange' | 'pink';

interface ThemeSettings {
  mode: ThemeMode;
  colorScheme: ColorScheme;
  customColors?: {
    primary?: string;
    secondary?: string;
    accent?: string;
  };
}

const DEFAULT_THEME: ThemeSettings = {
  mode: 'auto',
  colorScheme: 'blue'
};

const THEME_COLORS: Record<ColorScheme, {
  primary: string;
  primaryDark: string;
  secondary: string;
  accent: string;
}> = {
  blue: {
    primary: '#2563eb',
    primaryDark: '#1d4ed8',
    secondary: '#3b82f6',
    accent: '#60a5fa'
  },
  green: {
    primary: '#059669',
    primaryDark: '#047857',
    secondary: '#10b981',
    accent: '#34d399'
  },
  purple: {
    primary: '#7c3aed',
    primaryDark: '#6d28d9',
    secondary: '#8b5cf6',
    accent: '#a78bfa'
  },
  red: {
    primary: '#dc2626',
    primaryDark: '#b91c1c',
    secondary: '#ef4444',
    accent: '#f87171'
  },
  orange: {
    primary: '#ea580c',
    primaryDark: '#c2410c',
    secondary: '#f97316',
    accent: '#fb923c'
  },
  pink: {
    primary: '#db2777',
    primaryDark: '#be185d',
    secondary: '#ec4899',
    accent: '#f472b6'
  }
};

export const useTheme = () => {
  const [theme, setTheme] = useState<ThemeSettings>(DEFAULT_THEME);
  const [isDark, setIsDark] = useState(false);
  const [systemPrefersDark, setSystemPrefersDark] = useState(false);

  // Load theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('planificfinan-theme');
    if (savedTheme) {
      try {
        setTheme({ ...DEFAULT_THEME, ...JSON.parse(savedTheme) });
      } catch (error) {
        console.error('Error parsing saved theme:', error);
      }
    }
  }, []);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setSystemPrefersDark(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setSystemPrefersDark(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Determine if dark mode should be active
  useEffect(() => {
    const shouldBeDark = theme.mode === 'dark' || 
                        (theme.mode === 'auto' && systemPrefersDark);
    setIsDark(shouldBeDark);
  }, [theme.mode, systemPrefersDark]);

  // Apply theme to CSS variables
  useEffect(() => {
    const root = document.documentElement;
    const colors = THEME_COLORS[theme.colorScheme];

    // Apply color scheme
    root.style.setProperty('--primary-blue', colors.primary);
    root.style.setProperty('--primary-blue-dark', colors.primaryDark);
    root.style.setProperty('--secondary-blue', colors.secondary);
    root.style.setProperty('--accent-blue', colors.accent);

    // Apply custom colors if provided
    if (theme.customColors) {
      if (theme.customColors.primary) {
        root.style.setProperty('--primary-blue', theme.customColors.primary);
      }
      if (theme.customColors.secondary) {
        root.style.setProperty('--secondary-blue', theme.customColors.secondary);
      }
      if (theme.customColors.accent) {
        root.style.setProperty('--accent-blue', theme.customColors.accent);
      }
    }

    // Apply dark mode
    if (isDark) {
      root.classList.add('dark-mode');
    } else {
      root.classList.remove('dark-mode');
    }
  }, [theme, isDark]);

  // Save theme to localStorage
  useEffect(() => {
    localStorage.setItem('planificfinan-theme', JSON.stringify(theme));
  }, [theme]);

  // Update theme settings
  const updateTheme = useCallback((newTheme: Partial<ThemeSettings>) => {
    setTheme(prev => ({ ...prev, ...newTheme }));
  }, []);

  // Toggle dark mode
  const toggleDarkMode = useCallback(() => {
    const newMode = theme.mode === 'dark' ? 'light' : 'dark';
    updateTheme({ mode: newMode });
  }, [theme.mode, updateTheme]);

  // Set color scheme
  const setColorScheme = useCallback((colorScheme: ColorScheme) => {
    updateTheme({ colorScheme });
  }, [updateTheme]);

  // Set custom colors
  const setCustomColors = useCallback((customColors: ThemeSettings['customColors']) => {
    updateTheme({ customColors });
  }, [updateTheme]);

  // Reset to default theme
  const resetTheme = useCallback(() => {
    setTheme(DEFAULT_THEME);
  }, []);

  // Get current colors
  const getCurrentColors = useCallback(() => {
    return THEME_COLORS[theme.colorScheme];
  }, [theme.colorScheme]);

  // Get theme classes for components
  const getThemeClasses = useCallback(() => {
    const classes = [`theme-${theme.colorScheme}`];
    if (isDark) classes.push('dark-mode');
    return classes.join(' ');
  }, [theme.colorScheme, isDark]);

  return {
    // State
    theme,
    isDark,
    systemPrefersDark,
    
    // Actions
    updateTheme,
    toggleDarkMode,
    setColorScheme,
    setCustomColors,
    resetTheme,
    
    // Utilities
    getCurrentColors,
    getThemeClasses,
    
    // Constants
    THEME_COLORS,
    availableColorSchemes: Object.keys(THEME_COLORS) as ColorScheme[]
  };
};
