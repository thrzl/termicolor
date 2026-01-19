import { describe, it, expect } from 'vitest';
import { parsePlist, PlistParseError } from './parser';

const VALID_PLIST = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Ansi 0 Color</key>
  <dict>
    <key>Red Component</key>
    <real>0.1</real>
    <key>Green Component</key>
    <real>0.2</real>
    <key>Blue Component</key>
    <real>0.3</real>
  </dict>
  <key>Ansi 1 Color</key>
  <dict>
    <key>Red Component</key>
    <real>0.8</real>
    <key>Green Component</key>
    <real>0.1</real>
    <key>Blue Component</key>
    <real>0.1</real>
  </dict>
  <key>Background Color</key>
  <dict>
    <key>Red Component</key>
    <real>0.0</real>
    <key>Green Component</key>
    <real>0.0</real>
    <key>Blue Component</key>
    <real>0.0</real>
  </dict>
  <key>Foreground Color</key>
  <dict>
    <key>Red Component</key>
    <real>1.0</real>
    <key>Green Component</key>
    <real>1.0</real>
    <key>Blue Component</key>
    <real>1.0</real>
  </dict>
</dict>
</plist>`;

describe('parsePlist', () => {
  it('parses valid iTerm2 plist', () => {
    const scheme = parsePlist(VALID_PLIST);

    expect(scheme.ansi).toBeDefined();
    expect(scheme.ui).toBeDefined();
  });

  it('correctly denormalizes color values', () => {
    const scheme = parsePlist(VALID_PLIST);

    // Ansi 0 Color: 0.1, 0.2, 0.3 -> 26, 51, 77
    expect(scheme.ansi.black.r).toBe(26);
    expect(scheme.ansi.black.g).toBe(51);
    expect(scheme.ansi.black.b).toBe(77);
  });

  it('parses background color', () => {
    const scheme = parsePlist(VALID_PLIST);

    expect(scheme.ui.background).toEqual({ r: 0, g: 0, b: 0 });
  });

  it('parses foreground color', () => {
    const scheme = parsePlist(VALID_PLIST);

    expect(scheme.ui.foreground).toEqual({ r: 255, g: 255, b: 255 });
  });

  it('fills missing colors with defaults', () => {
    const scheme = parsePlist(VALID_PLIST);

    // Colors not in the plist should have default values
    expect(scheme.ansi.green).toBeDefined();
    expect(scheme.ansi.blue).toBeDefined();
    expect(scheme.ui.cursor).toBeDefined();
  });

  it('throws PlistParseError for invalid XML', () => {
    expect(() => parsePlist('not valid xml<>')).toThrow(PlistParseError);
  });

  it('throws PlistParseError for missing plist element', () => {
    const noPlist = `<?xml version="1.0" encoding="UTF-8"?>
<dict><key>test</key></dict>`;

    expect(() => parsePlist(noPlist)).toThrow(PlistParseError);
    expect(() => parsePlist(noPlist)).toThrow('missing <plist> element');
  });

  it('throws PlistParseError for missing root dict', () => {
    const noDict = `<?xml version="1.0" encoding="UTF-8"?>
<plist version="1.0">
</plist>`;

    expect(() => parsePlist(noDict)).toThrow(PlistParseError);
    expect(() => parsePlist(noDict)).toThrow('missing root <dict> element');
  });

  it('handles empty plist gracefully', () => {
    const emptyPlist = `<?xml version="1.0" encoding="UTF-8"?>
<plist version="1.0">
<dict>
</dict>
</plist>`;

    const scheme = parsePlist(emptyPlist);

    // Should return defaults for all colors
    expect(scheme.ansi.black).toBeDefined();
    expect(scheme.ui.background).toBeDefined();
  });

  it('ignores malformed color dicts', () => {
    const malformedPlist = `<?xml version="1.0" encoding="UTF-8"?>
<plist version="1.0">
<dict>
  <key>Ansi 0 Color</key>
  <dict>
    <key>Red Component</key>
    <real>0.5</real>
  </dict>
</dict>
</plist>`;

    const scheme = parsePlist(malformedPlist);

    // Should use default because color dict is incomplete
    expect(scheme.ansi.black).toBeDefined();
  });
});
