/**
 * Color mapping algorithm for assigning extracted colors to iTerm2 slots.
 */

import type {
  RGBColor,
  ExtractedColor,
  ANSIColorName,
  UIColorName,
  ColorScheme,
} from '@/types/color';
import { DEFAULT_ANSI_COLORS, DEFAULT_UI_COLORS } from '@/types/color';
import { adjustLuminosity, hueDistance, rgbToHsl } from './conversion';
import { clusterByLuminosity, getSaturatedColors } from './extraction';

/** Target hues for each ANSI color (in degrees). */
const TARGET_HUES: Record<string, number> = {
  red: 0,
  yellow: 60,
  green: 120,
  cyan: 180,
  blue: 240,
  magenta: 300,
};

/** Base ANSI color names (not bright variants). */
const BASE_ANSI_COLORS: ANSIColorName[] = [
  'red',
  'green',
  'yellow',
  'blue',
  'magenta',
  'cyan',
];

/**
 * Finds the best matching color for a target hue from a palette.
 *
 * :param colors: Available colors to choose from.
 * :param targetHue: Target hue angle (0-360).
 * :param usedColors: Set of already used color hex values.
 * :returns: Best matching color or null if none suitable.
 */
function findBestHueMatch(
  colors: ExtractedColor[],
  targetHue: number,
  usedColors: Set<string>
): ExtractedColor | null {
  let bestMatch: ExtractedColor | null = null;
  let bestScore = Infinity;

  for (const color of colors) {
    if (usedColors.has(color.hex)) continue;

    const distance = hueDistance(color.hsl.h, targetHue);
    // Score combines hue distance with saturation preference (more saturated is better)
    const score = distance - color.hsl.s * 0.5;

    if (score < bestScore) {
      bestScore = score;
      bestMatch = color;
    }
  }

  return bestMatch;
}

/**
 * Maps extracted colors to ANSI color slots.
 *
 * :param colors: Extracted colors from image.
 * :returns: Record mapping ANSI color names to RGB values.
 */
export function mapToANSIColors(
  colors: ExtractedColor[]
): Record<ANSIColorName, RGBColor> {
  const result: Record<ANSIColorName, RGBColor> = { ...DEFAULT_ANSI_COLORS };
  const clusters = clusterByLuminosity(colors);
  const usedColors = new Set<string>();

  // Map black and white from luminosity extremes
  if (clusters.darks.length > 0) {
    const darkest = clusters.darks[0];
    result.black = darkest.rgb;
    usedColors.add(darkest.hex);
  }

  if (clusters.lights.length > 0) {
    const lightest = clusters.lights[clusters.lights.length - 1];
    result.white = lightest.rgb;
    usedColors.add(lightest.hex);
  }

  // Map chromatic colors by hue proximity
  // Use saturation threshold of 20 and require at least 2 saturated colors
  const trulySaturatedColors = getSaturatedColors(colors, 20);
  const hasChromatic = trulySaturatedColors.length >= 2;

  // Calculate grayscale values for fallback
  const blackL = rgbToHsl(result.black).l;
  const whiteL = rgbToHsl(result.white).l;
  const range = Math.max(whiteL - blackL, 20); // Ensure minimum range
  const grayLevels = [0.25, 0.35, 0.45, 0.55, 0.65, 0.75];

  if (hasChromatic) {
    for (let i = 0; i < BASE_ANSI_COLORS.length; i++) {
      const colorName = BASE_ANSI_COLORS[i];
      const targetHue = TARGET_HUES[colorName];
      const match = findBestHueMatch(trulySaturatedColors, targetHue, usedColors);

      if (match && match.hsl.s >= 20) {
        // Only use the match if it has good saturation
        result[colorName] = match.rgb;
        usedColors.add(match.hex);
      } else {
        // Fall back to grayscale for this slot
        const targetL = blackL + range * grayLevels[i];
        const grayValue = Math.round((targetL / 100) * 255);
        result[colorName] = { r: grayValue, g: grayValue, b: grayValue };
      }
    }
  } else {
    // Generate full grayscale palette when no chromatic colors available
    for (let i = 0; i < BASE_ANSI_COLORS.length; i++) {
      const targetL = blackL + range * grayLevels[i];
      const grayValue = Math.round((targetL / 100) * 255);
      result[BASE_ANSI_COLORS[i]] = { r: grayValue, g: grayValue, b: grayValue };
    }
  }

  // Generate bright variants by increasing luminosity
  const brightVariants: [ANSIColorName, ANSIColorName][] = [
    ['black', 'brightBlack'],
    ['red', 'brightRed'],
    ['green', 'brightGreen'],
    ['yellow', 'brightYellow'],
    ['blue', 'brightBlue'],
    ['magenta', 'brightMagenta'],
    ['cyan', 'brightCyan'],
    ['white', 'brightWhite'],
  ];

  for (const [base, bright] of brightVariants) {
    result[bright] = adjustLuminosity(result[base], 20);
  }

  return result;
}

/**
 * Maps extracted colors to UI color slots.
 *
 * :param colors: Extracted colors from image.
 * :param darkMode: Whether to use dark mode (dark background, light foreground).
 * :returns: Record mapping UI color names to RGB values.
 */
export function mapToUIColors(
  colors: ExtractedColor[],
  darkMode: boolean = true
): Record<UIColorName, RGBColor> {
  const result: Record<UIColorName, RGBColor> = { ...DEFAULT_UI_COLORS };
  const clusters = clusterByLuminosity(colors);
  const saturatedColors = getSaturatedColors(colors);

  // Background and foreground based on mode
  if (darkMode) {
    if (clusters.darks.length > 0) {
      result.background = clusters.darks[0].rgb;
    }
    if (clusters.lights.length > 0) {
      result.foreground = clusters.lights[clusters.lights.length - 1].rgb;
    }
  } else {
    if (clusters.lights.length > 0) {
      result.background = clusters.lights[clusters.lights.length - 1].rgb;
    }
    if (clusters.darks.length > 0) {
      result.foreground = clusters.darks[0].rgb;
    }
  }

  // Cursor: use dominant saturated color or foreground
  if (saturatedColors.length > 0) {
    result.cursor = saturatedColors[0].rgb;
    // Cursor text should contrast with cursor
    const cursorHsl = rgbToHsl(result.cursor);
    result.cursorText = cursorHsl.l > 50 ? { r: 0, g: 0, b: 0 } : { r: 255, g: 255, b: 255 };
  } else {
    result.cursor = result.foreground;
    result.cursorText = result.background;
  }

  // Selection: semi-transparent foreground effect (we'll just use a lighter/darker version)
  result.selection = adjustLuminosity(result.foreground, darkMode ? -30 : 30);
  result.selectionText = result.foreground;

  // Badge: use a saturated color or default to red
  if (saturatedColors.length > 0) {
    result.badge = saturatedColors[0].rgb;
  }

  return result;
}

/** Result of creating a color scheme, with metadata. */
export interface ColorSchemeResult {
  scheme: ColorScheme;
  /** Whether the scheme was generated in grayscale mode due to lack of chromatic colors. */
  isGrayscale: boolean;
}

/**
 * Creates a complete color scheme from extracted colors.
 *
 * :param colors: Extracted colors from image.
 * :param darkMode: Whether to use dark mode.
 * :returns: ColorSchemeResult with scheme and metadata.
 */
export function createColorScheme(
  colors: ExtractedColor[],
  darkMode: boolean = true
): ColorSchemeResult {
  // Use threshold of 20 for saturation and require 2+ colors for chromatic
  const saturatedColors = getSaturatedColors(colors, 20);
  const isGrayscale = saturatedColors.length < 2;

  return {
    scheme: {
      ansi: mapToANSIColors(colors),
      ui: mapToUIColors(colors, darkMode),
    },
    isGrayscale,
  };
}

/**
 * Toggles the color scheme between dark and light mode.
 *
 * :param scheme: Current color scheme.
 * :returns: New color scheme with swapped background/foreground.
 */
export function toggleSchemeMode(scheme: ColorScheme): ColorScheme {
  const newUI = { ...scheme.ui };

  // Swap background and foreground
  const temp = newUI.background;
  newUI.background = newUI.foreground;
  newUI.foreground = temp;

  // Swap cursor and cursor text
  const tempCursor = newUI.cursor;
  newUI.cursor = newUI.cursorText;
  newUI.cursorText = tempCursor;

  // Swap selection and selection text
  const tempSelection = newUI.selection;
  newUI.selection = newUI.selectionText;
  newUI.selectionText = tempSelection;

  return {
    ansi: scheme.ansi,
    ui: newUI,
  };
}
