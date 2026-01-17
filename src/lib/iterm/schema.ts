/**
 * iTerm2 color scheme slot definitions.
 */

import type { ANSIColorName, UIColorName } from '@/types/color';

/** Mapping of ANSI color names to iTerm2 plist keys. */
export const ANSI_KEY_MAP: Record<ANSIColorName, string> = {
  black: 'Ansi 0 Color',
  red: 'Ansi 1 Color',
  green: 'Ansi 2 Color',
  yellow: 'Ansi 3 Color',
  blue: 'Ansi 4 Color',
  magenta: 'Ansi 5 Color',
  cyan: 'Ansi 6 Color',
  white: 'Ansi 7 Color',
  brightBlack: 'Ansi 8 Color',
  brightRed: 'Ansi 9 Color',
  brightGreen: 'Ansi 10 Color',
  brightYellow: 'Ansi 11 Color',
  brightBlue: 'Ansi 12 Color',
  brightMagenta: 'Ansi 13 Color',
  brightCyan: 'Ansi 14 Color',
  brightWhite: 'Ansi 15 Color',
};

/** Mapping of UI color names to iTerm2 plist keys. */
export const UI_KEY_MAP: Record<UIColorName, string> = {
  background: 'Background Color',
  foreground: 'Foreground Color',
  cursor: 'Cursor Color',
  cursorText: 'Cursor Text Color',
  selection: 'Selection Color',
  selectionText: 'Selected Text Color',
  badge: 'Badge Color',
};

/** Display names for ANSI colors. */
export const ANSI_DISPLAY_NAMES: Record<ANSIColorName, string> = {
  black: 'Black',
  red: 'Red',
  green: 'Green',
  yellow: 'Yellow',
  blue: 'Blue',
  magenta: 'Magenta',
  cyan: 'Cyan',
  white: 'White',
  brightBlack: 'Bright Black',
  brightRed: 'Bright Red',
  brightGreen: 'Bright Green',
  brightYellow: 'Bright Yellow',
  brightBlue: 'Bright Blue',
  brightMagenta: 'Bright Magenta',
  brightCyan: 'Bright Cyan',
  brightWhite: 'Bright White',
};

/** Display names for UI colors. */
export const UI_DISPLAY_NAMES: Record<UIColorName, string> = {
  background: 'Background',
  foreground: 'Foreground',
  cursor: 'Cursor',
  cursorText: 'Cursor Text',
  selection: 'Selection',
  selectionText: 'Selection Text',
  badge: 'Badge',
};

/** ANSI color indices (0-15). */
export const ANSI_COLOR_ORDER: ANSIColorName[] = [
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

/** UI color order for display. */
export const UI_COLOR_ORDER: UIColorName[] = [
  'background',
  'foreground',
  'cursor',
  'cursorText',
  'selection',
  'selectionText',
  'badge',
];

/** Reverse mapping from iTerm2 plist keys to ANSI color names. */
export const PLIST_TO_ANSI: Record<string, ANSIColorName> = {
  'Ansi 0 Color': 'black',
  'Ansi 1 Color': 'red',
  'Ansi 2 Color': 'green',
  'Ansi 3 Color': 'yellow',
  'Ansi 4 Color': 'blue',
  'Ansi 5 Color': 'magenta',
  'Ansi 6 Color': 'cyan',
  'Ansi 7 Color': 'white',
  'Ansi 8 Color': 'brightBlack',
  'Ansi 9 Color': 'brightRed',
  'Ansi 10 Color': 'brightGreen',
  'Ansi 11 Color': 'brightYellow',
  'Ansi 12 Color': 'brightBlue',
  'Ansi 13 Color': 'brightMagenta',
  'Ansi 14 Color': 'brightCyan',
  'Ansi 15 Color': 'brightWhite',
};

/** Reverse mapping from iTerm2 plist keys to UI color names. */
export const PLIST_TO_UI: Record<string, UIColorName> = {
  'Background Color': 'background',
  'Foreground Color': 'foreground',
  'Cursor Color': 'cursor',
  'Cursor Text Color': 'cursorText',
  'Selection Color': 'selection',
  'Selected Text Color': 'selectionText',
  'Badge Color': 'badge',
};
