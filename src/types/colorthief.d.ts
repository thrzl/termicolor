/**
 * Type declarations for colorthief module.
 */

declare module 'colorthief' {
  type RGBTuple = [number, number, number];

  export default class ColorThief {
    /**
     * Gets the dominant color from an image.
     *
     * :param img: Image element to extract color from.
     * :param quality: Quality setting (1 = highest quality, 10 = lowest).
     * :returns: RGB tuple of the dominant color.
     */
    getColor(img: HTMLImageElement, quality?: number): RGBTuple;

    /**
     * Gets a color palette from an image.
     *
     * :param img: Image element to extract colors from.
     * :param colorCount: Number of colors to extract.
     * :param quality: Quality setting (1 = highest quality, 10 = lowest).
     * :returns: Array of RGB tuples.
     */
    getPalette(
      img: HTMLImageElement,
      colorCount?: number,
      quality?: number
    ): RGBTuple[] | null;
  }
}
