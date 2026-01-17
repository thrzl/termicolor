/**
 * Hook for exporting color schemes to various terminal emulator formats.
 */

import { useCallback, useState } from 'react';
import type { ColorScheme } from '@/types/color';
import {
  type ExportFormat,
  EXPORT_FORMATS,
  generateExport,
  getFormatInfo,
} from '@/lib/exporters';

interface UseExportResult {
  /** Whether export is in progress. */
  isExporting: boolean;
  /** List of available export formats with metadata. */
  formats: typeof EXPORT_FORMATS;
  /** Download the color scheme in the specified format. */
  downloadScheme: (
    scheme: ColorScheme,
    filename: string,
    format?: ExportFormat
  ) => void;
  /** Get the export content as a string. */
  getExportContent: (
    scheme: ColorScheme,
    format?: ExportFormat,
    name?: string
  ) => string;
  /** Copy export content to clipboard. */
  copyToClipboard: (
    scheme: ColorScheme,
    format?: ExportFormat,
    name?: string
  ) => Promise<boolean>;
}

/**
 * Hook for exporting color schemes to various terminal emulator formats.
 *
 * Provides methods to download, generate, and copy color scheme configurations
 * for iTerm2, Alacritty, Kitty, Windows Terminal, Hyper, and Terminal.app.
 *
 * :returns: Export methods, state, and available formats.
 */
export function useExport(): UseExportResult {
  const [isExporting, setIsExporting] = useState(false);

  const downloadScheme = useCallback(
    (
      scheme: ColorScheme,
      filename: string,
      format: ExportFormat = 'iterm'
    ) => {
      const formatInfo = getFormatInfo(format);
      if (!formatInfo) {
        throw new Error(`Unknown export format: ${format}`);
      }

      setIsExporting(true);
      try {
        const content = generateExport(scheme, format, filename);
        const blob = new Blob([content], { type: formatInfo.mimeType });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `${filename}.${formatInfo.extension}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        URL.revokeObjectURL(url);
      } finally {
        setIsExporting(false);
      }
    },
    []
  );

  const getExportContent = useCallback(
    (
      scheme: ColorScheme,
      format: ExportFormat = 'iterm',
      name: string = 'ColorScheme'
    ): string => {
      return generateExport(scheme, format, name);
    },
    []
  );

  const copyToClipboard = useCallback(
    async (
      scheme: ColorScheme,
      format: ExportFormat = 'iterm',
      name: string = 'ColorScheme'
    ): Promise<boolean> => {
      try {
        const content = generateExport(scheme, format, name);
        await navigator.clipboard.writeText(content);
        return true;
      } catch {
        return false;
      }
    },
    []
  );

  return {
    isExporting,
    formats: EXPORT_FORMATS,
    downloadScheme,
    getExportContent,
    copyToClipboard,
  };
}
