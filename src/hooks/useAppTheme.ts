/**
 * Hook for managing app theme (light/dark).
 * Persists to localStorage and respects system preference.
 */

import { useState, useEffect, useCallback, useRef } from 'react';

type Theme = 'light' | 'dark';

const STORAGE_KEY = 'termicolor-theme';

/**
 * Gets the initial theme from localStorage or system preference.
 */
function getInitialTheme(): Theme {
  // Check localStorage first
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') {
      return stored;
    }
    // Fall back to system preference
    if (window.matchMedia('(prefers-color-scheme: light)').matches) {
      return 'light';
    }
  }
  return 'dark';
}

/**
 * Hook for managing app theme with localStorage persistence.
 */
export function useAppTheme() {
  const [theme, setThemeState] = useState<Theme>(getInitialTheme);

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  // Listen for system preference changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: light)');
    const handleChange = (e: MediaQueryListEvent) => {
      // Only auto-switch if user hasn't explicitly set a preference
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        setThemeState(e.matches ? 'light' : 'dark');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const isAnimating = useRef(false);

  const toggleTheme = useCallback((coords?: { x: number; y: number; slow?: boolean }) => {
    if (isAnimating.current) return;

    const x = coords?.x ?? window.innerWidth / 2;
    const y = coords?.y ?? window.innerHeight / 2;
    const root = document.documentElement;
    root.style.setProperty('--toggle-x', `${x}px`);
    root.style.setProperty('--toggle-y', `${y}px`);

    // Direction: dark→light expands, light→dark contracts
    const direction = theme === 'dark' ? 'expand' : 'contract';
    root.setAttribute('data-theme-direction', direction);

    // Slow mode for long-press cinematic transition
    root.style.setProperty('--transition-duration', coords?.slow ? '1.5s' : '0.5s');

    if (document.startViewTransition) {
      isAnimating.current = true;
      const transition = document.startViewTransition(() => {
        setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark'));
      });
      transition.finished.finally(() => {
        isAnimating.current = false;
      });
    } else {
      setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark'));
    }
  }, [theme]);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
  }, []);

  return {
    theme,
    isDark: theme === 'dark',
    isLight: theme === 'light',
    toggleTheme,
    setTheme,
  };
}
