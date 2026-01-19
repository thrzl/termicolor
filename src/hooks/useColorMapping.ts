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
  /** Whether current scheme was generated in grayscale mode (low color input). */
  isGrayscale: boolean;
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
  autoFixContrast: (keepBackground?: boolean) => void;
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
  const [isGrayscale, setIsGrayscale] = useState(false);
  const [minContrast, setMinContrast] = useState<number>(CONTRAST_THRESHOLDS.AA_NORMAL);
  const [schemeModified, setSchemeModified] = useState(false);

  // Compute readability report whenever scheme changes
  const readabilityReport = useMemo(() => {
    const report = analyzeReadability(scheme);
    // Include modified flag in report for magic wand button visibility
    return { ...report, schemeModified };
  }, [scheme, schemeModified]);

  const generateScheme = useCallback((colors: ExtractedColor[]) => {
    const result = createColorScheme(colors, isDarkMode);
    setScheme(result.scheme);
    setIsGrayscale(result.isGrayscale);
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
    setSchemeModified(true);
  }, []);

  const setUIColor = useCallback((name: UIColorName, color: RGBColor) => {
    setScheme((prev) => ({
      ...prev,
      ui: {
        ...prev.ui,
        [name]: color,
      },
    }));
    setSchemeModified(true);
  }, []);

  const resetScheme = useCallback(() => {
    setScheme(DEFAULT_SCHEME);
    setIsDarkMode(true);
  }, []);

  const autoFixContrast = useCallback((keepBackground: boolean = false) => {
    setScheme((prev) => ensureReadability(prev, { minRatio: minContrast, keepBackground }));
    setSchemeModified(false);
  }, [minContrast]);

  return {
    scheme,
    isDarkMode,
    isGrayscale,
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
