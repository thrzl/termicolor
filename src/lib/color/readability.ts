/**
 * Readability utilities for ensuring color contrast meets accessibility standards.
 */

import type { RGBColor, ColorScheme, ANSIColorName, UIColorName } from '@/types/color';
import { getContrastRatio, adjustLuminosity, rgbToHsl } from './conversion';

/** WCAG contrast ratio thresholds. */
export const CONTRAST_THRESHOLDS = {
  /** Minimum for WCAG AA normal text. */
  AA_NORMAL: 4.5,
  /** Minimum for WCAG AA large text. */
  AA_LARGE: 3.0,
  /** Minimum for WCAG AAA normal text. */
  AAA_NORMAL: 7.0,
  /** Minimum for WCAG AAA large text. */
  AAA_LARGE: 4.5,
} as const;

/** Contrast level rating. */
export type ContrastLevel = 'poor' | 'fair' | 'good' | 'excellent';

/**
 * Gets the contrast level based on ratio.
 *
 * :param ratio: Contrast ratio value.
 * :returns: Contrast level rating.
 */
export function getContrastLevel(ratio: number): ContrastLevel {
  if (ratio >= CONTRAST_THRESHOLDS.AAA_NORMAL) return 'excellent';
  if (ratio >= CONTRAST_THRESHOLDS.AA_NORMAL) return 'good';
  if (ratio >= CONTRAST_THRESHOLDS.AA_LARGE) return 'fair';
  return 'poor';
}

/**
 * Gets a color for displaying contrast level.
 *
 * :param level: Contrast level.
 * :returns: Color string for the level.
 */
export function getContrastLevelColor(level: ContrastLevel): string {
  switch (level) {
    case 'excellent':
      return 'green';
    case 'good':
      return 'blue';
    case 'fair':
      return 'yellow';
    case 'poor':
      return 'red';
  }
}

/** Contrast info for a single color. */
export interface ContrastInfo {
  ratio: number;
  level: ContrastLevel;
  meetsAA: boolean;
  meetsAAA: boolean;
}

/**
 * Calculates contrast info for a color against background.
 *
 * :param color: Foreground color.
 * :param background: Background color.
 * :returns: Contrast info object.
 */
export function getContrastInfo(color: RGBColor, background: RGBColor): ContrastInfo {
  const ratio = getContrastRatio(color, background);
  return {
    ratio,
    level: getContrastLevel(ratio),
    meetsAA: ratio >= CONTRAST_THRESHOLDS.AA_NORMAL,
    meetsAAA: ratio >= CONTRAST_THRESHOLDS.AAA_NORMAL,
  };
}

/**
 * Adjusts a color to meet minimum contrast ratio against background.
 *
 * :param color: Color to adjust.
 * :param background: Background color to contrast against.
 * :param minRatio: Minimum contrast ratio to achieve.
 * :param maxIterations: Maximum adjustment iterations.
 * :returns: Adjusted color meeting the contrast requirement.
 */
export function adjustForContrast(
  color: RGBColor,
  background: RGBColor,
  minRatio: number = CONTRAST_THRESHOLDS.AA_NORMAL,
  maxIterations: number = 20
): RGBColor {
  let currentColor = { ...color };
  let currentRatio = getContrastRatio(currentColor, background);

  if (currentRatio >= minRatio) {
    return currentColor;
  }

  // Determine if we need to lighten or darken based on background luminosity
  const bgHsl = rgbToHsl(background);
  const isLightBg = bgHsl.l > 50;

  // Adjust in the direction that increases contrast
  const step = isLightBg ? -5 : 5;

  for (let i = 0; i < maxIterations && currentRatio < minRatio; i++) {
    currentColor = adjustLuminosity(currentColor, step);
    currentRatio = getContrastRatio(currentColor, background);

    // Check if we've hit the limits (pure black or white)
    const hsl = rgbToHsl(currentColor);
    if (hsl.l <= 0 || hsl.l >= 100) {
      break;
    }
  }

  // If still not meeting ratio after going one direction, try the other
  if (currentRatio < minRatio) {
    currentColor = { ...color };
    const reverseStep = -step;

    for (let i = 0; i < maxIterations && currentRatio < minRatio; i++) {
      currentColor = adjustLuminosity(currentColor, reverseStep);
      currentRatio = getContrastRatio(currentColor, background);

      const hsl = rgbToHsl(currentColor);
      if (hsl.l <= 0 || hsl.l >= 100) {
        break;
      }
    }
  }

  return currentColor;
}

/** Readability report for a color scheme. */
export interface ReadabilityReport {
  /** Overall readability score (0-100). */
  score: number;
  /** Number of colors meeting AA standard. */
  passAA: number;
  /** Number of colors meeting AAA standard. */
  passAAA: number;
  /** Total colors checked. */
  total: number;
  /** Individual contrast info for ANSI colors. */
  ansiContrast: Record<ANSIColorName, ContrastInfo>;
  /** Individual contrast info for UI colors. */
  uiContrast: Partial<Record<UIColorName, ContrastInfo>>;
  /** Whether the scheme has been modified since last auto-fix. */
  schemeModified?: boolean;
}

/**
 * Generates a readability report for a color scheme.
 *
 * :param scheme: Color scheme to analyze.
 * :returns: Readability report.
 */
export function analyzeReadability(scheme: ColorScheme): ReadabilityReport {
  const background = scheme.ui.background;
  const ansiContrast: Record<string, ContrastInfo> = {};
  const uiContrast: Partial<Record<UIColorName, ContrastInfo>> = {};

  let passAA = 0;
  let passAAA = 0;
  let total = 0;
  let scoreSum = 0;

  // Check all ANSI colors against background
  for (const [name, color] of Object.entries(scheme.ansi)) {
    const info = getContrastInfo(color, background);
    ansiContrast[name] = info;

    if (info.meetsAA) passAA++;
    if (info.meetsAAA) passAAA++;
    total++;

    // Score contribution (normalized to 0-100 scale)
    // Max expected ratio is ~21 (black on white), normalize to contribute up to 100/total per color
    scoreSum += Math.min(info.ratio / CONTRAST_THRESHOLDS.AA_NORMAL, 2) * 50;
  }

  // Check foreground against background
  const fgInfo = getContrastInfo(scheme.ui.foreground, background);
  uiContrast.foreground = fgInfo;
  if (fgInfo.meetsAA) passAA++;
  if (fgInfo.meetsAAA) passAAA++;
  total++;
  scoreSum += Math.min(fgInfo.ratio / CONTRAST_THRESHOLDS.AA_NORMAL, 2) * 50;

  // Check cursor against background
  const cursorInfo = getContrastInfo(scheme.ui.cursor, background);
  uiContrast.cursor = cursorInfo;
  if (cursorInfo.meetsAA) passAA++;
  if (cursorInfo.meetsAAA) passAAA++;
  total++;
  scoreSum += Math.min(cursorInfo.ratio / CONTRAST_THRESHOLDS.AA_NORMAL, 2) * 50;

  const score = Math.round(scoreSum / total);

  return {
    score: Math.min(100, score),
    passAA,
    passAAA,
    total,
    ansiContrast: ansiContrast as Record<ANSIColorName, ContrastInfo>,
    uiContrast,
  };
}

/** Options for the ensureReadability function. */
export interface EnsureReadabilityOptions {
  /** Minimum contrast ratio to achieve. */
  minRatio?: number;
  /** If true, keep the background color fixed and only adjust foreground colors. */
  keepBackground?: boolean;
}

/**
 * Adjusts a color scheme to ensure all colors meet minimum contrast.
 * Uses a smart strategy: considers adjusting background if it would
 * reduce overall changes needed (unless keepBackground is true).
 *
 * :param scheme: Color scheme to adjust.
 * :param options: Options for the adjustment (minRatio, keepBackground).
 * :returns: Adjusted color scheme.
 */
export function ensureReadability(
  scheme: ColorScheme,
  options: EnsureReadabilityOptions | number = CONTRAST_THRESHOLDS.AA_NORMAL
): ColorScheme {
  // Support legacy signature: ensureReadability(scheme, minRatio)
  const opts: EnsureReadabilityOptions =
    typeof options === 'number' ? { minRatio: options } : options;
  const minRatio = opts.minRatio ?? CONTRAST_THRESHOLDS.AA_NORMAL;
  const keepBackground = opts.keepBackground ?? false;

  const adjustedUi = { ...scheme.ui };
  let background = scheme.ui.background;

  // Collect all foreground colors that need to contrast with background
  const fgColors = [
    ...Object.values(scheme.ansi),
    scheme.ui.foreground,
    scheme.ui.cursor,
  ];

  // Count how many colors fail contrast
  const failingColors = fgColors.filter(
    (c) => getContrastRatio(c, background) < minRatio
  );

  // If more than half fail, try adjusting the background first (unless keepBackground)
  if (!keepBackground && failingColors.length > fgColors.length * 0.4) {
    const bgHsl = rgbToHsl(background);
    const isLightBg = bgHsl.l > 50;

    // Try small background adjustments to improve overall contrast
    let bestBackground = background;
    let bestFailCount = failingColors.length;

    // Try adjusting background luminosity in small steps
    for (let step = 1; step <= 10; step++) {
      // Try darkening (for dark themes) or lightening (for light themes)
      const adjustment = isLightBg ? step * 3 : -step * 3;
      const testBg = adjustLuminosity(background, adjustment);

      // Count how many would still fail
      const stillFailing = fgColors.filter(
        (c) => getContrastRatio(c, testBg) < minRatio
      ).length;

      if (stillFailing < bestFailCount) {
        bestFailCount = stillFailing;
        bestBackground = testBg;
      }

      // If we fixed most issues, stop
      if (stillFailing <= 2) break;
    }

    // Use the improved background
    background = bestBackground;
    adjustedUi.background = background;
  }

  // Now adjust remaining foreground colors as needed
  const adjustedAnsi = { ...scheme.ansi };

  for (const [name, color] of Object.entries(scheme.ansi)) {
    adjustedAnsi[name as ANSIColorName] = adjustForContrast(color, background, minRatio);
  }

  // Adjust foreground
  adjustedUi.foreground = adjustForContrast(scheme.ui.foreground, background, minRatio);

  // Adjust cursor
  adjustedUi.cursor = adjustForContrast(scheme.ui.cursor, background, minRatio);

  // Adjust cursor text against cursor
  adjustedUi.cursorText = adjustForContrast(
    scheme.ui.cursorText,
    adjustedUi.cursor,
    minRatio
  );

  // Adjust selection text against selection
  adjustedUi.selectionText = adjustForContrast(
    scheme.ui.selectionText,
    scheme.ui.selection,
    minRatio
  );

  return {
    ansi: adjustedAnsi,
    ui: adjustedUi,
  };
}
