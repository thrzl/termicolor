/**
 * Profile card component for displaying saved profiles.
 * Phosphor Terminal aesthetic.
 */

import { Card, Image, Text, Group, ActionIcon, Stack, Tooltip, Box } from '@mantine/core';
import { IconTrash, IconDownload, IconEdit } from '@tabler/icons-react';
import type { Profile } from '@/types/profile';
import { rgbToHex } from '@/lib/color/conversion';

interface ProfileCardProps {
  profile: Profile;
  onLoad: () => void;
  onDelete: () => void;
  onExport: () => void;
}

/**
 * Card displaying a saved color scheme profile.
 */
export function ProfileCard({ profile, onLoad, onDelete, onExport }: ProfileCardProps) {
  // Create a mini preview of the color scheme
  const colors = [
    profile.scheme.ui.background,
    profile.scheme.ansi.red,
    profile.scheme.ansi.green,
    profile.scheme.ansi.yellow,
    profile.scheme.ansi.blue,
    profile.scheme.ansi.magenta,
    profile.scheme.ansi.cyan,
    profile.scheme.ui.foreground,
  ];

  return (
    <Card
      padding="sm"
      radius="md"
      style={{
        background: 'rgba(26, 27, 35, 0.6)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.06)',
        transition: 'all 0.2s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'rgba(57, 255, 20, 0.3)';
        e.currentTarget.style.boxShadow = '0 0 20px rgba(57, 255, 20, 0.1)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.06)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <Card.Section>
        {profile.thumbnail ? (
          <Image
            src={profile.thumbnail}
            height={100}
            alt={profile.name}
            style={{ cursor: 'pointer' }}
            onClick={onLoad}
          />
        ) : (
          <Group
            gap={0}
            style={{ height: 100, cursor: 'pointer' }}
            onClick={onLoad}
          >
            {colors.map((color, i) => (
              <Box
                key={i}
                style={{
                  flex: 1,
                  height: '100%',
                  backgroundColor: rgbToHex(color),
                }}
              />
            ))}
          </Group>
        )}
      </Card.Section>

      <Stack gap="xs" mt="sm">
        <Group justify="space-between">
          <Text
            fw={500}
            size="sm"
            style={{
              cursor: 'pointer',
              color: 'var(--text-primary)',
              fontFamily: '"Space Grotesk", sans-serif',
            }}
            onClick={onLoad}
          >
            {profile.name}
          </Text>
          <Group gap={4}>
            <Tooltip label="Load profile">
              <ActionIcon
                variant="subtle"
                size="sm"
                onClick={onLoad}
                style={{ color: '#39ff14' }}
              >
                <IconEdit size={14} />
              </ActionIcon>
            </Tooltip>
            <Tooltip label="Export">
              <ActionIcon
                variant="subtle"
                size="sm"
                onClick={onExport}
                style={{ color: '#ffb000' }}
              >
                <IconDownload size={14} />
              </ActionIcon>
            </Tooltip>
            <Tooltip label="Delete">
              <ActionIcon
                variant="subtle"
                size="sm"
                onClick={onDelete}
                style={{ color: '#ff5f57' }}
              >
                <IconTrash size={14} />
              </ActionIcon>
            </Tooltip>
          </Group>
        </Group>
        <Text size="xs" style={{ color: 'var(--text-muted)' }}>
          {new Date(profile.updatedAt).toLocaleDateString()}
        </Text>
      </Stack>
    </Card>
  );
}
