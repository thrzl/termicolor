/**
 * Editor for a single color slot with color picker.
 */

import { useState } from 'react';
import { ColorPicker, Popover, Stack, Text, UnstyledButton, Box, Group } from '@mantine/core';
import type { RGBColor } from '@/types/color';
import { rgbToHex, hexToRgb } from '@/lib/color/conversion';
import type { ContrastInfo } from '@/lib/color/readability';
import { ContrastBadge } from './ContrastBadge';

interface ColorSlotEditorProps {
  label: string;
  color: RGBColor;
  onChange: (color: RGBColor) => void;
  size?: number;
  contrastInfo?: ContrastInfo;
}

/**
 * Editable color slot with popover color picker and optional contrast badge.
 */
export function ColorSlotEditor({
  label,
  color,
  onChange,
  size = 36,
  contrastInfo,
}: ColorSlotEditorProps) {
  const [opened, setOpened] = useState(false);
  const hex = rgbToHex(color);

  const handleChange = (value: string) => {
    onChange(hexToRgb(value));
  };

  return (
    <Popover opened={opened} onChange={setOpened} position="bottom" withArrow shadow="md">
      <Popover.Target>
        <UnstyledButton onClick={() => setOpened((o) => !o)}>
          <Group gap="xs">
            <Box
              style={{
                width: size,
                height: size,
                backgroundColor: hex,
                borderRadius: 'var(--mantine-radius-sm)',
                border: '1px solid var(--mantine-color-default-border)',
              }}
            />
            <Stack gap={0}>
              <Group gap={4}>
                <Text size="xs" fw={500}>
                  {label}
                </Text>
                {contrastInfo && <ContrastBadge info={contrastInfo} compact />}
              </Group>
              <Text size="xs" c="dimmed" ff="monospace">
                {hex}
              </Text>
            </Stack>
          </Group>
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
        </Stack>
      </Popover.Dropdown>
    </Popover>
  );
}
