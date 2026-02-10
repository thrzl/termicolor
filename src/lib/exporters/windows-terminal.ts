/**
 * Windows Terminal color scheme export functionality.
 */

import type { ColorScheme } from '@/types/color';
import { rgbToHex } from '../color/conversion';

/**
 * Windows Terminal color scheme JSON structure.
 *
 * Note: Windows Terminal uses "purple" instead of "magenta" for the
 * corresponding ANSI colors.
 */
export interface WindowsTerminalScheme {
  _generator: string;
  name: string;
  background: string;
  foreground: string;
  cursorColor: string;
  selectionBackground: string;
  black: string;
  red: string;
  green: string;
  yellow: string;
  blue: string;
  purple: string;
  cyan: string;
  white: string;
  brightBlack: string;
  brightRed: string;
  brightGreen: string;
  brightYellow: string;
  brightBlue: string;
  brightPurple: string;
  brightCyan: string;
  brightWhite: string;
}

/**
 * Generates a Windows Terminal color scheme object.
 *
 * :param scheme: The color scheme to export.
 * :param name: Name for the Windows Terminal scheme.
 * :returns: Windows Terminal scheme object ready for JSON serialization.
 */
export function generateWindowsTerminalScheme(
  scheme: ColorScheme,
  name: string
): WindowsTerminalScheme {
  return {
    _generator: 'Termicolor (https://termicolor.io)',
    name,
    background: rgbToHex(scheme.ui.background),
    foreground: rgbToHex(scheme.ui.foreground),
    cursorColor: rgbToHex(scheme.ui.cursor),
    selectionBackground: rgbToHex(scheme.ui.selection),
    black: rgbToHex(scheme.ansi.black),
    red: rgbToHex(scheme.ansi.red),
    green: rgbToHex(scheme.ansi.green),
    yellow: rgbToHex(scheme.ansi.yellow),
    blue: rgbToHex(scheme.ansi.blue),
    purple: rgbToHex(scheme.ansi.magenta),
    cyan: rgbToHex(scheme.ansi.cyan),
    white: rgbToHex(scheme.ansi.white),
    brightBlack: rgbToHex(scheme.ansi.brightBlack),
    brightRed: rgbToHex(scheme.ansi.brightRed),
    brightGreen: rgbToHex(scheme.ansi.brightGreen),
    brightYellow: rgbToHex(scheme.ansi.brightYellow),
    brightBlue: rgbToHex(scheme.ansi.brightBlue),
    brightPurple: rgbToHex(scheme.ansi.brightMagenta),
    brightCyan: rgbToHex(scheme.ansi.brightCyan),
    brightWhite: rgbToHex(scheme.ansi.brightWhite),
  };
}

/**
 * Generates Windows Terminal color scheme JSON string.
 *
 * :param scheme: The color scheme to export.
 * :param name: Name for the Windows Terminal scheme.
 * :returns: Formatted JSON string for the color scheme.
 */
export function generateWindowsTerminalJson(
  scheme: ColorScheme,
  name: string
): string {
  const wtScheme = generateWindowsTerminalScheme(scheme, name);
  return JSON.stringify(wtScheme, null, 2);
}

/**
 * Downloads a Windows Terminal color scheme file.
 *
 * :param scheme: The color scheme to download.
 * :param filename: Name for the downloaded file (without extension).
 */
export function downloadWindowsTerminalScheme(
  scheme: ColorScheme,
  filename: string
): void {
  const content = generateWindowsTerminalJson(scheme, filename);
  const blob = new Blob([content], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  URL.revokeObjectURL(url);
}
