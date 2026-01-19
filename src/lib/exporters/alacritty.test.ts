import { describe, it, expect } from 'vitest';
import { generateAlacrittyToml } from './alacritty';
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

describe('generateAlacrittyToml', () => {
  it('generates valid TOML structure', () => {
    const toml = generateAlacrittyToml(TEST_SCHEME);

    expect(toml).toContain('[colors.primary]');
    expect(toml).toContain('[colors.cursor]');
    expect(toml).toContain('[colors.selection]');
    expect(toml).toContain('[colors.normal]');
    expect(toml).toContain('[colors.bright]');
  });

  it('includes primary colors', () => {
    const toml = generateAlacrittyToml(TEST_SCHEME);

    expect(toml).toContain("background = '#1e1e1e'");
    expect(toml).toContain("foreground = '#dcdcdc'");
  });

  it('includes cursor colors', () => {
    const toml = generateAlacrittyToml(TEST_SCHEME);

    expect(toml).toContain("cursor = '#ffffff'");
    expect(toml).toContain("text = '#000000'");
  });

  it('includes selection colors', () => {
    const toml = generateAlacrittyToml(TEST_SCHEME);

    expect(toml).toContain("background = '#6464c8'");
    expect(toml).toContain("text = '#ffffff'");
  });

  it('includes normal ANSI colors', () => {
    const toml = generateAlacrittyToml(TEST_SCHEME);

    expect(toml).toContain("black = '#000000'");
    expect(toml).toContain("red = '#ff0000'");
    expect(toml).toContain("green = '#00ff00'");
    expect(toml).toContain("yellow = '#ffff00'");
    expect(toml).toContain("blue = '#0000ff'");
    expect(toml).toContain("magenta = '#ff00ff'");
    expect(toml).toContain("cyan = '#00ffff'");
    expect(toml).toContain("white = '#ffffff'");
  });

  it('includes bright ANSI colors', () => {
    const toml = generateAlacrittyToml(TEST_SCHEME);

    // Bright colors section
    const brightSection = toml.split('[colors.bright]')[1];
    expect(brightSection).toContain("black = '#808080'");
    expect(brightSection).toContain("red = '#ff8080'");
    expect(brightSection).toContain("green = '#80ff80'");
  });

  it('uses single quotes for hex values', () => {
    const toml = generateAlacrittyToml(TEST_SCHEME);

    // All hex values should use single quotes per TOML convention
    const hexMatches = toml.match(/'#[0-9a-f]{6}'/g) || [];
    expect(hexMatches.length).toBeGreaterThan(0);
  });

  it('outputs lowercase hex values', () => {
    const toml = generateAlacrittyToml(TEST_SCHEME);

    // Should not contain uppercase hex letters (A-F)
    expect(toml).not.toMatch(/'#[0-9a-f]*[A-F][0-9a-fA-F]*'/);
  });
});
