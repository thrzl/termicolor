/**
 * Encode/decode color schemes to/from URL-safe strings.
 */

import type { ColorScheme, RGBColor, ANSIColorName, UIColorName } from '@/types/color';
import { ANSI_COLOR_ORDER, UI_COLOR_ORDER } from '@/lib/iterm/schema';

/**
 * Converts RGB to hex without the # prefix.
 */
function rgbToHex(color: RGBColor): string {
  const toHex = (n: number) => Math.max(0, Math.min(255, n)).toString(16).padStart(2, '0');
  return `${toHex(color.r)}${toHex(color.g)}${toHex(color.b)}`;
}

/**
 * Converts hex string to RGB.
 */
function hexToRgb(hex: string): RGBColor {
  return {
    r: parseInt(hex.slice(0, 2), 16),
    g: parseInt(hex.slice(2, 4), 16),
    b: parseInt(hex.slice(4, 6), 16),
  };
}

/**
 * Encodes a color scheme to a compact URL-safe string.
 * Format: 23 colors as concatenated hex values (138 chars)
 * Order: 16 ANSI colors + 7 UI colors
 */
export function encodeSchemeToUrl(scheme: ColorScheme): string {
  const ansiHex = ANSI_COLOR_ORDER.map(name => rgbToHex(scheme.ansi[name])).join('');
  const uiHex = UI_COLOR_ORDER.map(name => rgbToHex(scheme.ui[name])).join('');
  return ansiHex + uiHex;
}

/**
 * Decodes a URL-safe string back to a color scheme.
 */
export function decodeSchemeFromUrl(encoded: string): ColorScheme | null {
  // Validate length: 23 colors * 6 hex chars = 138
  if (encoded.length !== 138) {
    return null;
  }

  // Validate hex characters
  if (!/^[0-9a-fA-F]+$/.test(encoded)) {
    return null;
  }

  try {
    const ansi: Partial<Record<ANSIColorName, RGBColor>> = {};
    const ui: Partial<Record<UIColorName, RGBColor>> = {};

    // Parse ANSI colors (first 16 * 6 = 96 chars)
    ANSI_COLOR_ORDER.forEach((name, index) => {
      const start = index * 6;
      ansi[name] = hexToRgb(encoded.slice(start, start + 6));
    });

    // Parse UI colors (remaining 7 * 6 = 42 chars)
    const uiStart = 96;
    UI_COLOR_ORDER.forEach((name, index) => {
      const start = uiStart + index * 6;
      ui[name] = hexToRgb(encoded.slice(start, start + 6));
    });

    return {
      ansi: ansi as Record<ANSIColorName, RGBColor>,
      ui: ui as Record<UIColorName, RGBColor>,
    };
  } catch {
    return null;
  }
}

/**
 * Creates a shareable URL with the encoded color scheme.
 */
export function createShareUrl(scheme: ColorScheme, baseUrl: string = 'https://termicolor.io'): string {
  const encoded = encodeSchemeToUrl(scheme);
  return `${baseUrl}?c=${encoded}`;
}

/**
 * Extracts and decodes a color scheme from a URL's query parameters.
 */
export function getSchemeFromUrl(url: string = window.location.href): ColorScheme | null {
  try {
    const urlObj = new URL(url);
    const encoded = urlObj.searchParams.get('c');
    if (!encoded) {
      return null;
    }
    return decodeSchemeFromUrl(encoded);
  } catch {
    return null;
  }
}
