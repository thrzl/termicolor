/**
 * Color conversion utilities.
 */

import type { RGBColor, HSLColor, NormalizedRGBColor } from '@/types/color';

/**
 * Converts RGB color to HSL.
 *
 * :param rgb: RGB color with values 0-255.
 * :returns: HSL color with h: 0-360, s: 0-100, l: 0-100.
 */
export function rgbToHsl(rgb: RGBColor): HSLColor {
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;

  if (max === min) {
    return { h: 0, s: 0, l: l * 100 };
  }

  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

  let h: number;
  switch (max) {
    case r:
      h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
      break;
    case g:
      h = ((b - r) / d + 2) / 6;
      break;
    default:
      h = ((r - g) / d + 4) / 6;
      break;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

/**
 * Converts HSL color to RGB.
 *
 * :param hsl: HSL color with h: 0-360, s: 0-100, l: 0-100.
 * :returns: RGB color with values 0-255.
 */
export function hslToRgb(hsl: HSLColor): RGBColor {
  const h = hsl.h / 360;
  const s = hsl.s / 100;
  const l = hsl.l / 100;

  if (s === 0) {
    const gray = Math.round(l * 255);
    return { r: gray, g: gray, b: gray };
  }

  const hue2rgb = (p: number, q: number, t: number): number => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };

  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;

  return {
    r: Math.round(hue2rgb(p, q, h + 1 / 3) * 255),
    g: Math.round(hue2rgb(p, q, h) * 255),
    b: Math.round(hue2rgb(p, q, h - 1 / 3) * 255),
  };
}

/**
 * Converts RGB color to hex string.
 *
 * :param rgb: RGB color with values 0-255.
 * :returns: Hex color string (e.g., "#ff0000").
 */
export function rgbToHex(rgb: RGBColor): string {
  const toHex = (n: number): string => {
    const hex = Math.max(0, Math.min(255, Math.round(n))).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`;
}

/**
 * Converts hex string to RGB color.
 *
 * :param hex: Hex color string (with or without #).
 * :returns: RGB color with values 0-255.
 */
export function hexToRgb(hex: string): RGBColor {
  const cleanHex = hex.replace(/^#/, '');
  const bigint = parseInt(cleanHex, 16);
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255,
  };
}

/**
 * Normalizes RGB values from 0-255 to 0-1 range.
 *
 * :param rgb: RGB color with values 0-255.
 * :returns: RGB color with values 0-1.
 */
export function normalizeRgb(rgb: RGBColor): NormalizedRGBColor {
  return {
    r: rgb.r / 255,
    g: rgb.g / 255,
    b: rgb.b / 255,
  };
}

/**
 * Adjusts the luminosity of an RGB color.
 *
 * :param rgb: RGB color to adjust.
 * :param amount: Amount to adjust luminosity by (-100 to 100).
 * :returns: Adjusted RGB color.
 */
export function adjustLuminosity(rgb: RGBColor, amount: number): RGBColor {
  const hsl = rgbToHsl(rgb);
  hsl.l = Math.max(0, Math.min(100, hsl.l + amount));
  return hslToRgb(hsl);
}

/**
 * Calculates the relative luminance of a color (for contrast calculations).
 *
 * :param rgb: RGB color.
 * :returns: Relative luminance value between 0 and 1.
 */
export function getRelativeLuminance(rgb: RGBColor): number {
  const srgbToLinear = (c: number): number => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };

  const r = srgbToLinear(rgb.r);
  const g = srgbToLinear(rgb.g);
  const b = srgbToLinear(rgb.b);

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Calculates the contrast ratio between two colors.
 *
 * :param color1: First RGB color.
 * :param color2: Second RGB color.
 * :returns: Contrast ratio (1 to 21).
 */
export function getContrastRatio(color1: RGBColor, color2: RGBColor): number {
  const l1 = getRelativeLuminance(color1);
  const l2 = getRelativeLuminance(color2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Calculates hue distance between two hue values.
 *
 * :param h1: First hue (0-360).
 * :param h2: Second hue (0-360).
 * :returns: Angular distance between hues (0-180).
 */
export function hueDistance(h1: number, h2: number): number {
  const diff = Math.abs(h1 - h2);
  return Math.min(diff, 360 - diff);
}
