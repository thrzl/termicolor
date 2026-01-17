/**
 * Hook for extracting colors from an image file.
 */

import { useState, useCallback } from 'react';
import type { ExtractedColor } from '@/types/color';
import { extractColorsFromFile, createThumbnail } from '@/lib/color/extraction';

interface UseColorExtractionResult {
  /** Extracted colors from the image. */
  colors: ExtractedColor[];
  /** Base64 thumbnail of the image. */
  thumbnail: string | null;
  /** Whether extraction is in progress. */
  isLoading: boolean;
  /** Error message if extraction failed. */
  error: string | null;
  /** Extract colors from an image file. */
  extractColors: (file: File) => Promise<void>;
  /** Clear the extracted colors. */
  clearColors: () => void;
}

/**
 * Hook for extracting colors from images.
 *
 * :param colorCount: Number of colors to extract (default 32).
 * :returns: Extraction state and methods.
 */
export function useColorExtraction(colorCount: number = 32): UseColorExtractionResult {
  const [colors, setColors] = useState<ExtractedColor[]>([]);
  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const extractColors = useCallback(async (file: File) => {
    setIsLoading(true);
    setError(null);

    try {
      // Extract colors and create thumbnail in parallel
      const [extractedColors, thumb] = await Promise.all([
        extractColorsFromFile(file, colorCount),
        createThumbnail(file),
      ]);

      setColors(extractedColors);
      setThumbnail(thumb);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to extract colors';
      setError(message);
      setColors([]);
      setThumbnail(null);
    } finally {
      setIsLoading(false);
    }
  }, [colorCount]);

  const clearColors = useCallback(() => {
    setColors([]);
    setThumbnail(null);
    setError(null);
  }, []);

  return {
    colors,
    thumbnail,
    isLoading,
    error,
    extractColors,
    clearColors,
  };
}
