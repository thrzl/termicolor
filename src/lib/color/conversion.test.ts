import { describe, it, expect } from 'vitest';
import {
  rgbToHsl,
  hslToRgb,
  rgbToHex,
  hexToRgb,
  getContrastRatio,
  hueDistance,
  normalizeRgb,
  adjustLuminosity,
  getRelativeLuminance,
} from './conversion';

describe('rgbToHsl', () => {
  it('converts pure red', () => {
    expect(rgbToHsl({ r: 255, g: 0, b: 0 })).toEqual({ h: 0, s: 100, l: 50 });
  });

  it('converts pure green', () => {
    expect(rgbToHsl({ r: 0, g: 255, b: 0 })).toEqual({ h: 120, s: 100, l: 50 });
  });

  it('converts pure blue', () => {
    expect(rgbToHsl({ r: 0, g: 0, b: 255 })).toEqual({ h: 240, s: 100, l: 50 });
  });

  it('converts white', () => {
    expect(rgbToHsl({ r: 255, g: 255, b: 255 })).toEqual({ h: 0, s: 0, l: 100 });
  });

  it('converts black', () => {
    expect(rgbToHsl({ r: 0, g: 0, b: 0 })).toEqual({ h: 0, s: 0, l: 0 });
  });

  it('converts gray', () => {
    const result = rgbToHsl({ r: 128, g: 128, b: 128 });
    expect(result.h).toBe(0);
    expect(result.s).toBe(0);
    expect(result.l).toBeCloseTo(50, 0);
  });

  it('converts yellow', () => {
    expect(rgbToHsl({ r: 255, g: 255, b: 0 })).toEqual({ h: 60, s: 100, l: 50 });
  });

  it('converts cyan', () => {
    expect(rgbToHsl({ r: 0, g: 255, b: 255 })).toEqual({ h: 180, s: 100, l: 50 });
  });

  it('converts magenta', () => {
    expect(rgbToHsl({ r: 255, g: 0, b: 255 })).toEqual({ h: 300, s: 100, l: 50 });
  });
});

describe('hslToRgb', () => {
  it('converts pure red', () => {
    expect(hslToRgb({ h: 0, s: 100, l: 50 })).toEqual({ r: 255, g: 0, b: 0 });
  });

  it('converts pure green', () => {
    expect(hslToRgb({ h: 120, s: 100, l: 50 })).toEqual({ r: 0, g: 255, b: 0 });
  });

  it('converts pure blue', () => {
    expect(hslToRgb({ h: 240, s: 100, l: 50 })).toEqual({ r: 0, g: 0, b: 255 });
  });

  it('converts white', () => {
    expect(hslToRgb({ h: 0, s: 0, l: 100 })).toEqual({ r: 255, g: 255, b: 255 });
  });

  it('converts black', () => {
    expect(hslToRgb({ h: 0, s: 0, l: 0 })).toEqual({ r: 0, g: 0, b: 0 });
  });

  it('converts gray (saturation 0)', () => {
    const result = hslToRgb({ h: 180, s: 0, l: 50 });
    expect(result.r).toBeCloseTo(128, 0);
    expect(result.g).toBeCloseTo(128, 0);
    expect(result.b).toBeCloseTo(128, 0);
  });
});

describe('rgbToHex', () => {
  it('converts black to #000000', () => {
    expect(rgbToHex({ r: 0, g: 0, b: 0 })).toBe('#000000');
  });

  it('converts white to #ffffff', () => {
    expect(rgbToHex({ r: 255, g: 255, b: 255 })).toBe('#ffffff');
  });

  it('converts red to #ff0000', () => {
    expect(rgbToHex({ r: 255, g: 0, b: 0 })).toBe('#ff0000');
  });

  it('converts green to #00ff00', () => {
    expect(rgbToHex({ r: 0, g: 255, b: 0 })).toBe('#00ff00');
  });

  it('converts blue to #0000ff', () => {
    expect(rgbToHex({ r: 0, g: 0, b: 255 })).toBe('#0000ff');
  });

  it('pads single digit hex values', () => {
    expect(rgbToHex({ r: 1, g: 2, b: 3 })).toBe('#010203');
  });

  it('clamps values above 255', () => {
    expect(rgbToHex({ r: 300, g: 255, b: 255 })).toBe('#ffffff');
  });

  it('clamps negative values to 0', () => {
    expect(rgbToHex({ r: -10, g: 0, b: 0 })).toBe('#000000');
  });
});

describe('hexToRgb', () => {
  it('converts #000000 to black', () => {
    expect(hexToRgb('#000000')).toEqual({ r: 0, g: 0, b: 0 });
  });

  it('converts #ffffff to white', () => {
    expect(hexToRgb('#ffffff')).toEqual({ r: 255, g: 255, b: 255 });
  });

  it('converts #ff0000 to red', () => {
    expect(hexToRgb('#ff0000')).toEqual({ r: 255, g: 0, b: 0 });
  });

  it('converts without hash prefix', () => {
    expect(hexToRgb('00ff00')).toEqual({ r: 0, g: 255, b: 0 });
  });

  it('converts uppercase hex', () => {
    expect(hexToRgb('#AABBCC')).toEqual({ r: 170, g: 187, b: 204 });
  });
});

describe('normalizeRgb', () => {
  it('normalizes black', () => {
    expect(normalizeRgb({ r: 0, g: 0, b: 0 })).toEqual({ r: 0, g: 0, b: 0 });
  });

  it('normalizes white', () => {
    expect(normalizeRgb({ r: 255, g: 255, b: 255 })).toEqual({ r: 1, g: 1, b: 1 });
  });

  it('normalizes mid-gray', () => {
    const result = normalizeRgb({ r: 128, g: 128, b: 128 });
    expect(result.r).toBeCloseTo(0.502, 2);
    expect(result.g).toBeCloseTo(0.502, 2);
    expect(result.b).toBeCloseTo(0.502, 2);
  });
});

describe('getRelativeLuminance', () => {
  it('returns 0 for black', () => {
    expect(getRelativeLuminance({ r: 0, g: 0, b: 0 })).toBe(0);
  });

  it('returns 1 for white', () => {
    expect(getRelativeLuminance({ r: 255, g: 255, b: 255 })).toBe(1);
  });

  it('returns value between 0 and 1 for colors', () => {
    const luminance = getRelativeLuminance({ r: 128, g: 128, b: 128 });
    expect(luminance).toBeGreaterThan(0);
    expect(luminance).toBeLessThan(1);
  });
});

describe('getContrastRatio', () => {
  it('returns 21 for black and white', () => {
    const ratio = getContrastRatio(
      { r: 0, g: 0, b: 0 },
      { r: 255, g: 255, b: 255 }
    );
    expect(ratio).toBe(21);
  });

  it('returns 1 for identical colors', () => {
    const ratio = getContrastRatio(
      { r: 128, g: 128, b: 128 },
      { r: 128, g: 128, b: 128 }
    );
    expect(ratio).toBe(1);
  });

  it('returns same ratio regardless of order', () => {
    const ratio1 = getContrastRatio(
      { r: 255, g: 0, b: 0 },
      { r: 0, g: 0, b: 0 }
    );
    const ratio2 = getContrastRatio(
      { r: 0, g: 0, b: 0 },
      { r: 255, g: 0, b: 0 }
    );
    expect(ratio1).toBe(ratio2);
  });

  it('returns ratio greater than 1 for different colors', () => {
    const ratio = getContrastRatio(
      { r: 255, g: 255, b: 0 },
      { r: 0, g: 0, b: 128 }
    );
    expect(ratio).toBeGreaterThan(1);
  });
});

describe('hueDistance', () => {
  it('returns 0 for same hue', () => {
    expect(hueDistance(120, 120)).toBe(0);
  });

  it('returns direct distance for nearby hues', () => {
    expect(hueDistance(10, 30)).toBe(20);
  });

  it('returns wrapped distance across 360/0 boundary', () => {
    expect(hueDistance(350, 10)).toBe(20);
  });

  it('returns max 180 for opposite hues', () => {
    expect(hueDistance(0, 180)).toBe(180);
  });

  it('handles order independence', () => {
    expect(hueDistance(30, 10)).toBe(20);
    expect(hueDistance(10, 350)).toBe(20);
  });
});

describe('adjustLuminosity', () => {
  it('lightens a dark color', () => {
    const original = { r: 50, g: 50, b: 50 };
    const adjusted = adjustLuminosity(original, 20);
    const originalHsl = rgbToHsl(original);
    const adjustedHsl = rgbToHsl(adjusted);
    expect(adjustedHsl.l).toBeGreaterThan(originalHsl.l);
  });

  it('darkens a light color', () => {
    const original = { r: 200, g: 200, b: 200 };
    const adjusted = adjustLuminosity(original, -20);
    const originalHsl = rgbToHsl(original);
    const adjustedHsl = rgbToHsl(adjusted);
    expect(adjustedHsl.l).toBeLessThan(originalHsl.l);
  });

  it('clamps luminosity at 100', () => {
    const original = { r: 250, g: 250, b: 250 };
    const adjusted = adjustLuminosity(original, 50);
    const adjustedHsl = rgbToHsl(adjusted);
    expect(adjustedHsl.l).toBeLessThanOrEqual(100);
  });

  it('clamps luminosity at 0', () => {
    const original = { r: 10, g: 10, b: 10 };
    const adjusted = adjustLuminosity(original, -50);
    const adjustedHsl = rgbToHsl(adjusted);
    expect(adjustedHsl.l).toBeGreaterThanOrEqual(0);
  });
});
