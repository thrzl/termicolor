/**
 * Grid display of extracted color palette.
 * Linear-style purple gradient aesthetic.
 */

import { SimpleGrid, Text, Paper, Stack, Group, Badge } from '@mantine/core';
import { IconPalette } from '@tabler/icons-react';
import type { ExtractedColor } from '@/types/color';
import { ColorSwatch } from './ColorSwatch';

interface ColorPaletteGridProps {
  colors: ExtractedColor[];
  selectedColor?: ExtractedColor;
  onColorSelect?: (color: ExtractedColor) => void;
  title?: string;
  columns?: number;
}

/**
 * Displays a grid of extracted colors from an image.
 */
export function ColorPaletteGrid({
  colors,
  selectedColor,
  onColorSelect,
  title = 'Extracted Palette',
  columns = 8,
}: ColorPaletteGridProps) {
  if (colors.length === 0) {
    return null;
  }

  return (
    <Paper
      p="lg"
      radius="lg"
      style={{
        background: 'rgba(26, 27, 35, 0.6)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.06)',
      }}
    >
      <Stack gap="md">
        <Group justify="space-between" align="center">
          <Group gap="xs">
            <IconPalette size={18} style={{ color: '#ffb000' }} />
            <Text fw={600} size="sm" style={{ color: 'var(--text-secondary)' }}>
              {title}
            </Text>
          </Group>
          <Badge
            variant="light"
            size="sm"
            style={{
              background: 'rgba(255, 176, 0, 0.1)',
              color: '#ffb000',
              border: '1px solid rgba(255, 176, 0, 0.2)',
            }}
          >
            {colors.length} colors
          </Badge>
        </Group>
        <SimpleGrid cols={columns} spacing="xs">
          {colors.map((color, index) => (
            <ColorSwatch
              key={`${color.hex}-${index}`}
              color={color.rgb}
              selected={selectedColor?.hex === color.hex}
              onClick={onColorSelect ? () => onColorSelect(color) : undefined}
            />
          ))}
        </SimpleGrid>
      </Stack>
    </Paper>
  );
}
