/**
 * Main application shell layout.
 * Phosphor Terminal aesthetic - minimal wrapper with floating icons.
 */

import { Box, ActionIcon, Tooltip, Group } from '@mantine/core';
import { IconBrandGithub } from '@tabler/icons-react';

interface AppShellProps {
  children: React.ReactNode;
}

/**
 * Main layout wrapper - minimal shell with floating top-right icons.
 */
export function AppShell({ children }: AppShellProps) {
  return (
    <Box
      style={{
        minHeight: '100vh',
        background: 'var(--bg-deep)',
        position: 'relative',
      }}
    >
      {/* Floating top-right icons */}
      <Group
        gap="xs"
        style={{
          position: 'fixed',
          top: 16,
          right: 16,
          zIndex: 100,
        }}
      >
        <Tooltip label="View on GitHub">
          <ActionIcon
            variant="subtle"
            size="lg"
            component="a"
            href="https://github.com"
            target="_blank"
            radius="md"
            style={{
              background: 'rgba(26, 27, 35, 0.8)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              color: 'var(--text-secondary)',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'rgba(57, 255, 20, 0.3)';
              e.currentTarget.style.color = '#39ff14';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.06)';
              e.currentTarget.style.color = 'var(--text-secondary)';
            }}
          >
            <IconBrandGithub size={18} />
          </ActionIcon>
        </Tooltip>
      </Group>

      <Box
        component="main"
        style={{
          position: 'relative',
          zIndex: 1,
          paddingBottom: 48,
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
