/**
 * Hook for managing color scheme mapping and editing.
 */

import { useState, useCallback, useMemo, useRef } from 'react';
import type { ExtractedColor, ColorScheme, ANSIColorName, UIColorName, RGBColor } from '@/types/color';
import { DEFAULT_ANSI_COLORS, DEFAULT_UI_COLORS } from '@/types/color';
import { createColorScheme, toggleSchemeMode } from '@/lib/color/mapping';
import {
  analyzeReadability,
  ensureReadability,
  CONTRAST_THRESHOLDS,
  type ReadabilityReport,
} from '@/lib/color/readability';
import { rgbToHsl, hslToRgb, adjustSaturation } from '@/lib/color/conversion';

/** Target hues for ANSI colors when boosting grays. */
const ANSI_TARGET_HUES: Partial<Record<ANSIColorName, number>> = {
  red: 0,
  brightRed: 0,
  green: 120,
  brightGreen: 120,
  yellow: 60,
  brightYellow: 60,
  blue: 220,
  brightBlue: 220,
  magenta: 300,
  brightMagenta: 300,
  cyan: 180,
  brightCyan: 180,
};

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
  /** Whether vibrant syntax colors mode is enabled. */
  vibrantSyntax: boolean;
  /** Saturation multiplier (1 = normal, 0.5 = half, 1.5 = 150%). */
  saturationLevel: number;
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
  /** Toggle vibrant syntax colors mode. */
  setVibrantSyntax: (enabled: boolean) => void;
  /** Set saturation level. */
  setSaturationLevel: (level: number) => void;
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
  const [vibrantSyntax, setVibrantSyntaxState] = useState(false);
  const [saturationLevel, setSaturationLevelState] = useState(1);

  // Store base ANSI colors (before saturation adjustment) so we can always recompute
  const baseAnsiColorsRef = useRef<Record<ANSIColorName, RGBColor>>(DEFAULT_ANSI_COLORS);

  /**
   * Applies vibrant syntax colors by boosting gray ANSI colors to saturated versions.
   */
  const applyVibrantSyntax = useCallback((inputScheme: ColorScheme): ColorScheme => {
    const newAnsi = { ...inputScheme.ansi };
    const minSaturation = 40;

    for (const [name, targetHue] of Object.entries(ANSI_TARGET_HUES)) {
      const colorName = name as ANSIColorName;
      const color = newAnsi[colorName];
      const hsl = rgbToHsl(color);

      if (hsl.s < minSaturation) {
        // Boost saturation and use target hue for this color slot
        hsl.h = targetHue;
        hsl.s = Math.max(minSaturation, hsl.s + 30);
        newAnsi[colorName] = hslToRgb(hsl);
      }
    }

    return { ...inputScheme, ansi: newAnsi };
  }, []);

  // Compute readability report whenever scheme changes
  const readabilityReport = useMemo(() => {
    const report = analyzeReadability(scheme);
    // Include modified flag in report for magic wand button visibility
    return { ...report, schemeModified };
  }, [scheme, schemeModified]);

  const generateScheme = useCallback((colors: ExtractedColor[]) => {
    const result = createColorScheme(colors, isDarkMode);
    baseAnsiColorsRef.current = { ...result.scheme.ansi };
    setScheme(result.scheme);
    setIsGrayscale(result.isGrayscale);
    // Reset saturation to 1 when generating new scheme
    setSaturationLevelState(1);
  }, [isDarkMode]);

  const toggleMode = useCallback(() => {
    setScheme((prev) => {
      const toggled = toggleSchemeMode(prev);
      baseAnsiColorsRef.current = { ...toggled.ansi };
      return toggled;
    });
    setIsDarkMode((prev) => !prev);
    // Reset saturation to 1 when toggling mode
    setSaturationLevelState(1);
  }, []);

  const setANSIColor = useCallback((name: ANSIColorName, color: RGBColor) => {
    // Update base colors too
    baseAnsiColorsRef.current = { ...baseAnsiColorsRef.current, [name]: color };
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
    baseAnsiColorsRef.current = { ...DEFAULT_ANSI_COLORS };
    setScheme(DEFAULT_SCHEME);
    setIsDarkMode(true);
    setSaturationLevelState(1);
  }, []);

  const autoFixContrast = useCallback((keepBackground: boolean = false) => {
    setScheme((prev) => {
      const fixed = ensureReadability(prev, { minRatio: minContrast, keepBackground });
      baseAnsiColorsRef.current = { ...fixed.ansi };
      return fixed;
    });
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

    baseAnsiColorsRef.current = { ...newAnsi };
    setScheme((prev) => ({
      ...prev,
      ansi: newAnsi,
    }));
    setSchemeModified(true);
    setSaturationLevelState(1);
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

  const setVibrantSyntax = useCallback((enabled: boolean) => {
    setVibrantSyntaxState(enabled);
    if (enabled) {
      setScheme((prev) => {
        const vibrant = applyVibrantSyntax(prev);
        // Update base colors when applying vibrant syntax
        baseAnsiColorsRef.current = { ...vibrant.ansi };
        return vibrant;
      });
      // Reset saturation when enabling vibrant syntax
      setSaturationLevelState(1);
    }
    setSchemeModified(true);
  }, [applyVibrantSyntax]);

  const setSaturationLevel = useCallback((level: number) => {
    setSaturationLevelState(level);
    // Always apply saturation from base colors to avoid cumulative errors
    setScheme((prev) => {
      const newAnsi = { ...baseAnsiColorsRef.current };
      // Apply saturation adjustment to base colors
      for (const name of Object.keys(newAnsi) as ANSIColorName[]) {
        // Skip black/white as they should stay neutral
        if (name === 'black' || name === 'white' || name === 'brightBlack' || name === 'brightWhite') {
          continue;
        }
        if (level !== 1) {
          newAnsi[name] = adjustSaturation(baseAnsiColorsRef.current[name], level);
        }
      }
      return { ...prev, ansi: newAnsi };
    });
    setSchemeModified(true);
  }, []);

  return {
    scheme,
    isDarkMode,
    isGrayscale,
    minContrast,
    readabilityReport,
    vibrantSyntax,
    saturationLevel,
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
    setVibrantSyntax,
    setSaturationLevel,
  };
}
