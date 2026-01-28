/**
 * Editor for a single color slot with color picker and drop support.
 * Compact vertical layout: label on top, swatch in middle, hex below.
 */

import { useState, useEffect } from 'react';
import { ColorPicker, Popover, Stack, Text, UnstyledButton, Box, Group, TextInput } from '@mantine/core';
import type { RGBColor } from '@/types/color';
import { rgbToHex, hexToRgb } from '@/lib/color/conversion';
import type { ContrastInfo } from '@/lib/color/readability';
import { ContrastBadge } from './ContrastBadge';
import { COLOR_DRAG_TYPE } from '../palette/ColorSwatch';

interface ColorSlotEditorProps {
  label: string;
  color: RGBColor;
  onChange: (color: RGBColor) => void;
  size?: number;
  contrastInfo?: ContrastInfo;
}

/**
 * Editable color slot with popover color picker, drop support, and optional contrast badge.
 * Vertically stacked layout for compact grid display.
 */
export function ColorSlotEditor({
  label,
  color,
  onChange,
  size = 32,
  contrastInfo,
}: ColorSlotEditorProps) {
  const [opened, setOpened] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const hex = rgbToHex(color);
  const [hexInput, setHexInput] = useState(hex);

  const handleChange = (value: string) => {
    setHexInput(value);
    onChange(hexToRgb(value));
  };

  const handleHexInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.currentTarget.value;
    setHexInput(value);

    // Normalize: add # if missing
    if (value && !value.startsWith('#')) {
      value = '#' + value;
    }

    // Validate hex format and apply
    if (/^#[0-9A-Fa-f]{6}$/.test(value)) {
      onChange(hexToRgb(value));
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (e.dataTransfer.types.includes(COLOR_DRAG_TYPE)) {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
      setIsDragOver(true);
    }
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const data = e.dataTransfer.getData(COLOR_DRAG_TYPE);
    if (data) {
      try {
        const droppedColor = JSON.parse(data) as RGBColor;
        onChange(droppedColor);
      } catch {
        // Invalid data, ignore
      }
    }
  };

  // Sync hexInput when color changes externally (from color picker or props)
  useEffect(() => {
    setHexInput(hex);
  }, [hex]);

  return (
    <Popover opened={opened} onChange={setOpened} position="bottom" withArrow shadow="md">
      <Popover.Target>
        <UnstyledButton
          onClick={() => setOpened((o) => !o)}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 4,
            padding: '6px 4px',
            borderRadius: 'var(--mantine-radius-sm)',
            transition: 'all 0.15s ease',
            minWidth: 60,
            outline: isDragOver ? '2px dashed #8b5cf6' : 'none',
            outlineOffset: 2,
            background: isDragOver ? 'rgba(139, 92, 246, 0.1)' : 'transparent',
          }}
          styles={{
            root: {
              '&:hover': {
                background: 'rgba(255, 255, 255, 0.05)',
              },
            },
          }}
        >
          <Text
            size="10px"
            fw={500}
            ta="center"
            style={{
              color: 'var(--text-secondary)',
              lineHeight: 1.2,
              maxWidth: 56,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {label}
          </Text>
          <Box
            style={{
              width: size,
              height: size,
              backgroundColor: hex,
              borderRadius: 'var(--mantine-radius-sm)',
              border: isDragOver ? '2px solid #8b5cf6' : '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: isDragOver ? '0 0 16px rgba(139, 92, 246, 0.5)' : `0 0 8px ${hex}40`,
              transition: 'all 0.15s ease',
            }}
          />
          <Text
            size="9px"
            ff="monospace"
            style={{
              color: 'var(--text-tertiary)',
              opacity: 0.7,
            }}
          >
            {hex}
          </Text>
        </UnstyledButton>
      </Popover.Target>
      <Popover.Dropdown>
        <Stack gap="xs">
          <Group justify="space-between">
            <Text size="sm" fw={500}>
              {label}
            </Text>
            {contrastInfo && <ContrastBadge info={contrastInfo} />}
          </Group>
          <ColorPicker
            format="hex"
            value={hex}
            onChange={handleChange}
            size="md"
          />
          <TextInput
            value={hexInput}
            onChange={handleHexInputChange}
            placeholder="#000000"
            size="xs"
            styles={{
              input: {
                fontFamily: 'monospace',
                textAlign: 'center',
              },
            }}
          />
        </Stack>
      </Popover.Dropdown>
    </Popover>
  );
}
