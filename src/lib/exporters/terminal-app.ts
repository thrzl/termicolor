/**
 * Terminal.app color scheme exporter.
 *
 * Generates .terminal profile files compatible with macOS Terminal.app.
 * Terminal.app uses XML plist format with NSKeyedArchiver-encoded NSColor objects.
 */

import type { ColorScheme, RGBColor, ANSIColorName } from '@/types/color';

/**
 * Mapping of internal ANSI color names to Terminal.app color key names.
 */
const TERMINAL_APP_ANSI_KEYS: Record<ANSIColorName, string> = {
  black: 'ANSIBlackColor',
  red: 'ANSIRedColor',
  green: 'ANSIGreenColor',
  yellow: 'ANSIYellowColor',
  blue: 'ANSIBlueColor',
  magenta: 'ANSIMagentaColor',
  cyan: 'ANSICyanColor',
  white: 'ANSIWhiteColor',
  brightBlack: 'ANSIBrightBlackColor',
  brightRed: 'ANSIBrightRedColor',
  brightGreen: 'ANSIBrightGreenColor',
  brightYellow: 'ANSIBrightYellowColor',
  brightBlue: 'ANSIBrightBlueColor',
  brightMagenta: 'ANSIBrightMagentaColor',
  brightCyan: 'ANSIBrightCyanColor',
  brightWhite: 'ANSIBrightWhiteColor',
};

/**
 * Writes a variable-length integer for bplist format.
 *
 * :param value: The integer value to encode.
 * :param width: Number of bytes to use (1, 2, 4, or 8).
 * :returns: Array of bytes representing the integer.
 */
function writeInt(value: number, width: number): number[] {
  const bytes: number[] = [];
  for (let i = width - 1; i >= 0; i--) {
    bytes.push((value >> (i * 8)) & 0xff);
  }
  return bytes;
}

/**
 * Creates an NSKeyedArchiver binary plist encoding of an NSColor in calibrated RGB color space.
 *
 * This generates a complete bplist00 archive that Terminal.app can decode as an NSColor object.
 * The archive structure follows NSKeyedArchiver format with:
 * - $archiver: "NSKeyedArchiver"
 * - $version: 100000
 * - $top: reference to root object
 * - $objects: array of archived objects including the NSColor
 *
 * :param r: Red component (0-255).
 * :param g: Green component (0-255).
 * :param b: Blue component (0-255).
 * :returns: Base64-encoded binary plist data.
 */
function encodeNSColor(r: number, g: number, b: number): string {
  // Normalize RGB values to 0-1 range
  const nr = r / 255;
  const ng = g / 255;
  const nb = b / 255;

  // Build the NSRGB color data string (space-separated float values)
  // Format: "R G B" or "R G B A" as ASCII string
  const colorString = `${nr} ${ng} ${nb}`;
  const colorBytes = Array.from(new TextEncoder().encode(colorString));

  // Build the binary plist
  // We need to construct an NSKeyedArchiver archive with the following structure:
  // $objects array contains:
  //   [0] "$null" (special null marker)
  //   [1] The root dict with $class reference and NSRGB data
  //   [2] The NSColor class definition
  // $top dict references object 1
  // $archiver = "NSKeyedArchiver"
  // $version = 100000

  // Build objects for the plist
  const objects: Uint8Array[] = [];
  const objectOffsets: number[] = [];

  // Helper to add an object and return its index
  let currentOffset = 8; // Start after "bplist00" header

  // Object 0: $null string
  const nullStr = encodeAsciiString('$null');
  objectOffsets.push(currentOffset);
  objects.push(nullStr);
  currentOffset += nullStr.length;

  // Object 1: NSRGB data (raw bytes)
  const nsrgbData = encodeData(new Uint8Array(colorBytes));
  objectOffsets.push(currentOffset);
  objects.push(nsrgbData);
  currentOffset += nsrgbData.length;

  // Object 2: "NSRGB" string (key for the data)
  const nsrgbKey = encodeAsciiString('NSRGB');
  objectOffsets.push(currentOffset);
  objects.push(nsrgbKey);
  currentOffset += nsrgbKey.length;

  // Object 3: "$class" string
  const classKey = encodeAsciiString('$class');
  objectOffsets.push(currentOffset);
  objects.push(classKey);
  currentOffset += classKey.length;

  // Object 4: NSColor class dict
  // Contains: $classname -> "NSColor", $classes -> ["NSColor", "NSObject"]
  const classNameKey = encodeAsciiString('$classname');
  objectOffsets.push(currentOffset);
  objects.push(classNameKey);
  currentOffset += classNameKey.length;

  // Object 5: "NSColor" string
  const nscolorStr = encodeAsciiString('NSColor');
  objectOffsets.push(currentOffset);
  objects.push(nscolorStr);
  currentOffset += nscolorStr.length;

  // Object 6: "$classes" string
  const classesKey = encodeAsciiString('$classes');
  objectOffsets.push(currentOffset);
  objects.push(classesKey);
  currentOffset += classesKey.length;

  // Object 7: "NSObject" string
  const nsobjectStr = encodeAsciiString('NSObject');
  objectOffsets.push(currentOffset);
  objects.push(nsobjectStr);
  currentOffset += nsobjectStr.length;

  // Object 8: Array ["NSColor", "NSObject"] - references to objects 5, 7
  const classesArray = encodeArray([5, 7]);
  objectOffsets.push(currentOffset);
  objects.push(classesArray);
  currentOffset += classesArray.length;

  // Object 9: Class definition dict {$classname: "NSColor", $classes: ["NSColor", "NSObject"]}
  // Keys: 4 ($classname), 6 ($classes)
  // Values: 5 (NSColor), 8 (array)
  const classDef = encodeDict([4, 6], [5, 8]);
  objectOffsets.push(currentOffset);
  objects.push(classDef);
  currentOffset += classDef.length;

  // Object 10: Color object dict {NSRGB: data, $class: class_uid}
  // Keys: 2 (NSRGB), 3 ($class)
  // Values: 1 (data), UID(9) (class def)
  const colorDict = encodeDictWithUid([2, 3], [1], [[9]]);
  objectOffsets.push(currentOffset);
  objects.push(colorDict);
  currentOffset += colorDict.length;

  // Object 11: "$top" string
  const topKey = encodeAsciiString('$top');
  objectOffsets.push(currentOffset);
  objects.push(topKey);
  currentOffset += topKey.length;

  // Object 12: "root" string
  const rootKey = encodeAsciiString('root');
  objectOffsets.push(currentOffset);
  objects.push(rootKey);
  currentOffset += rootKey.length;

  // Object 13: $top dict {root: UID(10)}
  const topDict = encodeDictAllUids([12], [[10]]);
  objectOffsets.push(currentOffset);
  objects.push(topDict);
  currentOffset += topDict.length;

  // Object 14: "$archiver" string
  const archiverKey = encodeAsciiString('$archiver');
  objectOffsets.push(currentOffset);
  objects.push(archiverKey);
  currentOffset += archiverKey.length;

  // Object 15: "NSKeyedArchiver" string
  const archiverValue = encodeAsciiString('NSKeyedArchiver');
  objectOffsets.push(currentOffset);
  objects.push(archiverValue);
  currentOffset += archiverValue.length;

  // Object 16: "$version" string
  const versionKey = encodeAsciiString('$version');
  objectOffsets.push(currentOffset);
  objects.push(versionKey);
  currentOffset += versionKey.length;

  // Object 17: 100000 integer
  const versionValue = encodeInt(100000);
  objectOffsets.push(currentOffset);
  objects.push(versionValue);
  currentOffset += versionValue.length;

  // Object 18: "$objects" string
  const objectsKey = encodeAsciiString('$objects');
  objectOffsets.push(currentOffset);
  objects.push(objectsKey);
  currentOffset += objectsKey.length;

  // Object 19: $objects array - contains refs 0-10 (null through color object)
  const objectsArray = encodeArray([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  objectOffsets.push(currentOffset);
  objects.push(objectsArray);
  currentOffset += objectsArray.length;

  // Object 20: Root dict {$archiver, $objects, $top, $version}
  // Keys: 14, 18, 11, 16
  // Values: 15, 19, 13, 17
  const rootDict = encodeDict([14, 18, 11, 16], [15, 19, 13, 17]);
  objectOffsets.push(currentOffset);
  objects.push(rootDict);
  currentOffset += rootDict.length;

  // Build the final plist
  const numObjects = objects.length;
  const rootObjectRef = numObjects - 1; // Last object is root

  // Calculate offset table position
  const offsetTableOffset = currentOffset;

  // Build offset table (1 byte per offset since our plist is small)
  const offsetSize = 1;
  const objectRefSize = 1;
  const offsetTable = new Uint8Array(numObjects);
  for (let i = 0; i < numObjects; i++) {
    offsetTable[i] = objectOffsets[i];
  }

  // Build trailer (32 bytes)
  const trailer = new Uint8Array(32);
  // Bytes 0-5: unused (zeros)
  trailer[6] = offsetSize; // Offset int size
  trailer[7] = objectRefSize; // Object ref size
  // Bytes 8-15: Number of objects (big-endian 64-bit)
  const numObjBytes = writeInt(numObjects, 8);
  trailer.set(numObjBytes, 8);
  // Bytes 16-23: Top object (big-endian 64-bit)
  const topObjBytes = writeInt(rootObjectRef, 8);
  trailer.set(topObjBytes, 16);
  // Bytes 24-31: Offset table offset (big-endian 64-bit)
  const offsetTableBytes = writeInt(offsetTableOffset, 8);
  trailer.set(offsetTableBytes, 24);

  // Combine all parts
  const header = new TextEncoder().encode('bplist00');
  const totalLength =
    header.length +
    objects.reduce((sum, obj) => sum + obj.length, 0) +
    offsetTable.length +
    trailer.length;

  const result = new Uint8Array(totalLength);
  let pos = 0;

  result.set(header, pos);
  pos += header.length;

  for (const obj of objects) {
    result.set(obj, pos);
    pos += obj.length;
  }

  result.set(offsetTable, pos);
  pos += offsetTable.length;

  result.set(trailer, pos);

  // Convert to base64
  return btoa(String.fromCharCode(...result));
}

/**
 * Encodes an ASCII string as a bplist string object.
 *
 * :param str: The string to encode.
 * :returns: Uint8Array containing the encoded string object.
 */
function encodeAsciiString(str: string): Uint8Array {
  const bytes = new TextEncoder().encode(str);
  if (bytes.length < 15) {
    // Short string: marker byte = 0x50 | length
    const result = new Uint8Array(1 + bytes.length);
    result[0] = 0x50 | bytes.length;
    result.set(bytes, 1);
    return result;
  } else {
    // Long string: marker = 0x5F, then length as int
    const lengthBytes = encodeLengthInt(bytes.length);
    const result = new Uint8Array(1 + lengthBytes.length + bytes.length);
    result[0] = 0x5f;
    result.set(lengthBytes, 1);
    result.set(bytes, 1 + lengthBytes.length);
    return result;
  }
}

/**
 * Encodes a length integer for extended-length bplist objects.
 *
 * :param length: The length value to encode.
 * :returns: Uint8Array containing the encoded length.
 */
function encodeLengthInt(length: number): Uint8Array {
  if (length < 256) {
    return new Uint8Array([0x10, length]);
  } else if (length < 65536) {
    return new Uint8Array([0x11, (length >> 8) & 0xff, length & 0xff]);
  } else {
    return new Uint8Array([
      0x12,
      (length >> 24) & 0xff,
      (length >> 16) & 0xff,
      (length >> 8) & 0xff,
      length & 0xff,
    ]);
  }
}

/**
 * Encodes raw data as a bplist data object.
 *
 * :param data: The data bytes to encode.
 * :returns: Uint8Array containing the encoded data object.
 */
function encodeData(data: Uint8Array): Uint8Array {
  if (data.length < 15) {
    const result = new Uint8Array(1 + data.length);
    result[0] = 0x40 | data.length;
    result.set(data, 1);
    return result;
  } else {
    const lengthBytes = encodeLengthInt(data.length);
    const result = new Uint8Array(1 + lengthBytes.length + data.length);
    result[0] = 0x4f;
    result.set(lengthBytes, 1);
    result.set(data, 1 + lengthBytes.length);
    return result;
  }
}

/**
 * Encodes an integer as a bplist int object.
 *
 * :param value: The integer value to encode.
 * :returns: Uint8Array containing the encoded integer object.
 */
function encodeInt(value: number): Uint8Array {
  if (value >= 0 && value < 256) {
    return new Uint8Array([0x10, value]);
  } else if (value >= 0 && value < 65536) {
    return new Uint8Array([0x11, (value >> 8) & 0xff, value & 0xff]);
  } else {
    return new Uint8Array([
      0x12,
      (value >> 24) & 0xff,
      (value >> 16) & 0xff,
      (value >> 8) & 0xff,
      value & 0xff,
    ]);
  }
}

/**
 * Encodes an array of object references as a bplist array object.
 *
 * :param refs: Array of object reference indices.
 * :returns: Uint8Array containing the encoded array object.
 */
function encodeArray(refs: number[]): Uint8Array {
  const count = refs.length;
  if (count < 15) {
    const result = new Uint8Array(1 + count);
    result[0] = 0xa0 | count;
    for (let i = 0; i < count; i++) {
      result[1 + i] = refs[i];
    }
    return result;
  } else {
    const lengthBytes = encodeLengthInt(count);
    const result = new Uint8Array(1 + lengthBytes.length + count);
    result[0] = 0xaf;
    result.set(lengthBytes, 1);
    for (let i = 0; i < count; i++) {
      result[1 + lengthBytes.length + i] = refs[i];
    }
    return result;
  }
}

/**
 * Encodes a dictionary as a bplist dict object.
 *
 * :param keyRefs: Array of key object references.
 * :param valueRefs: Array of value object references.
 * :returns: Uint8Array containing the encoded dict object.
 */
function encodeDict(keyRefs: number[], valueRefs: number[]): Uint8Array {
  const count = keyRefs.length;
  if (count < 15) {
    const result = new Uint8Array(1 + count * 2);
    result[0] = 0xd0 | count;
    for (let i = 0; i < count; i++) {
      result[1 + i] = keyRefs[i];
    }
    for (let i = 0; i < count; i++) {
      result[1 + count + i] = valueRefs[i];
    }
    return result;
  } else {
    const lengthBytes = encodeLengthInt(count);
    const result = new Uint8Array(1 + lengthBytes.length + count * 2);
    result[0] = 0xdf;
    result.set(lengthBytes, 1);
    const offset = 1 + lengthBytes.length;
    for (let i = 0; i < count; i++) {
      result[offset + i] = keyRefs[i];
    }
    for (let i = 0; i < count; i++) {
      result[offset + count + i] = valueRefs[i];
    }
    return result;
  }
}

/**
 * Encodes a dictionary with mixed regular refs and UIDs.
 *
 * :param keyRefs: Array of key object references.
 * :param regularValueRefs: Array of regular value object references.
 * :param uidValues: Array of UID values (each is an array with one element).
 * :returns: Uint8Array containing the encoded dict object.
 */
function encodeDictWithUid(
  keyRefs: number[],
  regularValueRefs: number[],
  uidValues: number[][]
): Uint8Array {
  // For the color dict, we have 2 keys: NSRGB (regular ref) and $class (UID)
  // Keys: [2, 3], Values: [ref(1), UID(9)]
  const count = keyRefs.length;

  // Calculate size: marker + keys + values (regular refs are 1 byte, UIDs are 2 bytes)
  const uidCount = uidValues.length;
  const regularCount = regularValueRefs.length;

  // Total value bytes: regular refs + (2 bytes per UID)
  const valueBytesCount = regularCount + uidCount * 2;

  const result = new Uint8Array(1 + count + valueBytesCount);
  result[0] = 0xd0 | count;

  // Write keys
  for (let i = 0; i < count; i++) {
    result[1 + i] = keyRefs[i];
  }

  // Write values: first the regular refs, then the UIDs
  let valueOffset = 1 + count;
  for (let i = 0; i < regularCount; i++) {
    result[valueOffset++] = regularValueRefs[i];
  }
  for (let i = 0; i < uidCount; i++) {
    // UID is encoded as 0x80 | (size-1) followed by the value
    result[valueOffset++] = 0x80; // UID with 1-byte value
    result[valueOffset++] = uidValues[i][0];
  }

  return result;
}

/**
 * Encodes a dictionary where all values are UIDs.
 *
 * :param keyRefs: Array of key object references.
 * :param uidValues: Array of UID values (each is an array with one element).
 * :returns: Uint8Array containing the encoded dict object.
 */
function encodeDictAllUids(
  keyRefs: number[],
  uidValues: number[][]
): Uint8Array {
  const count = keyRefs.length;

  // Each UID takes 2 bytes (marker + value)
  const result = new Uint8Array(1 + count + count * 2);
  result[0] = 0xd0 | count;

  // Write keys
  for (let i = 0; i < count; i++) {
    result[1 + i] = keyRefs[i];
  }

  // Write UID values
  let valueOffset = 1 + count;
  for (let i = 0; i < count; i++) {
    result[valueOffset++] = 0x80; // UID with 1-byte value
    result[valueOffset++] = uidValues[i][0];
  }

  return result;
}

/**
 * Encodes an RGB color value as NSKeyedArchiver data for Terminal.app.
 *
 * :param rgb: RGB color with values 0-255.
 * :returns: Base64-encoded NSKeyedArchiver binary plist data.
 */
function encodeNSColorFromRGB(rgb: RGBColor): string {
  return encodeNSColor(rgb.r, rgb.g, rgb.b);
}

/**
 * Escapes special XML characters in a string.
 *
 * :param str: String to escape.
 * :returns: XML-escaped string.
 */
function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Generates a single color entry for the Terminal.app plist.
 *
 * :param key: The Terminal.app color key name.
 * :param rgb: The RGB color value.
 * :returns: XML string fragment for this color entry.
 */
function generateColorEntry(key: string, rgb: RGBColor): string {
  const base64Data = encodeNSColorFromRGB(rgb);
  return `\t<key>${escapeXml(key)}</key>\n\t<data>\n\t${base64Data}\n\t</data>`;
}

/**
 * Generates a Terminal.app .terminal profile file content.
 *
 * Creates an XML plist with NSKeyedArchiver-encoded NSColor objects for each
 * color setting. The generated file can be imported into Terminal.app via
 * Preferences > Profiles > Import.
 *
 * :param scheme: The color scheme to export.
 * :param name: Name for the Terminal.app profile.
 * :returns: XML plist content string for Terminal.app.
 */
export function generateTerminalApp(scheme: ColorScheme, name: string): string {
  const { ansi, ui } = scheme;

  const lines: string[] = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<!-- Generated by Termicolor (https://termicolor.io) -->',
    '<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">',
    '<plist version="1.0">',
    '<dict>',
    `\t<key>name</key>`,
    `\t<string>${escapeXml(name)}</string>`,
    `\t<key>type</key>`,
    `\t<string>Window Settings</string>`,
    '',
    '\t<!-- Background and Foreground -->',
    generateColorEntry('BackgroundColor', ui.background),
    generateColorEntry('TextColor', ui.foreground),
    generateColorEntry('CursorColor', ui.cursor),
    generateColorEntry('SelectionColor', ui.selection),
    '',
    '\t<!-- Normal ANSI Colors -->',
  ];

  // Add normal ANSI colors
  const normalColors: ANSIColorName[] = [
    'black',
    'red',
    'green',
    'yellow',
    'blue',
    'magenta',
    'cyan',
    'white',
  ];
  for (const colorName of normalColors) {
    const key = TERMINAL_APP_ANSI_KEYS[colorName];
    lines.push(generateColorEntry(key, ansi[colorName]));
  }

  lines.push('');
  lines.push('\t<!-- Bright ANSI Colors -->');

  // Add bright ANSI colors
  const brightColors: ANSIColorName[] = [
    'brightBlack',
    'brightRed',
    'brightGreen',
    'brightYellow',
    'brightBlue',
    'brightMagenta',
    'brightCyan',
    'brightWhite',
  ];
  for (const colorName of brightColors) {
    const key = TERMINAL_APP_ANSI_KEYS[colorName];
    lines.push(generateColorEntry(key, ansi[colorName]));
  }

  lines.push('</dict>');
  lines.push('</plist>');

  return lines.join('\n');
}

/**
 * Downloads a Terminal.app color scheme as a .terminal file.
 *
 * :param scheme: The color scheme to download.
 * :param filename: Name for the downloaded file (without extension).
 */
export function downloadTerminalApp(
  scheme: ColorScheme,
  filename: string
): void {
  const content = generateTerminalApp(scheme, filename);
  const blob = new Blob([content], { type: 'application/xml' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.terminal`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  URL.revokeObjectURL(url);
}
