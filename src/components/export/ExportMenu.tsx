/**
 * Export menu component for downloading color schemes in various formats.
 * Linear-style purple gradient aesthetic with glassmorphism.
 */

import { Menu, Button, Text, Group } from '@mantine/core';
import { IconDownload, IconChevronDown } from '@tabler/icons-react';
import { EXPORT_FORMATS, type ExportFormat } from '@/lib/exporters';

interface ExportMenuProps {
  /** Callback invoked when user selects an export format. */
  onExport: (format: ExportFormat) => void;
  /** Whether the menu trigger button is disabled. */
  disabled?: boolean;
}

/**
 * Dropdown menu for selecting and triggering export to various terminal formats.
 *
 * Displays all available export formats with their file extensions and calls
 * the onExport callback when a format is selected.
 *
 * :param onExport: Callback invoked with the selected export format.
 * :param disabled: Whether the export button should be disabled.
 */
export function ExportMenu({ onExport, disabled = false }: ExportMenuProps) {
  return (
    <Menu
      position="bottom-end"
      withArrow
      shadow="lg"
      styles={{
        dropdown: {
          background: 'var(--bg-card)',
          backdropFilter: 'blur(20px)',
          border: '1px solid var(--border-subtle)',
        },
        item: {
          transition: 'background 0.15s ease',
          '&[data-hovered]': {
            background: 'rgba(139, 92, 246, 0.15)',
          },
        },
        arrow: {
          borderColor: 'var(--border-subtle)',
          background: 'var(--bg-card)',
        },
      }}
    >
      <Menu.Target>
        <Button
          variant="outline"
          leftSection={<IconDownload size={16} />}
          rightSection={<IconChevronDown size={14} />}
          disabled={disabled}
          size="sm"
          style={{
            borderColor: 'rgba(139, 92, 246, 0.3)',
            color: '#8b5cf6',
            fontWeight: 600,
            fontFamily: '"Space Grotesk", sans-serif',
          }}
        >
          Export
        </Button>
      </Menu.Target>

      <Menu.Dropdown>
        {EXPORT_FORMATS.map((format) => (
          <Menu.Item
            key={format.id}
            onClick={() => onExport(format.id)}
            style={{
              color: 'var(--text-primary)',
              fontFamily: '"Space Grotesk", sans-serif',
            }}
          >
            <Group gap="sm" justify="space-between" wrap="nowrap" w="100%">
              <Group gap="xs">
                <Text size="sm" fw={500}>
                  {format.name}
                </Text>
                {format.experimental && (
                  <Text
                    size="xs"
                    style={{
                      color: '#f59e0b',
                      fontSize: 9,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}
                  >
                    beta
                  </Text>
                )}
              </Group>
              <Text
                size="xs"
                style={{
                  color: 'var(--text-muted)',
                  fontFamily: 'monospace',
                }}
              >
                .{format.extension}
              </Text>
            </Group>
          </Menu.Item>
        ))}
      </Menu.Dropdown>
    </Menu>
  );
}
