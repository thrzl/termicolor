import { describe, it, expect } from 'vitest';
import { generateKittyConf } from './kitty';
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

describe('generateKittyConf', () => {
  it('generates header comment with scheme name', () => {
    const conf = generateKittyConf(TEST_SCHEME, 'Test Theme');

    expect(conf).toContain('# Kitty Color Scheme: Test Theme');
  });

  it('includes foreground and background colors', () => {
    const conf = generateKittyConf(TEST_SCHEME, 'Test');

    expect(conf).toContain('foreground #dcdcdc');
    expect(conf).toContain('background #1e1e1e');
  });

  it('includes cursor colors', () => {
    const conf = generateKittyConf(TEST_SCHEME, 'Test');

    expect(conf).toContain('cursor #ffffff');
    expect(conf).toContain('cursor_text_color #000000');
  });

  it('includes selection colors', () => {
    const conf = generateKittyConf(TEST_SCHEME, 'Test');

    expect(conf).toContain('selection_foreground #ffffff');
    expect(conf).toContain('selection_background #6464c8');
  });

  it('includes normal colors (color0-color7)', () => {
    const conf = generateKittyConf(TEST_SCHEME, 'Test');

    expect(conf).toContain('color0 #000000');
    expect(conf).toContain('color1 #ff0000');
    expect(conf).toContain('color2 #00ff00');
    expect(conf).toContain('color3 #ffff00');
    expect(conf).toContain('color4 #0000ff');
    expect(conf).toContain('color5 #ff00ff');
    expect(conf).toContain('color6 #00ffff');
    expect(conf).toContain('color7 #ffffff');
  });

  it('includes bright colors (color8-color15)', () => {
    const conf = generateKittyConf(TEST_SCHEME, 'Test');

    expect(conf).toContain('color8 #808080');
    expect(conf).toContain('color9 #ff8080');
    expect(conf).toContain('color10 #80ff80');
    expect(conf).toContain('color11 #ffff80');
    expect(conf).toContain('color12 #8080ff');
    expect(conf).toContain('color13 #ff80ff');
    expect(conf).toContain('color14 #80ffff');
    expect(conf).toContain('color15 #ffffff');
  });

  it('includes section comments', () => {
    const conf = generateKittyConf(TEST_SCHEME, 'Test');

    expect(conf).toContain('# Normal colors');
    expect(conf).toContain('# Bright colors');
  });

  it('uses space separator between key and value', () => {
    const conf = generateKittyConf(TEST_SCHEME, 'Test');

    // Kitty uses space, not equals sign
    expect(conf).toMatch(/^foreground #/m);
    expect(conf).not.toContain('foreground=');
  });
});
