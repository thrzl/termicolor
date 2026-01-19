import { describe, it, expect } from 'vitest';
import {
  getContrastLevel,
  getContrastInfo,
  adjustForContrast,
  CONTRAST_THRESHOLDS,
} from './readability';
import { getContrastRatio } from './conversion';

describe('getContrastLevel', () => {
  it('returns poor for ratios below 3', () => {
    expect(getContrastLevel(2.5)).toBe('poor');
    expect(getContrastLevel(1)).toBe('poor');
  });

  it('returns fair for ratios between 3 and 4.5', () => {
    expect(getContrastLevel(3)).toBe('fair');
    expect(getContrastLevel(4)).toBe('fair');
  });

  it('returns good for ratios between 4.5 and 7', () => {
    expect(getContrastLevel(4.5)).toBe('good');
    expect(getContrastLevel(6)).toBe('good');
  });

  it('returns excellent for ratios 7 and above', () => {
    expect(getContrastLevel(7)).toBe('excellent');
    expect(getContrastLevel(21)).toBe('excellent');
  });
});

describe('getContrastInfo', () => {
  it('returns correct info for high contrast', () => {
    const white = { r: 255, g: 255, b: 255 };
    const black = { r: 0, g: 0, b: 0 };
    const info = getContrastInfo(white, black);

    expect(info.ratio).toBe(21);
    expect(info.level).toBe('excellent');
    expect(info.meetsAA).toBe(true);
    expect(info.meetsAAA).toBe(true);
  });

  it('returns correct info for low contrast', () => {
    const gray1 = { r: 100, g: 100, b: 100 };
    const gray2 = { r: 120, g: 120, b: 120 };
    const info = getContrastInfo(gray1, gray2);

    expect(info.ratio).toBeLessThan(CONTRAST_THRESHOLDS.AA_LARGE);
    expect(info.level).toBe('poor');
    expect(info.meetsAA).toBe(false);
    expect(info.meetsAAA).toBe(false);
  });

  it('identifies AA compliance without AAA', () => {
    // Black on lighter gray: contrast ~5.9 (meets AA 4.5 but not AAA 7.0)
    const foreground = { r: 0, g: 0, b: 0 };
    const background = { r: 140, g: 140, b: 140 };
    const info = getContrastInfo(foreground, background);

    expect(info.ratio).toBeGreaterThanOrEqual(4.5);
    expect(info.ratio).toBeLessThan(7);
    expect(info.meetsAA).toBe(true);
    expect(info.meetsAAA).toBe(false);
  });
});

describe('adjustForContrast', () => {
  it('returns original color if already meeting ratio', () => {
    const white = { r: 255, g: 255, b: 255 };
    const black = { r: 0, g: 0, b: 0 };
    const adjusted = adjustForContrast(white, black);

    expect(adjusted).toEqual(white);
  });

  it('adjusts color to meet minimum contrast against dark background', () => {
    const lowContrast = { r: 50, g: 50, b: 50 };
    const darkBg = { r: 30, g: 30, b: 30 };
    const adjusted = adjustForContrast(lowContrast, darkBg);

    const ratio = getContrastRatio(adjusted, darkBg);
    expect(ratio).toBeGreaterThanOrEqual(CONTRAST_THRESHOLDS.AA_NORMAL);
  });

  it('adjusts color to meet minimum contrast against light background', () => {
    const lowContrast = { r: 200, g: 200, b: 200 };
    const lightBg = { r: 240, g: 240, b: 240 };
    const adjusted = adjustForContrast(lowContrast, lightBg);

    const ratio = getContrastRatio(adjusted, lightBg);
    expect(ratio).toBeGreaterThanOrEqual(CONTRAST_THRESHOLDS.AA_NORMAL);
  });

  it('respects custom minimum ratio', () => {
    const lowContrast = { r: 100, g: 100, b: 100 };
    const background = { r: 0, g: 0, b: 0 };
    const customRatio = 7;
    const adjusted = adjustForContrast(lowContrast, background, customRatio);

    const ratio = getContrastRatio(adjusted, background);
    expect(ratio).toBeGreaterThanOrEqual(customRatio);
  });

  it('preserves hue when adjusting colorful colors', () => {
    const red = { r: 150, g: 50, b: 50 };
    const darkBg = { r: 100, g: 30, b: 30 };
    const adjusted = adjustForContrast(red, darkBg);

    // The adjusted color should still be reddish (r > g and r > b)
    expect(adjusted.r).toBeGreaterThanOrEqual(adjusted.g);
    expect(adjusted.r).toBeGreaterThanOrEqual(adjusted.b);
  });
});
