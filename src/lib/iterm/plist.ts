/**
 * iTerm2 .itermcolors plist file generation.
 */

import type { ColorScheme, RGBColor } from '@/types/color';
import { normalizeRgb } from '../color/conversion';
import { ANSI_KEY_MAP, UI_KEY_MAP } from './schema';

/**
 * Generates XML for a single color entry in the plist.
 *
 * :param key: The plist key name.
 * :param rgb: RGB color values.
 * :returns: XML string for the color entry.
 */
function colorToXml(key: string, rgb: RGBColor): string {
  const normalized = normalizeRgb(rgb);
  return `	<key>${key}</key>
	<dict>
		<key>Alpha Component</key>
		<real>1</real>
		<key>Blue Component</key>
		<real>${normalized.b.toFixed(8)}</real>
		<key>Color Space</key>
		<string>sRGB</string>
		<key>Green Component</key>
		<real>${normalized.g.toFixed(8)}</real>
		<key>Red Component</key>
		<real>${normalized.r.toFixed(8)}</real>
	</dict>`;
}

/**
 * Generates a complete iTerm2 .itermcolors plist file content.
 *
 * :param scheme: The color scheme to export.
 * :returns: XML plist string.
 */
export function generatePlist(scheme: ColorScheme): string {
  const colorEntries: string[] = [];

  // Add ANSI colors
  for (const [colorName, plistKey] of Object.entries(ANSI_KEY_MAP)) {
    const color = scheme.ansi[colorName as keyof typeof scheme.ansi];
    colorEntries.push(colorToXml(plistKey, color));
  }

  // Add UI colors
  for (const [colorName, plistKey] of Object.entries(UI_KEY_MAP)) {
    const color = scheme.ui[colorName as keyof typeof scheme.ui];
    colorEntries.push(colorToXml(plistKey, color));
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
${colorEntries.join('\n')}
</dict>
</plist>`;
}

/**
 * Downloads an iTerm2 color scheme file.
 *
 * :param scheme: The color scheme to download.
 * :param filename: Name for the downloaded file (without extension).
 */
export function downloadPlist(scheme: ColorScheme, filename: string): void {
  const content = generatePlist(scheme);
  const blob = new Blob([content], { type: 'application/xml' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.itermcolors`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  URL.revokeObjectURL(url);
}
