/**
 * Main application shell layout.
 * Linear-style purple gradient aesthetic - minimal wrapper with floating icons.
 */

import { Box, ActionIcon, Tooltip, Group } from '@mantine/core';
import { IconBrandGithub, IconSun, IconMoon } from '@tabler/icons-react';
import { useAppTheme } from '@/hooks/useAppTheme';

interface AppShellProps {
  children: React.ReactNode;
}

/**
 * Main layout wrapper - minimal shell with floating top-right icons.
 */
export function AppShell({ children }: AppShellProps) {
  const { isDark, toggleTheme } = useAppTheme();

  const iconButtonStyle = {
    background: isDark ? 'rgba(26, 27, 35, 0.8)' : 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(10px)',
    border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)'}`,
    color: 'var(--text-secondary)',
    transition: 'all 0.2s ease',
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => {
    e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.3)';
    e.currentTarget.style.color = '#8b5cf6';
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => {
    e.currentTarget.style.borderColor = isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)';
    e.currentTarget.style.color = 'var(--text-secondary)';
  };

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
        <Tooltip label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}>
          <ActionIcon
            variant="subtle"
            size="lg"
            radius="md"
            onClick={toggleTheme}
            style={iconButtonStyle}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            {isDark ? <IconSun size={18} /> : <IconMoon size={18} />}
          </ActionIcon>
        </Tooltip>
        <Tooltip label="View on GitHub">
          <ActionIcon
            variant="subtle"
            size="lg"
            component="a"
            href="https://github.com/WouterDurnez"
            target="_blank"
            radius="md"
            style={iconButtonStyle}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
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
