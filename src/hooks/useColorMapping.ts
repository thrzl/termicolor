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
  /** Randomize all ANSI colors. */
  randomizeColors: () => void;
  /** Randomize all UI colors. */
  randomizeUIColors: () => void;
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

  const randomizeColors = useCallback(() => {
    // Generate random HSL and convert to RGB for better color distribution
    const hslToRgb = (h: number, s: number, l: number): RGBColor => {
      const hue = h / 360;
      const sat = s / 100;
      const light = l / 100;
      let r: number, g: number, b: number;

      if (sat === 0) {
        r = g = b = light;
      } else {
        const hue2rgb = (p: number, q: number, t: number) => {
          if (t < 0) t += 1;
          if (t > 1) t -= 1;
          if (t < 1 / 6) return p + (q - p) * 6 * t;
          if (t < 1 / 2) return q;
          if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
          return p;
        };
        const q = light < 0.5 ? light * (1 + sat) : light + sat - light * sat;
        const p = 2 * light - q;
        r = hue2rgb(p, q, hue + 1 / 3);
        g = hue2rgb(p, q, hue);
        b = hue2rgb(p, q, hue - 1 / 3);
      }
      return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
    };

    // Generate random color with given lightness range
    const randomColor = (minL: number, maxL: number, satRange: [number, number] = [60, 100]): RGBColor => {
      const h = Math.random() * 360;
      const s = satRange[0] + Math.random() * (satRange[1] - satRange[0]);
      const l = minL + Math.random() * (maxL - minL);
      return hslToRgb(h, s, l);
    };

    // Generate semantically appropriate random colors
    const newAnsi: Record<ANSIColorName, RGBColor> = {
      // Normal colors - medium lightness
      black: hslToRgb(Math.random() * 360, 10 + Math.random() * 20, 10 + Math.random() * 10),
      red: randomColor(35, 50),
      green: randomColor(35, 50),
      yellow: randomColor(45, 60),
      blue: randomColor(35, 50),
      magenta: randomColor(35, 50),
      cyan: randomColor(40, 55),
      white: hslToRgb(Math.random() * 360, 5 + Math.random() * 15, 70 + Math.random() * 15),
      // Bright colors - higher lightness
      brightBlack: hslToRgb(Math.random() * 360, 10 + Math.random() * 20, 25 + Math.random() * 15),
      brightRed: randomColor(50, 65),
      brightGreen: randomColor(50, 65),
      brightYellow: randomColor(60, 75),
      brightBlue: randomColor(50, 65),
      brightMagenta: randomColor(50, 65),
      brightCyan: randomColor(55, 70),
      brightWhite: hslToRgb(Math.random() * 360, 5 + Math.random() * 10, 90 + Math.random() * 8),
    };

    setScheme((prev) => ({
      ...prev,
      ansi: newAnsi,
    }));
    setSchemeModified(true);
  }, []);

  const randomizeUIColors = useCallback(() => {
    // Generate random HSL and convert to RGB
    const hslToRgb = (h: number, s: number, l: number): RGBColor => {
      const hue = h / 360;
      const sat = s / 100;
      const light = l / 100;
      let r: number, g: number, b: number;

      if (sat === 0) {
        r = g = b = light;
      } else {
        const hue2rgb = (p: number, q: number, t: number) => {
          if (t < 0) t += 1;
          if (t > 1) t -= 1;
          if (t < 1 / 6) return p + (q - p) * 6 * t;
          if (t < 1 / 2) return q;
          if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
          return p;
        };
        const q = light < 0.5 ? light * (1 + sat) : light + sat - light * sat;
        const p = 2 * light - q;
        r = hue2rgb(p, q, hue + 1 / 3);
        g = hue2rgb(p, q, hue);
        b = hue2rgb(p, q, hue - 1 / 3);
      }
      return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
    };

    // Decide if dark or light mode randomly
    const isLightMode = Math.random() > 0.5;
    const baseHue = Math.random() * 360;

    // Generate UI colors with proper contrast relationships
    const background = hslToRgb(
      baseHue + Math.random() * 30 - 15,
      5 + Math.random() * 15,
      isLightMode ? 90 + Math.random() * 8 : 8 + Math.random() * 10
    );
    const foreground = hslToRgb(
      baseHue + Math.random() * 60 - 30,
      5 + Math.random() * 10,
      isLightMode ? 10 + Math.random() * 15 : 85 + Math.random() * 12
    );
    const cursor = hslToRgb(
      Math.random() * 360,
      60 + Math.random() * 40,
      isLightMode ? 40 + Math.random() * 20 : 60 + Math.random() * 25
    );
    const cursorText = hslToRgb(
      baseHue,
      5 + Math.random() * 10,
      isLightMode ? 90 + Math.random() * 8 : 10 + Math.random() * 10
    );
    const selection = hslToRgb(
      Math.random() * 360,
      30 + Math.random() * 40,
      isLightMode ? 70 + Math.random() * 15 : 25 + Math.random() * 20
    );
    const selectionText = hslToRgb(
      baseHue,
      5 + Math.random() * 10,
      isLightMode ? 10 + Math.random() * 15 : 85 + Math.random() * 12
    );
    const badge = hslToRgb(
      Math.random() * 360,
      60 + Math.random() * 40,
      45 + Math.random() * 20
    );

    const newUI: Record<UIColorName, RGBColor> = {
      background,
      foreground,
      cursor,
      cursorText,
      selection,
      selectionText,
      badge,
    };

    setScheme((prev) => ({
      ...prev,
      ui: newUI,
    }));
    setIsDarkMode(!isLightMode);
    setSchemeModified(true);
  }, []);

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
    randomizeColors,
    randomizeUIColors,
  };
}
