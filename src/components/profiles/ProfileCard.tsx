/**
 * Profile card component for displaying saved profiles.
 * Linear-style purple gradient aesthetic.
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
        background: 'var(--bg-card)',
        backdropFilter: 'blur(10px)',
        border: '1px solid var(--border-subtle)',
        boxShadow: 'var(--shadow-card)',
        transition: 'all 0.2s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.3)';
        e.currentTarget.style.boxShadow = '0 0 20px rgba(139, 92, 246, 0.15)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--border-subtle)';
        e.currentTarget.style.boxShadow = 'var(--shadow-card)';
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

      <Stack gap={8} mt="sm" align="center">
        <Text
          fw={500}
          size="sm"
          ta="center"
          style={{
            cursor: 'pointer',
            color: 'var(--text-primary)',
            fontFamily: '"Space Grotesk", sans-serif',
          }}
          onClick={onLoad}
        >
          {profile.name}
        </Text>
        <Group gap={8} justify="center" wrap="nowrap">
          <Tooltip label="Load profile">
            <ActionIcon
              variant="subtle"
              size="sm"
              onClick={onLoad}
              style={{ color: '#8b5cf6' }}
            >
              <IconEdit size={16} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Export">
            <ActionIcon
              variant="subtle"
              size="sm"
              onClick={onExport}
              style={{ color: '#ffb000' }}
            >
              <IconDownload size={16} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Delete">
            <ActionIcon
              variant="subtle"
              size="sm"
              onClick={onDelete}
              style={{ color: '#ff5f57' }}
            >
              <IconTrash size={16} />
            </ActionIcon>
          </Tooltip>
        </Group>
        <Text size="xs" style={{ color: 'var(--text-muted)' }}>
          {new Date(profile.updatedAt).toLocaleDateString()}
        </Text>
      </Stack>
    </Card>
  );
}
