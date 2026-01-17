/**
 * Responsive grid of ANSI colors for editing with contrast info.
 * Linear-style purple gradient aesthetic with compact vertical slots.
 */

import { SimpleGrid, Paper, Text, Stack, Group, Badge, Button } from '@mantine/core';
import { IconTerminal, IconRefresh } from '@tabler/icons-react';
import type { ANSIColorName, RGBColor } from '@/types/color';
import { ANSI_COLOR_ORDER, ANSI_DISPLAY_NAMES } from '@/lib/iterm/schema';
import type { ContrastInfo } from '@/lib/color/readability';
import { ColorSlotEditor } from './ColorSlotEditor';

interface ANSIColorGridProps {
  colors: Record<ANSIColorName, RGBColor>;
  onChange: (name: ANSIColorName, color: RGBColor) => void;
  contrastInfo?: Record<ANSIColorName, ContrastInfo>;
  onRegenerate?: () => void;
  canRegenerate?: boolean;
}

/**
 * Responsive editable grid of ANSI terminal colors with contrast badges.
 * 8 columns on sm+ for 2 rows of 16 colors, 4 on mobile for 4 rows.
 */
export function ANSIColorGrid({
  colors,
  onChange,
  contrastInfo,
  onRegenerate,
  canRegenerate = false,
}: ANSIColorGridProps) {
  return (
    <Paper
      p="md"
      radius="md"
      style={{
        background: 'var(--bg-card)',
        backdropFilter: 'blur(10px)',
        border: '1px solid var(--border-subtle)',
        boxShadow: 'var(--shadow-card)',
      }}
    >
      <Stack gap="sm">
        <Group justify="space-between" align="center">
          <Group gap="xs">
            <IconTerminal size={16} style={{ color: '#8b5cf6' }} />
            <Text fw={600} size="sm" style={{ color: 'var(--text-secondary)' }}>
              ANSI Colors
            </Text>
            <Badge
              variant="light"
              size="xs"
              style={{
                background: 'rgba(139, 92, 246, 0.1)',
                color: '#8b5cf6',
                border: '1px solid rgba(139, 92, 246, 0.2)',
              }}
            >
              16
            </Badge>
          </Group>
          {onRegenerate && (
            <Button
              variant="subtle"
              size="xs"
              leftSection={<IconRefresh size={14} />}
              onClick={onRegenerate}
              disabled={!canRegenerate}
              styles={{
                root: {
                  background: canRegenerate ? 'rgba(139, 92, 246, 0.1)' : 'transparent',
                  border: canRegenerate ? '1px solid rgba(139, 92, 246, 0.3)' : '1px solid var(--border-subtle)',
                  color: canRegenerate ? '#8b5cf6' : 'var(--text-tertiary)',
                  fontWeight: 500,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    background: canRegenerate ? 'rgba(139, 92, 246, 0.2)' : 'transparent',
                    border: canRegenerate ? '1px solid rgba(139, 92, 246, 0.5)' : '1px solid var(--border-subtle)',
                  },
                },
              }}
            >
              Regenerate
            </Button>
          )}
        </Group>
        <SimpleGrid cols={{ base: 4, sm: 8 }} spacing={4} verticalSpacing="xs">
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
