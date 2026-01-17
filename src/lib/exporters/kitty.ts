/**
 * Kitty terminal color scheme exporter.
 */

import type { ColorScheme, ANSIColorName } from '@/types/color';
import { rgbToHex } from '../color/conversion';

/**
 * Ordered list of ANSI color names mapped to Kitty color indices.
 *
 * Kitty uses color0-color15 where:
 * - color0-color7: normal colors (black, red, green, yellow, blue, magenta, cyan, white)
 * - color8-color15: bright colors
 */
const ANSI_COLOR_ORDER: ANSIColorName[] = [
  'black',
  'red',
  'green',
  'yellow',
  'blue',
  'magenta',
  'cyan',
  'white',
  'brightBlack',
  'brightRed',
  'brightGreen',
  'brightYellow',
  'brightBlue',
  'brightMagenta',
  'brightCyan',
  'brightWhite',
];

/**
 * Generates a Kitty terminal color scheme configuration file.
 *
 * :param scheme: The color scheme to export.
 * :param name: Name of the color scheme for the header comment.
 * :returns: Kitty .conf file content as a string.
 */
export function generateKittyConf(scheme: ColorScheme, name: string): string {
  const lines: string[] = [];

  // Header comment
  lines.push(`# Kitty Color Scheme: ${name}`);
  lines.push('');

  // UI colors
  lines.push(`foreground ${rgbToHex(scheme.ui.foreground)}`);
  lines.push(`background ${rgbToHex(scheme.ui.background)}`);
  lines.push('');

  // Cursor colors
  lines.push(`cursor ${rgbToHex(scheme.ui.cursor)}`);
  lines.push(`cursor_text_color ${rgbToHex(scheme.ui.cursorText)}`);
  lines.push('');

  // Selection colors
  lines.push(`selection_foreground ${rgbToHex(scheme.ui.selectionText)}`);
  lines.push(`selection_background ${rgbToHex(scheme.ui.selection)}`);
  lines.push('');

  // Normal colors (color0-color7)
  lines.push('# Normal colors');
  for (let i = 0; i < 8; i++) {
    const colorName = ANSI_COLOR_ORDER[i];
    const color = scheme.ansi[colorName];
    lines.push(`color${i} ${rgbToHex(color)}`);
  }
  lines.push('');

  // Bright colors (color8-color15)
  lines.push('# Bright colors');
  for (let i = 8; i < 16; i++) {
    const colorName = ANSI_COLOR_ORDER[i];
    const color = scheme.ansi[colorName];
    lines.push(`color${i} ${rgbToHex(color)}`);
  }

  return lines.join('\n');
}

/**
 * Downloads a Kitty color scheme configuration file.
 *
 * :param scheme: The color scheme to download.
 * :param filename: Name for the downloaded file (without extension).
 */
export function downloadKittyConf(scheme: ColorScheme, filename: string): void {
  const content = generateKittyConf(scheme, filename);
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.conf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  URL.revokeObjectURL(url);
}
