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
 * :param darkMode: Whether generating for dark mode (affects black/white assignment).
 * :returns: Record mapping ANSI color names to RGB values.
 */
export function mapToANSIColors(
  colors: ExtractedColor[],
  darkMode: boolean = true
): Record<ANSIColorName, RGBColor> {
  const result: Record<ANSIColorName, RGBColor> = { ...DEFAULT_ANSI_COLORS };
  const clusters = clusterByLuminosity(colors);
  const usedColors = new Set<string>();

  // Map black and white from luminosity extremes
  // In dark mode: black=darkest (bg-like), white=lightest (readable text)
  // In light mode: swap so white=darkest (readable text on light bg)
  const darkest = clusters.darks.length > 0 ? clusters.darks[0] : null;
  const lightest = clusters.lights.length > 0 ? clusters.lights[clusters.lights.length - 1] : null;

  if (darkMode) {
    if (darkest) {
      result.black = darkest.rgb;
      usedColors.add(darkest.hex);
    }
    if (lightest) {
      result.white = lightest.rgb;
      usedColors.add(lightest.hex);
    }
  } else {
    // Light mode: swap so "white" ANSI color is dark (readable on light bg)
    if (lightest) {
      result.black = lightest.rgb;
      usedColors.add(lightest.hex);
    }
    if (darkest) {
      result.white = darkest.rgb;
      usedColors.add(darkest.hex);
    }
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

  // Sort all colors by luminosity for fallback
  const sortedByLuminosity = [...colors].sort((a, b) => a.hsl.l - b.hsl.l);
  const darkestColor = sortedByLuminosity[0];
  const lightestColor = sortedByLuminosity[sortedByLuminosity.length - 1];

  // Background and foreground based on mode
  if (darkMode) {
    // Dark mode: dark background, light foreground
    if (clusters.darks.length > 0) {
      result.background = clusters.darks[0].rgb;
    } else if (darkestColor) {
      result.background = darkestColor.rgb;
    }
    if (clusters.lights.length > 0) {
      result.foreground = clusters.lights[clusters.lights.length - 1].rgb;
    } else if (lightestColor) {
      result.foreground = lightestColor.rgb;
    }
  } else {
    // Light mode: light background, dark foreground
    if (clusters.lights.length > 0) {
      result.background = clusters.lights[clusters.lights.length - 1].rgb;
    } else if (lightestColor) {
      // Fall back to lightest available color
      result.background = lightestColor.rgb;
    }
    if (clusters.darks.length > 0) {
      result.foreground = clusters.darks[0].rgb;
    } else if (darkestColor) {
      // Fall back to darkest available color
      result.foreground = darkestColor.rgb;
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
      ansi: mapToANSIColors(colors, darkMode),
      ui: mapToUIColors(colors, darkMode),
    },
    isGrayscale,
  };
}

/**
 * Toggles the color scheme between dark and light mode.
 * Swaps UI foreground/background and ANSI black/white pairs for proper contrast.
 *
 * :param scheme: Current color scheme.
 * :returns: New color scheme with colors swapped for opposite mode.
 */
export function toggleSchemeMode(scheme: ColorScheme): ColorScheme {
  const newUI = { ...scheme.ui };
  const newANSI = { ...scheme.ansi };

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

  // Swap ANSI black/white pairs for proper contrast on opposite background
  // This ensures "white" text is dark on light bg and "black" text is light on dark bg
  const tempBlack = newANSI.black;
  newANSI.black = newANSI.white;
  newANSI.white = tempBlack;

  const tempBrightBlack = newANSI.brightBlack;
  newANSI.brightBlack = newANSI.brightWhite;
  newANSI.brightWhite = tempBrightBlack;

  return {
    ansi: newANSI,
    ui: newUI,
  };
}
