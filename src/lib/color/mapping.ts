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
  const saturatedColors = getSaturatedColors(colors, 25);
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
  for (const colorName of BASE_ANSI_COLORS) {
    const targetHue = TARGET_HUES[colorName];
    const match = findBestHueMatch(saturatedColors, targetHue, usedColors);

    if (match) {
      result[colorName] = match.rgb;
      usedColors.add(match.hex);
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

/**
 * Creates a complete color scheme from extracted colors.
 *
 * :param colors: Extracted colors from image.
 * :param darkMode: Whether to use dark mode.
 * :returns: Complete ColorScheme object.
 */
export function createColorScheme(
  colors: ExtractedColor[],
  darkMode: boolean = true
): ColorScheme {
  return {
    ansi: mapToANSIColors(colors),
    ui: mapToUIColors(colors, darkMode),
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
