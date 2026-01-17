/**
 * 4x4 grid of ANSI colors for editing with contrast info.
 * Phosphor Terminal aesthetic.
 */

import { SimpleGrid, Paper, Text, Stack, Group, Badge } from '@mantine/core';
import { IconTerminal } from '@tabler/icons-react';
import type { ANSIColorName, RGBColor } from '@/types/color';
import { ANSI_COLOR_ORDER, ANSI_DISPLAY_NAMES } from '@/lib/iterm/schema';
import type { ContrastInfo } from '@/lib/color/readability';
import { ColorSlotEditor } from './ColorSlotEditor';

interface ANSIColorGridProps {
  colors: Record<ANSIColorName, RGBColor>;
  onChange: (name: ANSIColorName, color: RGBColor) => void;
  contrastInfo?: Record<ANSIColorName, ContrastInfo>;
}

/**
 * 4x4 editable grid of ANSI terminal colors with contrast badges.
 */
export function ANSIColorGrid({ colors, onChange, contrastInfo }: ANSIColorGridProps) {
  return (
    <Paper
      p="md"
      radius="md"
      style={{
        background: 'rgba(26, 27, 35, 0.6)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.06)',
      }}
    >
      <Stack gap="sm">
        <Group justify="space-between" align="center">
          <Group gap="xs">
            <IconTerminal size={16} style={{ color: '#39ff14' }} />
            <Text fw={600} size="sm" style={{ color: 'var(--text-secondary)' }}>
              ANSI Colors
            </Text>
          </Group>
          <Badge
            variant="light"
            size="xs"
            style={{
              background: 'rgba(57, 255, 20, 0.1)',
              color: '#39ff14',
              border: '1px solid rgba(57, 255, 20, 0.2)',
            }}
          >
            16 colors
          </Badge>
        </Group>
        <SimpleGrid cols={4} spacing="xs">
          {ANSI_COLOR_ORDER.map((name) => (
            <ColorSlotEditor
              key={name}
              label={ANSI_DISPLAY_NAMES[name]}
              color={colors[name]}
              onChange={(color) => onChange(name, color)}
              contrastInfo={contrastInfo?.[name]}
              size={28}
            />
          ))}
        </SimpleGrid>
      </Stack>
    </Paper>
  );
}
