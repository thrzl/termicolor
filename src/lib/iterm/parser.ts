/**
 * iTerm2 .itermcolors plist file parsing.
 */

import type {
  ANSIColorName,
  ColorScheme,
  RGBColor,
  UIColorName,
} from '@/types/color';
import {
  DEFAULT_ANSI_COLORS,
  DEFAULT_UI_COLORS,
} from '@/types/color';
import { PLIST_TO_ANSI, PLIST_TO_UI } from './schema';

/**
 * Error thrown when plist parsing fails.
 */
export class PlistParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PlistParseError';
  }
}

/**
 * Denormalizes RGB values from 0-1 range back to 0-255.
 *
 * :param normalized: RGB values in 0-1 range.
 * :returns: RGB color with values 0-255.
 */
function denormalizeRgb(normalized: { r: number; g: number; b: number }): RGBColor {
  return {
    r: Math.round(normalized.r * 255),
    g: Math.round(normalized.g * 255),
    b: Math.round(normalized.b * 255),
  };
}

/**
 * Extracts a color dictionary from a plist dict element.
 *
 * Parses the nested dict structure containing Red/Green/Blue Component keys
 * with their real values.
 *
 * :param dictElement: The dict Element containing color components.
 * :returns: RGB color with values 0-255, or null if parsing fails.
 */
function parseColorDict(dictElement: Element): RGBColor | null {
  const children = Array.from(dictElement.children);
  const components: Record<string, number> = {};

  for (let i = 0; i < children.length - 1; i++) {
    const keyEl = children[i];
    const valueEl = children[i + 1];

    if (keyEl.tagName === 'key' && valueEl.tagName === 'real') {
      const key = keyEl.textContent?.trim() ?? '';
      const value = parseFloat(valueEl.textContent ?? '0');

      if (key === 'Red Component') {
        components.r = value;
      } else if (key === 'Green Component') {
        components.g = value;
      } else if (key === 'Blue Component') {
        components.b = value;
      }
    }
  }

  // Validate we have all required components
  if (
    typeof components.r !== 'number' ||
    typeof components.g !== 'number' ||
    typeof components.b !== 'number'
  ) {
    return null;
  }

  return denormalizeRgb(components as { r: number; g: number; b: number });
}

/**
 * Parses an iTerm2 .itermcolors XML plist string into a ColorScheme.
 *
 * Extracts color values from the plist structure, denormalizing RGB components
 * from the 0-1 range used by iTerm2 back to the standard 0-255 range.
 *
 * Missing colors are filled with default values to ensure a complete scheme.
 *
 * :param xmlContent: The XML plist content as a string.
 * :returns: A complete ColorScheme object.
 * :raises PlistParseError: If the XML is invalid or not a valid plist.
 */
export function parsePlist(xmlContent: string): ColorScheme {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlContent, 'application/xml');

  // Check for parse errors
  const parseError = doc.querySelector('parsererror');
  if (parseError) {
    throw new PlistParseError(
      `Invalid XML: ${parseError.textContent?.slice(0, 100) ?? 'Unknown error'}`
    );
  }

  // Find the root dict element
  const plist = doc.querySelector('plist');
  if (!plist) {
    throw new PlistParseError('Invalid plist: missing <plist> element');
  }

  const rootDict = plist.querySelector(':scope > dict');
  if (!rootDict) {
    throw new PlistParseError('Invalid plist: missing root <dict> element');
  }

  // Initialize with default colors
  const ansi: Record<ANSIColorName, RGBColor> = { ...DEFAULT_ANSI_COLORS };
  const ui: Record<UIColorName, RGBColor> = { ...DEFAULT_UI_COLORS };

  // Parse key-value pairs from root dict
  const rootChildren = Array.from(rootDict.children);

  for (let i = 0; i < rootChildren.length - 1; i++) {
    const keyEl = rootChildren[i];
    const valueEl = rootChildren[i + 1];

    if (keyEl.tagName !== 'key' || valueEl.tagName !== 'dict') {
      continue;
    }

    const plistKey = keyEl.textContent?.trim() ?? '';
    const color = parseColorDict(valueEl);

    if (!color) {
      continue;
    }

    // Check if this is an ANSI color
    const ansiName = PLIST_TO_ANSI[plistKey];
    if (ansiName) {
      ansi[ansiName] = color;
      continue;
    }

    // Check if this is a UI color
    const uiName = PLIST_TO_UI[plistKey];
    if (uiName) {
      ui[uiName] = color;
    }
  }

  return { ansi, ui };
}

/**
 * Reads and parses an iTerm2 .itermcolors file.
 *
 * Convenience function that reads file content and parses it as a plist.
 *
 * :param file: The File object to read.
 * :returns: Promise resolving to a ColorScheme.
 * :raises PlistParseError: If the file cannot be read or parsed.
 */
export async function parseItermcolorsFile(file: File): Promise<ColorScheme> {
  try {
    const content = await file.text();
    return parsePlist(content);
  } catch (error) {
    if (error instanceof PlistParseError) {
      throw error;
    }
    throw new PlistParseError(
      `Failed to read file: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}
