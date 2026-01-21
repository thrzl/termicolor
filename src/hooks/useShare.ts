/**
 * Hook for sharing color schemes with composite image generation.
 */

import { useCallback, useState } from 'react';
import type { ColorScheme, RGBColor } from '@/types/color';
import { ANSI_COLOR_ORDER } from '@/lib/iterm/schema';

interface UseShareResult {
  /** Whether sharing is in progress. */
  isSharing: boolean;
  /** Share the color scheme with an image. */
  share: (imageUrl: string, scheme: ColorScheme) => Promise<void>;
  /** Check if Web Share API with files is supported. */
  canShareFiles: boolean;
}

/**
 * Converts RGB color to hex string.
 */
function rgbToHex(color: RGBColor): string {
  const toHex = (n: number) => n.toString(16).padStart(2, '0');
  return `#${toHex(color.r)}${toHex(color.g)}${toHex(color.b)}`;
}

/**
 * Generates a shareable composite image with the source image and color palette.
 *
 * @param imageUrl - URL of the source image.
 * @param scheme - The color scheme to display.
 * @returns Promise resolving to a Blob of the composite image.
 */
async function generateShareImage(
  imageUrl: string,
  scheme: ColorScheme
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      // Canvas dimensions
      const padding = 32;
      const swatchSize = 48;
      const swatchGap = 8;
      const swatchesPerRow = 8;
      const swatchRows = 2;
      const swatchAreaWidth = swatchesPerRow * swatchSize + (swatchesPerRow - 1) * swatchGap;
      const swatchAreaHeight = swatchRows * swatchSize + (swatchRows - 1) * swatchGap;

      // Scale image to reasonable size
      const maxImgWidth = 400;
      const maxImgHeight = 300;
      let imgWidth = img.width;
      let imgHeight = img.height;

      if (imgWidth > maxImgWidth) {
        imgHeight = (imgHeight * maxImgWidth) / imgWidth;
        imgWidth = maxImgWidth;
      }
      if (imgHeight > maxImgHeight) {
        imgWidth = (imgWidth * maxImgHeight) / imgHeight;
        imgHeight = maxImgHeight;
      }

      // Calculate canvas size
      const contentWidth = Math.max(imgWidth, swatchAreaWidth);
      const canvasWidth = contentWidth + padding * 2;
      const canvasHeight = imgHeight + swatchAreaHeight + padding * 3 + 60; // Extra for header/footer

      const canvas = document.createElement('canvas');
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      // Background - use scheme background with slight darkening
      const bgColor = scheme.ui.background;
      ctx.fillStyle = rgbToHex(bgColor);
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);

      // Add subtle gradient overlay
      const gradient = ctx.createLinearGradient(0, 0, canvasWidth, canvasHeight);
      gradient.addColorStop(0, 'rgba(139, 92, 246, 0.1)');
      gradient.addColorStop(1, 'rgba(139, 92, 246, 0.05)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);

      // Header text
      ctx.fillStyle = rgbToHex(scheme.ui.foreground);
      ctx.font = 'bold 20px "Space Grotesk", system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('termicolor.io', canvasWidth / 2, padding + 20);

      // Draw source image (centered, with rounded corners effect via clip)
      const imgX = (canvasWidth - imgWidth) / 2;
      const imgY = padding + 40;

      // Draw image with rounded corners
      const radius = 12;
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(imgX, imgY, imgWidth, imgHeight, radius);
      ctx.clip();
      ctx.drawImage(img, imgX, imgY, imgWidth, imgHeight);
      ctx.restore();

      // Draw border around image
      ctx.strokeStyle = 'rgba(139, 92, 246, 0.3)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(imgX, imgY, imgWidth, imgHeight, radius);
      ctx.stroke();

      // Draw color swatches
      const swatchStartX = (canvasWidth - swatchAreaWidth) / 2;
      const swatchStartY = imgY + imgHeight + padding;

      ANSI_COLOR_ORDER.forEach((name, index) => {
        const row = Math.floor(index / swatchesPerRow);
        const col = index % swatchesPerRow;
        const x = swatchStartX + col * (swatchSize + swatchGap);
        const y = swatchStartY + row * (swatchSize + swatchGap);

        const color = scheme.ansi[name];

        // Draw swatch with rounded corners
        ctx.fillStyle = rgbToHex(color);
        ctx.beginPath();
        ctx.roundRect(x, y, swatchSize, swatchSize, 6);
        ctx.fill();

        // Draw subtle border
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 1;
        ctx.stroke();
      });

      // Footer text
      ctx.fillStyle = 'rgba(139, 92, 246, 0.7)';
      ctx.font = '12px "Space Grotesk", system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Create terminal themes from any image', canvasWidth / 2, canvasHeight - padding + 8);

      // Convert to blob
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to create image blob'));
          }
        },
        'image/png',
        1.0
      );
    };

    img.onerror = () => {
      reject(new Error('Failed to load source image'));
    };

    img.src = imageUrl;
  });
}

/**
 * Hook for sharing color schemes.
 *
 * @returns Share state and methods.
 */
export function useShare(): UseShareResult {
  const [isSharing, setIsSharing] = useState(false);

  // Check if Web Share API supports sharing files
  const canShareFiles = typeof navigator !== 'undefined' &&
    typeof navigator.canShare === 'function' &&
    navigator.canShare({ files: [new File([], 'test.png', { type: 'image/png' })] });

  const share = useCallback(async (imageUrl: string, scheme: ColorScheme) => {
    setIsSharing(true);

    try {
      // Generate the composite image
      const imageBlob = await generateShareImage(imageUrl, scheme);
      const file = new File([imageBlob], 'termicolor-theme.png', { type: 'image/png' });

      const shareData = {
        title: 'My Termicolor Theme',
        text: 'Check out this terminal color scheme I created with Termicolor!',
        url: 'https://termicolor.io',
        files: [file],
      };

      // Try Web Share API first
      if (canShareFiles && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        // Fallback: download the image
        const url = URL.createObjectURL(imageBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'termicolor-theme.png';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } finally {
      setIsSharing(false);
    }
  }, [canShareFiles]);

  return {
    isSharing,
    share,
    canShareFiles,
  };
}
