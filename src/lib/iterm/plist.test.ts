import { describe, it, expect } from 'vitest';
import { generatePlist } from './plist';
import type { ColorScheme } from '@/types/color';

const TEST_SCHEME: ColorScheme = {
  ansi: {
    black: { r: 0, g: 0, b: 0 },
    red: { r: 255, g: 0, b: 0 },
    green: { r: 0, g: 255, b: 0 },
    yellow: { r: 255, g: 255, b: 0 },
    blue: { r: 0, g: 0, b: 255 },
    magenta: { r: 255, g: 0, b: 255 },
    cyan: { r: 0, g: 255, b: 255 },
    white: { r: 255, g: 255, b: 255 },
    brightBlack: { r: 128, g: 128, b: 128 },
    brightRed: { r: 255, g: 128, b: 128 },
    brightGreen: { r: 128, g: 255, b: 128 },
    brightYellow: { r: 255, g: 255, b: 128 },
    brightBlue: { r: 128, g: 128, b: 255 },
    brightMagenta: { r: 255, g: 128, b: 255 },
    brightCyan: { r: 128, g: 255, b: 255 },
    brightWhite: { r: 255, g: 255, b: 255 },
  },
  ui: {
    background: { r: 30, g: 30, b: 30 },
    foreground: { r: 220, g: 220, b: 220 },
    cursor: { r: 255, g: 255, b: 255 },
    cursorText: { r: 0, g: 0, b: 0 },
    selection: { r: 100, g: 100, b: 200 },
    selectionText: { r: 255, g: 255, b: 255 },
    badge: { r: 255, g: 0, b: 0 },
  },
};

describe('generatePlist', () => {
  it('generates valid XML plist structure', () => {
    const plist = generatePlist(TEST_SCHEME);

    expect(plist).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(plist).toContain('<!DOCTYPE plist');
    expect(plist).toContain('<plist version="1.0">');
    expect(plist).toContain('</plist>');
  });

  it('includes all ANSI colors', () => {
    const plist = generatePlist(TEST_SCHEME);

    expect(plist).toContain('<key>Ansi 0 Color</key>');
    expect(plist).toContain('<key>Ansi 1 Color</key>');
    expect(plist).toContain('<key>Ansi 8 Color</key>');
    expect(plist).toContain('<key>Ansi 15 Color</key>');
  });

  it('includes UI colors', () => {
    const plist = generatePlist(TEST_SCHEME);

    expect(plist).toContain('<key>Background Color</key>');
    expect(plist).toContain('<key>Foreground Color</key>');
    expect(plist).toContain('<key>Cursor Color</key>');
    expect(plist).toContain('<key>Cursor Text Color</key>');
  });

  it('normalizes RGB values to 0-1 range', () => {
    const plist = generatePlist(TEST_SCHEME);

    // Pure red (255, 0, 0) should have Red Component = 1.0
    expect(plist).toContain('<real>1.00000000</real>');
    // Black (0, 0, 0) should have components = 0.0
    expect(plist).toContain('<real>0.00000000</real>');
  });

  it('includes Alpha Component for all colors', () => {
    const plist = generatePlist(TEST_SCHEME);

    expect(plist).toContain('<key>Alpha Component</key>');
  });

  it('includes Color Space for all colors', () => {
    const plist = generatePlist(TEST_SCHEME);

    expect(plist).toContain('<key>Color Space</key>');
    expect(plist).toContain('<string>sRGB</string>');
  });

  it('correctly encodes normalized color values', () => {
    const plist = generatePlist(TEST_SCHEME);

    // Background is 30, 30, 30 -> 30/255 = 0.11764706...
    expect(plist).toContain('0.11764706');
  });

  it('generates parseable plist content', () => {
    const plist = generatePlist(TEST_SCHEME);

    // Should be valid XML that can be parsed
    const parser = new DOMParser();
    const doc = parser.parseFromString(plist, 'application/xml');
    const errorNode = doc.querySelector('parsererror');

    expect(errorNode).toBeNull();
  });
});
