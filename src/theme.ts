/**
 * Mantine theme configuration for Termicolor.
 * Phosphor Terminal aesthetic - dark, glowing, cyberpunk.
 */

import { createTheme, rem, MantineColorsTuple } from '@mantine/core';

// Phosphor green palette
const phosphor: MantineColorsTuple = [
  '#e8fff0',
  '#d0ffe0',
  '#a3ffc2',
  '#6eff99',
  '#39ff14', // Main phosphor green
  '#2eb810',
  '#259a0d',
  '#1c7d0a',
  '#146008',
  '#0d4305',
];

// Amber accent palette
const amber: MantineColorsTuple = [
  '#fff8e6',
  '#ffefcc',
  '#ffe099',
  '#ffd066',
  '#ffb000', // Main amber
  '#cc8c00',
  '#996900',
  '#664600',
  '#4d3500',
  '#332300',
];

// Dark surface palette
const dark: MantineColorsTuple = [
  '#e8e8ea',
  '#c8c8cc',
  '#888899',
  '#555566',
  '#333344',
  '#1a1b23', // Elevated surface
  '#121318', // Surface
  '#0d0d10',
  '#0a0a0c', // Deep background
  '#050506',
];

export const theme = createTheme({
  primaryColor: 'phosphor',
  colors: {
    phosphor,
    amber,
    dark,
  },
  black: '#0a0a0c',
  white: '#e8e8e8',
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
        bg: 'rgba(26, 27, 35, 0.6)',
      },
      styles: {
        root: {
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.06)',
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
          backgroundColor: 'rgba(18, 19, 24, 0.8)',
          borderColor: 'rgba(255, 255, 255, 0.1)',
          '&:focus': {
            borderColor: 'rgba(57, 255, 20, 0.5)',
          },
        },
      },
    },
    Modal: {
      styles: {
        content: {
          backgroundColor: 'rgba(26, 27, 35, 0.95)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(57, 255, 20, 0.1)',
        },
        header: {
          backgroundColor: 'transparent',
        },
      },
    },
    Slider: {
      styles: {
        track: {
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
        },
        bar: {
          backgroundColor: '#39ff14',
        },
        thumb: {
          backgroundColor: '#39ff14',
          borderColor: '#39ff14',
          boxShadow: '0 0 10px rgba(57, 255, 20, 0.5)',
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
