/**
 * Hook for managing color scheme mapping and editing.
 */

import { useState, useCallback, useMemo } from 'react';
import type { ExtractedColor, ColorScheme, ANSIColorName, UIColorName, RGBColor } from '@/types/color';
import { DEFAULT_ANSI_COLORS, DEFAULT_UI_COLORS } from '@/types/color';
import { createColorScheme, toggleSchemeMode } from '@/lib/color/mapping';
import {
  analyzeReadability,
  ensureReadability,
  CONTRAST_THRESHOLDS,
  type ReadabilityReport,
} from '@/lib/color/readability';

interface UseColorMappingResult {
  /** Current color scheme. */
  scheme: ColorScheme;
  /** Whether dark mode is active. */
  isDarkMode: boolean;
  /** Minimum contrast ratio setting. */
  minContrast: number;
  /** Current readability report. */
  readabilityReport: ReadabilityReport;
  /** Generate color scheme from extracted colors. */
  generateScheme: (colors: ExtractedColor[]) => void;
  /** Toggle between dark and light mode. */
  toggleMode: () => void;
  /** Update a specific ANSI color. */
  setANSIColor: (name: ANSIColorName, color: RGBColor) => void;
  /** Update a specific UI color. */
  setUIColor: (name: UIColorName, color: RGBColor) => void;
  /** Reset scheme to defaults. */
  resetScheme: () => void;
  /** Set the entire scheme at once. */
  setScheme: (scheme: ColorScheme) => void;
  /** Set minimum contrast ratio. */
  setMinContrast: (ratio: number) => void;
  /** Auto-fix contrast issues in current scheme. */
  autoFixContrast: () => void;
}

const DEFAULT_SCHEME: ColorScheme = {
  ansi: DEFAULT_ANSI_COLORS,
  ui: DEFAULT_UI_COLORS,
};

/**
 * Hook for managing color scheme state with readability analysis.
 *
 * :returns: Scheme state and manipulation methods.
 */
export function useColorMapping(): UseColorMappingResult {
  const [scheme, setScheme] = useState<ColorScheme>(DEFAULT_SCHEME);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [minContrast, setMinContrast] = useState<number>(CONTRAST_THRESHOLDS.AA_NORMAL);

  // Compute readability report whenever scheme changes
  const readabilityReport = useMemo(() => analyzeReadability(scheme), [scheme]);

  const generateScheme = useCallback((colors: ExtractedColor[]) => {
    const newScheme = createColorScheme(colors, isDarkMode);
    setScheme(newScheme);
  }, [isDarkMode]);

  const toggleMode = useCallback(() => {
    setScheme((prev) => toggleSchemeMode(prev));
    setIsDarkMode((prev) => !prev);
  }, []);

  const setANSIColor = useCallback((name: ANSIColorName, color: RGBColor) => {
    setScheme((prev) => ({
      ...prev,
      ansi: {
        ...prev.ansi,
        [name]: color,
      },
    }));
  }, []);

  const setUIColor = useCallback((name: UIColorName, color: RGBColor) => {
    setScheme((prev) => ({
      ...prev,
      ui: {
        ...prev.ui,
        [name]: color,
      },
    }));
  }, []);

  const resetScheme = useCallback(() => {
    setScheme(DEFAULT_SCHEME);
    setIsDarkMode(true);
  }, []);

  const autoFixContrast = useCallback(() => {
    setScheme((prev) => ensureReadability(prev, minContrast));
  }, [minContrast]);

  return {
    scheme,
    isDarkMode,
    minContrast,
    readabilityReport,
    generateScheme,
    toggleMode,
    setANSIColor,
    setUIColor,
    resetScheme,
    setScheme,
    setMinContrast,
    autoFixContrast,
  };
}
