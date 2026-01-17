/**
 * Color extraction from images using ColorThief.
 */

import ColorThief from 'colorthief';
import type { RGBColor, ExtractedColor } from '@/types/color';
import { rgbToHsl, rgbToHex } from './conversion';

const colorThief = new ColorThief();

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
