import { describe, it, expect } from 'vitest';
import {
  generateWindowsTerminalScheme,
  generateWindowsTerminalJson,
} from './windows-terminal';
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

describe('generateWindowsTerminalScheme', () => {
  it('includes scheme name', () => {
    const scheme = generateWindowsTerminalScheme(TEST_SCHEME, 'My Theme');

    expect(scheme.name).toBe('My Theme');
  });

  it('includes UI colors', () => {
    const scheme = generateWindowsTerminalScheme(TEST_SCHEME, 'Test');

    expect(scheme.background).toBe('#1e1e1e');
    expect(scheme.foreground).toBe('#dcdcdc');
    expect(scheme.cursorColor).toBe('#ffffff');
    expect(scheme.selectionBackground).toBe('#6464c8');
  });

  it('includes normal ANSI colors', () => {
    const scheme = generateWindowsTerminalScheme(TEST_SCHEME, 'Test');

    expect(scheme.black).toBe('#000000');
    expect(scheme.red).toBe('#ff0000');
    expect(scheme.green).toBe('#00ff00');
    expect(scheme.yellow).toBe('#ffff00');
    expect(scheme.blue).toBe('#0000ff');
    expect(scheme.cyan).toBe('#00ffff');
    expect(scheme.white).toBe('#ffffff');
  });

  it('maps magenta to purple (Windows Terminal naming)', () => {
    const scheme = generateWindowsTerminalScheme(TEST_SCHEME, 'Test');

    expect(scheme.purple).toBe('#ff00ff');
    expect(scheme.brightPurple).toBe('#ff80ff');
    // Should not have magenta property
    expect(scheme).not.toHaveProperty('magenta');
    expect(scheme).not.toHaveProperty('brightMagenta');
  });

  it('includes bright colors', () => {
    const scheme = generateWindowsTerminalScheme(TEST_SCHEME, 'Test');

    expect(scheme.brightBlack).toBe('#808080');
    expect(scheme.brightRed).toBe('#ff8080');
    expect(scheme.brightGreen).toBe('#80ff80');
    expect(scheme.brightYellow).toBe('#ffff80');
    expect(scheme.brightBlue).toBe('#8080ff');
    expect(scheme.brightCyan).toBe('#80ffff');
    expect(scheme.brightWhite).toBe('#ffffff');
  });
});

describe('generateWindowsTerminalJson', () => {
  it('returns valid JSON', () => {
    const json = generateWindowsTerminalJson(TEST_SCHEME, 'Test');

    expect(() => JSON.parse(json)).not.toThrow();
  });

  it('includes formatted output', () => {
    const json = generateWindowsTerminalJson(TEST_SCHEME, 'Test');

    // Should be pretty-printed with indentation
    expect(json).toContain('\n');
    expect(json).toContain('  ');
  });

  it('parses back to matching scheme object', () => {
    const json = generateWindowsTerminalJson(TEST_SCHEME, 'My Theme');
    const parsed = JSON.parse(json);

    expect(parsed.name).toBe('My Theme');
    expect(parsed.background).toBe('#1e1e1e');
    expect(parsed.black).toBe('#000000');
    expect(parsed.purple).toBe('#ff00ff');
  });

  it('uses correct property names', () => {
    const json = generateWindowsTerminalJson(TEST_SCHEME, 'Test');
    const parsed = JSON.parse(json);

    // Windows Terminal specific names
    expect(parsed).toHaveProperty('cursorColor');
    expect(parsed).toHaveProperty('selectionBackground');
    expect(parsed).toHaveProperty('purple');
    expect(parsed).toHaveProperty('brightPurple');
  });
});
