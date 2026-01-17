/**
 * Color types for the termicolor application.
 */

/** RGB color representation with values 0-255. */
export interface RGBColor {
  r: number;
  g: number;
  b: number;
}

/** HSL color representation. */
export interface HSLColor {
  h: number; // 0-360
  s: number; // 0-100
  l: number; // 0-100
}

/** RGB color with values normalized to 0-1 (for iTerm2 plist). */
export interface NormalizedRGBColor {
  r: number;
  g: number;
  b: number;
}

/** An extracted color with metadata. */
export interface ExtractedColor {
  rgb: RGBColor;
  hsl: HSLColor;
  hex: string;
  population: number;
}

/** The 16 ANSI color slot names. */
export type ANSIColorName =
  | 'black'
  | 'red'
  | 'green'
  | 'yellow'
  | 'blue'
  | 'magenta'
  | 'cyan'
  | 'white'
  | 'brightBlack'
  | 'brightRed'
  | 'brightGreen'
  | 'brightYellow'
  | 'brightBlue'
  | 'brightMagenta'
  | 'brightCyan'
  | 'brightWhite';

/** UI color slot names for iTerm2. */
export type UIColorName =
  | 'background'
  | 'foreground'
  | 'cursor'
  | 'cursorText'
  | 'selection'
  | 'selectionText'
  | 'badge';

/** All iTerm2 color slot names. */
export type ColorSlotName = ANSIColorName | UIColorName;

/** Target hue angles for ANSI colors (used in mapping). */
export const ANSI_TARGET_HUES: Record<string, number> = {
  red: 0,
  yellow: 60,
  green: 120,
  cyan: 180,
  blue: 240,
  magenta: 300,
};

/** The complete color scheme for iTerm2. */
export interface ColorScheme {
  ansi: Record<ANSIColorName, RGBColor>;
  ui: Record<UIColorName, RGBColor>;
}

/** Default ANSI colors for fallback. */
export const DEFAULT_ANSI_COLORS: Record<ANSIColorName, RGBColor> = {
  black: { r: 0, g: 0, b: 0 },
  red: { r: 204, g: 0, b: 0 },
  green: { r: 0, g: 204, b: 0 },
  yellow: { r: 204, g: 204, b: 0 },
  blue: { r: 0, g: 0, b: 204 },
  magenta: { r: 204, g: 0, b: 204 },
  cyan: { r: 0, g: 204, b: 204 },
  white: { r: 204, g: 204, b: 204 },
  brightBlack: { r: 102, g: 102, b: 102 },
  brightRed: { r: 255, g: 0, b: 0 },
  brightGreen: { r: 0, g: 255, b: 0 },
  brightYellow: { r: 255, g: 255, b: 0 },
  brightBlue: { r: 0, g: 0, b: 255 },
  brightMagenta: { r: 255, g: 0, b: 255 },
  brightCyan: { r: 0, g: 255, b: 255 },
  brightWhite: { r: 255, g: 255, b: 255 },
};

/** Default UI colors for fallback. */
export const DEFAULT_UI_COLORS: Record<UIColorName, RGBColor> = {
  background: { r: 0, g: 0, b: 0 },
  foreground: { r: 255, g: 255, b: 255 },
  cursor: { r: 255, g: 255, b: 255 },
  cursorText: { r: 0, g: 0, b: 0 },
  selection: { r: 255, g: 255, b: 255 },
  selectionText: { r: 0, g: 0, b: 0 },
  badge: { r: 255, g: 0, b: 0 },
};
