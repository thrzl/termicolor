/**
 * Hook for exporting color schemes.
 */

import { useCallback, useState } from 'react';
import type { ColorScheme } from '@/types/color';
import { downloadPlist, generatePlist } from '@/lib/iterm/plist';

interface UseExportResult {
  /** Whether export is in progress. */
  isExporting: boolean;
  /** Download the color scheme as .itermcolors file. */
  downloadScheme: (scheme: ColorScheme, filename: string) => void;
  /** Get the plist content as a string. */
  getPlistContent: (scheme: ColorScheme) => string;
  /** Copy plist content to clipboard. */
  copyToClipboard: (scheme: ColorScheme) => Promise<boolean>;
}

/**
 * Hook for exporting color schemes to iTerm2 format.
 *
 * :returns: Export methods and state.
 */
export function useExport(): UseExportResult {
  const [isExporting, setIsExporting] = useState(false);

  const downloadScheme = useCallback((scheme: ColorScheme, filename: string) => {
    setIsExporting(true);
    try {
      downloadPlist(scheme, filename);
    } finally {
      setIsExporting(false);
    }
  }, []);

  const getPlistContent = useCallback((scheme: ColorScheme): string => {
    return generatePlist(scheme);
  }, []);

  const copyToClipboard = useCallback(async (scheme: ColorScheme): Promise<boolean> => {
    try {
      const content = generatePlist(scheme);
      await navigator.clipboard.writeText(content);
      return true;
    } catch {
      return false;
    }
  }, []);

  return {
    isExporting,
    downloadScheme,
    getPlistContent,
    copyToClipboard,
  };
}
