import React, { useEffect, useState } from 'react';
import type { Theme, ThemeProviderProps } from '@/lib/theme';
import {
  applyTheme,
  getStoredTheme,
  getSystemTheme,
  resolveTheme,
  setStoredTheme,
} from '@/lib/theme';
import { ThemeProviderContext } from '@/contexts/ThemeContext';

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'asubk-theme',
  ...props
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(defaultTheme);
  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = useState(false);

  // Get resolved theme (actual theme to apply)
  const resolvedTheme = resolveTheme(theme, systemTheme);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    setStoredTheme(storageKey, newTheme);

    // Apply theme immediately
    const resolved = resolveTheme(newTheme, systemTheme);
    applyTheme(resolved);
  };

  useEffect(() => {
    // Initialize theme from storage
    const storedTheme = getStoredTheme(storageKey);
    const currentSystemTheme = getSystemTheme();

    setThemeState(storedTheme);
    setSystemTheme(currentSystemTheme);

    // Apply initial theme
    const resolved = resolveTheme(storedTheme, currentSystemTheme);
    applyTheme(resolved);

    setMounted(true);
  }, [storageKey]);

  useEffect(() => {
    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (e: MediaQueryListEvent) => {
      const newSystemTheme = e.matches ? 'dark' : 'light';
      setSystemTheme(newSystemTheme);

      // If current theme is system, apply the new system theme
      if (theme === 'system') {
        applyTheme(newSystemTheme);
      }
    };

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(handleChange);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange);
      } else {
        mediaQuery.removeListener(handleChange);
      }
    };
  }, [theme]);

  // Apply theme when it changes
  useEffect(() => {
    if (mounted) {
      applyTheme(resolvedTheme);
    }
  }, [resolvedTheme, mounted]);

  const value = {
    theme,
    systemTheme,
    resolvedTheme,
    setTheme,
  };

  // Prevent flash of wrong theme during SSR/hydration
  if (!mounted) {
    return <div style={{ visibility: 'hidden' }}>{children}</div>;
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}
