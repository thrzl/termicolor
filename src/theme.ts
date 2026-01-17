/**
 * Mantine theme configuration for Termicolor.
 * Linear-style purple gradient aesthetic - dark, modern, elegant.
 */

import { createTheme, rem, MantineColorsTuple } from '@mantine/core';

// Purple gradient palette
const purple: MantineColorsTuple = [
  '#f3e8ff',
  '#e9d5ff',
  '#d8b4fe',
  '#c084fc',
  '#a78bfa', // violet-400
  '#8b5cf6', // Main violet-500
  '#7c3aed',
  '#6d28d9',
  '#5b21b6',
  '#4c1d95',
];

// Orange accent palette
const orange: MantineColorsTuple = [
  '#fff7ed',
  '#ffedd5',
  '#fed7aa',
  '#fdba74',
  '#fb923c',
  '#f97316', // Main orange-500
  '#ea580c',
  '#c2410c',
  '#9a3412',
  '#7c2d12',
];

// Dark surface palette
const dark: MantineColorsTuple = [
  '#f1f5f9', // slate-100
  '#cbd5e1',
  '#94a3b8', // slate-400
  '#64748b', // slate-500
  '#475569',
  '#334155',
  '#1e293b',
  '#12121a', // Surface
  '#0a0a0f', // Deep background
  '#050508',
];

export const theme = createTheme({
  primaryColor: 'purple',
  colors: {
    purple,
    orange,
    dark,
  },
  black: '#0a0a0f',
  white: '#f1f5f9',
  fontFamily: '"Space Grotesk", system-ui, -apple-system, sans-serif',
  fontFamilyMonospace: '"JetBrains Mono", ui-monospace, "SF Mono", Menlo, Monaco, monospace',
  headings: {
    fontFamily: '"JetBrains Mono", monospace',
    fontWeight: '700',
  },
  defaultRadius: 'md',
  cursorType: 'pointer',
  components: {
    Paper: {
      defaultProps: {
        bg: 'rgba(18, 18, 30, 0.6)',
      },
      styles: {
        root: {
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(139, 92, 246, 0.1)',
        },
      },
    },
    Button: {
      defaultProps: {
        radius: 'md',
      },
      styles: {
        root: {
          fontWeight: 600,
          fontFamily: '"Space Grotesk", sans-serif',
        },
      },
    },
    ActionIcon: {
      defaultProps: {
        radius: 'md',
      },
    },
    Badge: {
      defaultProps: {
        radius: 'sm',
      },
      styles: {
        root: {
          fontFamily: '"JetBrains Mono", monospace',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        },
      },
    },
    Tabs: {
      styles: {
        tab: {
          fontWeight: 500,
          fontFamily: '"Space Grotesk", sans-serif',
        },
      },
    },
    Text: {
      styles: {
        root: {
          fontFamily: '"Space Grotesk", sans-serif',
        },
      },
    },
    Title: {
      styles: {
        root: {
          fontFamily: '"JetBrains Mono", monospace',
        },
      },
    },
    TextInput: {
      styles: {
        input: {
          backgroundColor: 'rgba(18, 18, 30, 0.8)',
          borderColor: 'rgba(139, 92, 246, 0.1)',
          '&:focus': {
            borderColor: 'rgba(139, 92, 246, 0.5)',
          },
        },
      },
    },
    Modal: {
      styles: {
        content: {
          backgroundColor: 'rgba(18, 18, 30, 0.95)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(139, 92, 246, 0.1)',
        },
        header: {
          backgroundColor: 'transparent',
        },
      },
    },
    Slider: {
      styles: {
        track: {
          backgroundColor: 'rgba(139, 92, 246, 0.1)',
        },
        bar: {
          backgroundColor: '#8b5cf6',
        },
        thumb: {
          backgroundColor: '#8b5cf6',
          borderColor: '#8b5cf6',
          boxShadow: '0 0 10px rgba(139, 92, 246, 0.5)',
        },
      },
    },
  },
  spacing: {
    xs: rem(8),
    sm: rem(12),
    md: rem(16),
    lg: rem(24),
    xl: rem(32),
  },
});
