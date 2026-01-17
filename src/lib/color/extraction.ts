/**
 * Color extraction from images using ColorThief.
 */

import ColorThief from 'colorthief';
import type { RGBColor, ExtractedColor } from '@/types/color';
import { rgbToHsl, rgbToHex } from './conversion';

const colorThief = new ColorThief();

/**
 * Samples corner pixels from an image to detect background color.
 *
 * :param img: HTML image element.
 * :returns: The most common corner color as RGB, or null if sampling fails.
 */
function sampleCornerColor(img: HTMLImageElement): RGBColor | null {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  canvas.width = img.width;
  canvas.height = img.height;
  ctx.drawImage(img, 0, 0);

  // Sample corners and edges
  const samplePoints = [
    [0, 0], // top-left
    [img.width - 1, 0], // top-right
    [0, img.height - 1], // bottom-left
    [img.width - 1, img.height - 1], // bottom-right
    [Math.floor(img.width / 2), 0], // top-center
    [Math.floor(img.width / 2), img.height - 1], // bottom-center
    [0, Math.floor(img.height / 2)], // left-center
    [img.width - 1, Math.floor(img.height / 2)], // right-center
  ];

  const colorCounts = new Map<string, { rgb: RGBColor; count: number }>();

  for (const [x, y] of samplePoints) {
    const pixel = ctx.getImageData(x, y, 1, 1).data;
    const rgb: RGBColor = { r: pixel[0], g: pixel[1], b: pixel[2] };
    // Round to nearest 8 to group similar colors
    const key = `${Math.round(rgb.r / 8) * 8},${Math.round(rgb.g / 8) * 8},${Math.round(rgb.b / 8) * 8}`;

    const existing = colorCounts.get(key);
    if (existing) {
      existing.count++;
    } else {
      colorCounts.set(key, { rgb, count: 1 });
    }
  }

  // Find the most common corner color (must appear at least 3 times)
  let maxCount = 0;
  let dominantColor: RGBColor | null = null;

  for (const { rgb, count } of colorCounts.values()) {
    if (count > maxCount && count >= 3) {
      maxCount = count;
      dominantColor = rgb;
    }
  }

  return dominantColor;
}

/**
 * Checks if a color is already in the palette (within tolerance).
 */
function colorExistsInPalette(color: RGBColor, palette: ExtractedColor[], tolerance: number = 20): boolean {
  return palette.some(p =>
    Math.abs(p.rgb.r - color.r) <= tolerance &&
    Math.abs(p.rgb.g - color.g) <= tolerance &&
    Math.abs(p.rgb.b - color.b) <= tolerance
  );
}

/**
 * Extracts colors from an image element.
 *
 * :param img: HTML image element to extract colors from.
 * :param colorCount: Number of colors to extract (default 32).
 * :returns: Promise resolving to array of extracted colors.
 */
export async function extractColorsFromImage(
  img: HTMLImageElement,
  colorCount: number = 32
): Promise<ExtractedColor[]> {
  // Ensure image is loaded
  if (!img.complete) {
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = reject;
    });
  }

  // Extract palette using ColorThief
  const palette = colorThief.getPalette(img, colorCount, 10);

  if (!palette) {
    return [];
  }

  // Convert to ExtractedColor objects with metadata
  const colors: ExtractedColor[] = palette.map((color, index) => {
    const rgb: RGBColor = { r: color[0], g: color[1], b: color[2] };
    const hsl = rgbToHsl(rgb);
    return {
      rgb,
      hsl,
      hex: rgbToHex(rgb),
      // ColorThief returns colors sorted by prevalence, so we use index as proxy for population
      population: colorCount - index,
    };
  });

  // Sample corner pixels to detect background color that ColorThief might miss
  const cornerColor = sampleCornerColor(img);
  if (cornerColor && !colorExistsInPalette(cornerColor, colors)) {
    const hsl = rgbToHsl(cornerColor);
    // Add background color with high population (it's likely dominant)
    colors.unshift({
      rgb: cornerColor,
      hsl,
      hex: rgbToHex(cornerColor),
      population: colorCount + 1,
    });
  }

  return colors;
}

/**
 * Extracts colors from an image file.
 *
 * :param file: Image file to extract colors from.
 * :param colorCount: Number of colors to extract.
 * :returns: Promise resolving to array of extracted colors.
 */
export async function extractColorsFromFile(
  file: File,
  colorCount: number = 32
): Promise<ExtractedColor[]> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = async () => {
      try {
        const colors = await extractColorsFromImage(img, colorCount);
        URL.revokeObjectURL(img.src);
        resolve(colors);
      } catch (err) {
        reject(err);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(img.src);
      reject(new Error('Failed to load image'));
    };

    img.src = URL.createObjectURL(file);
  });
}

/**
 * Clusters extracted colors by luminosity.
 *
 * :param colors: Array of extracted colors.
 * :returns: Object with dark, midtone, and light color arrays.
 */
export function clusterByLuminosity(colors: ExtractedColor[]): {
  darks: ExtractedColor[];
  midtones: ExtractedColor[];
  lights: ExtractedColor[];
} {
  const darks: ExtractedColor[] = [];
  const midtones: ExtractedColor[] = [];
  const lights: ExtractedColor[] = [];

  for (const color of colors) {
    if (color.hsl.l < 25) {
      darks.push(color);
    } else if (color.hsl.l > 75) {
      lights.push(color);
    } else {
      midtones.push(color);
    }
  }

  // Sort each cluster by luminosity
  darks.sort((a, b) => a.hsl.l - b.hsl.l);
  midtones.sort((a, b) => a.hsl.l - b.hsl.l);
  lights.sort((a, b) => a.hsl.l - b.hsl.l);

  return { darks, midtones, lights };
}

/**
 * Gets saturated colors from the palette (high chroma colors for ANSI accents).
 *
 * :param colors: Array of extracted colors.
 * :param minSaturation: Minimum saturation threshold (0-100).
 * :returns: Array of saturated colors sorted by saturation.
 */
export function getSaturatedColors(
  colors: ExtractedColor[],
  minSaturation: number = 30
): ExtractedColor[] {
  return colors
    .filter((c) => c.hsl.s >= minSaturation)
    .sort((a, b) => b.hsl.s - a.hsl.s);
}

/**
 * Creates a thumbnail from an image file.
 *
 * :param file: Image file to create thumbnail from.
 * :param maxSize: Maximum dimension for thumbnail.
 * :returns: Promise resolving to base64 encoded thumbnail.
 */
export async function createThumbnail(
  file: File,
  maxSize: number = 100
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      // Calculate thumbnail dimensions maintaining aspect ratio
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > maxSize) {
          height = (height * maxSize) / width;
          width = maxSize;
        }
      } else {
        if (height > maxSize) {
          width = (width * maxSize) / height;
          height = maxSize;
        }
      }

      canvas.width = width;
      canvas.height = height;

      ctx.drawImage(img, 0, 0, width, height);
      URL.revokeObjectURL(img.src);

      resolve(canvas.toDataURL('image/jpeg', 0.7));
    };

    img.onerror = () => {
      URL.revokeObjectURL(img.src);
      reject(new Error('Failed to load image for thumbnail'));
    };

    img.src = URL.createObjectURL(file);
  });
}
