/**
 * Profile list/gallery component.
 * Phosphor Terminal aesthetic.
 */

import { SimpleGrid, Paper, Text, Stack, Loader, Center } from '@mantine/core';
import type { Profile } from '@/types/profile';
import { ProfileCard } from './ProfileCard';

interface ProfileListProps {
  profiles: Profile[];
  isLoading: boolean;
  onLoad: (profile: Profile) => void;
  onDelete: (profile: Profile) => void;
  onExport: (profile: Profile) => void;
}

/**
 * Gallery of saved color scheme profiles.
 */
export function ProfileList({
  profiles,
  isLoading,
  onLoad,
  onDelete,
  onExport,
}: ProfileListProps) {
  if (isLoading) {
    return (
      <Center py="xl">
        <Loader color="#39ff14" />
      </Center>
    );
  }

  if (profiles.length === 0) {
    return (
      <Paper
        p="xl"
        radius="lg"
        style={{
          background: 'rgba(26, 27, 35, 0.6)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(57, 255, 20, 0.1)',
        }}
      >
        <Text ta="center" style={{ color: 'var(--text-secondary)' }}>
          No saved profiles yet. Create your first color scheme!
        </Text>
      </Paper>
    );
  }

  return (
    <Stack gap="md">
      <Text fw={600} style={{ color: 'var(--text-secondary)' }}>
        Saved Profiles
      </Text>
      <SimpleGrid cols={{ base: 1, xs: 2 }} spacing="md">
        {profiles.map((profile) => (
          <ProfileCard
            key={profile.id}
            profile={profile}
            onLoad={() => onLoad(profile)}
            onDelete={() => onDelete(profile)}
            onExport={() => onExport(profile)}
          />
        ))}
      </SimpleGrid>
    </Stack>
  );
}
