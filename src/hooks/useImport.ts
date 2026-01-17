/**
 * Hook for importing color schemes from iTerm2 .itermcolors files.
 */

import { useState, useCallback } from 'react';
import type { ColorScheme } from '@/types/color';
import { parseItermcolorsFile, PlistParseError } from '@/lib/iterm/parser';

interface UseImportResult {
  /** Whether import is in progress. */
  isImporting: boolean;
  /** Error message if import failed. */
  importError: string | null;
  /** Import a color scheme from a file. */
  importFromFile: (file: File) => Promise<ColorScheme | null>;
  /** Clear any import error. */
  clearError: () => void;
}

/**
 * Hook for importing color schemes from iTerm2 .itermcolors files.
 *
 * Provides state management for file import operations including loading
 * status and error handling. Uses the iTerm2 plist parser to convert
 * .itermcolors files into ColorScheme objects.
 *
 * :returns: Import state and methods.
 */
export function useImport(): UseImportResult {
  const [isImporting, setIsImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  const importFromFile = useCallback(async (file: File): Promise<ColorScheme | null> => {
    setIsImporting(true);
    setImportError(null);

    try {
      const scheme = await parseItermcolorsFile(file);
      return scheme;
    } catch (error) {
      let message: string;

      if (error instanceof PlistParseError) {
        message = error.message;
      } else if (error instanceof Error) {
        message = `Failed to import file: ${error.message}`;
      } else {
        message = 'Failed to import file: Unknown error';
      }

      setImportError(message);
      return null;
    } finally {
      setIsImporting(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setImportError(null);
  }, []);

  return {
    isImporting,
    importError,
    importFromFile,
    clearError,
  };
}
