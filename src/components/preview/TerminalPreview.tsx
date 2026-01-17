/**
 * Terminal preview component - the hero element.
 * Glowing CRT-inspired terminal mockup.
 */

import { Box, Text, Group } from '@mantine/core';
import { useState } from 'react';
import type { ColorScheme } from '@/types/color';
import { rgbToHex } from '@/lib/color/conversion';
import { ANSI_COLOR_ORDER } from '@/lib/iterm/schema';

interface TerminalPreviewProps {
  scheme: ColorScheme;
}

type ViewMode = 'bash' | 'code' | 'swatches';

/**
 * Terminal window traffic lights.
 */
function TrafficLights() {
  return (
    <Group gap={8}>
      <Box
        style={{
          width: 12,
          height: 12,
          borderRadius: '50%',
          backgroundColor: '#ff5f57',
          boxShadow: '0 0 8px rgba(255, 95, 87, 0.6)',
        }}
      />
      <Box
        style={{
          width: 12,
          height: 12,
          borderRadius: '50%',
          backgroundColor: '#febc2e',
          boxShadow: '0 0 8px rgba(254, 188, 46, 0.6)',
        }}
      />
      <Box
        style={{
          width: 12,
          height: 12,
          borderRadius: '50%',
          backgroundColor: '#28c840',
          boxShadow: '0 0 8px rgba(40, 200, 64, 0.6)',
        }}
      />
    </Group>
  );
}

/**
 * Tab button for view switching.
 */
function TabButton({
  active,
  onClick,
  children,
  fg,
  accent,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  fg: string;
  accent: string;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        background: active ? accent : 'transparent',
        color: active ? '#000' : fg,
        border: 'none',
        padding: '6px 14px',
        borderRadius: 6,
        fontSize: 12,
        fontFamily: '"JetBrains Mono", monospace',
        fontWeight: 500,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        opacity: active ? 1 : 0.7,
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
      }}
    >
      {children}
    </button>
  );
}

/**
 * Color swatches view.
 */
function SwatchesView({ scheme }: { scheme: ColorScheme }) {
  const fg = rgbToHex(scheme.ui.foreground);

  return (
    <Box>
      <Text
        size="xs"
        style={{
          color: fg,
          opacity: 0.5,
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          marginBottom: 16,
          fontFamily: '"JetBrains Mono", monospace',
        }}
      >
        Standard Colors (0-7)
      </Text>
      <Group gap={8} mb="md">
        {ANSI_COLOR_ORDER.slice(0, 8).map((name, i) => (
          <Box key={name} style={{ textAlign: 'center' }}>
            <Box
              style={{
                width: 40,
                height: 28,
                backgroundColor: rgbToHex(scheme.ansi[name]),
                borderRadius: 4,
                boxShadow: `0 0 12px ${rgbToHex(scheme.ansi[name])}66`,
                marginBottom: 4,
              }}
            />
            <Text size="xs" ff="monospace" style={{ color: fg, opacity: 0.5 }}>
              {i}
            </Text>
          </Box>
        ))}
      </Group>
      <Text
        size="xs"
        style={{
          color: fg,
          opacity: 0.5,
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          marginBottom: 16,
          fontFamily: '"JetBrains Mono", monospace',
        }}
      >
        Bright Colors (8-15)
      </Text>
      <Group gap={8}>
        {ANSI_COLOR_ORDER.slice(8).map((name, i) => (
          <Box key={name} style={{ textAlign: 'center' }}>
            <Box
              style={{
                width: 40,
                height: 28,
                backgroundColor: rgbToHex(scheme.ansi[name]),
                borderRadius: 4,
                boxShadow: `0 0 12px ${rgbToHex(scheme.ansi[name])}66`,
                marginBottom: 4,
              }}
            />
            <Text size="xs" ff="monospace" style={{ color: fg, opacity: 0.5 }}>
              {i + 8}
            </Text>
          </Box>
        ))}
      </Group>
    </Box>
  );
}

/**
 * Bash prompt view.
 */
function BashView({ scheme }: { scheme: ColorScheme }) {
  const fg = rgbToHex(scheme.ui.foreground);
  const green = rgbToHex(scheme.ansi.green);
  const blue = rgbToHex(scheme.ansi.blue);
  const cyan = rgbToHex(scheme.ansi.cyan);
  const yellow = rgbToHex(scheme.ansi.yellow);
  const red = rgbToHex(scheme.ansi.red);
  const magenta = rgbToHex(scheme.ansi.magenta);

  const lineStyle = {
    fontFamily: '"JetBrains Mono", monospace',
    fontSize: 13,
    lineHeight: 1.8,
  };

  return (
    <Box style={lineStyle}>
      <div>
        <span style={{ color: green, textShadow: `0 0 10px ${green}66` }}>user@macbook</span>
        <span style={{ color: fg }}>:</span>
        <span style={{ color: blue, textShadow: `0 0 10px ${blue}66` }}>~/projects/termicolor</span>
        <span style={{ color: magenta }}> (main)</span>
        <span style={{ color: fg }}>$ git status</span>
      </div>
      <div style={{ color: fg }}>
        On branch <span style={{ color: magenta }}>main</span>
      </div>
      <div style={{ color: fg }}>Changes not staged for commit:</div>
      <div style={{ color: red, paddingLeft: 20, textShadow: `0 0 8px ${red}44` }}>
        modified:   src/App.tsx
      </div>
      <div style={{ color: green, paddingLeft: 20, textShadow: `0 0 8px ${green}44` }}>
        new file:   src/theme.ts
      </div>
      <div style={{ marginTop: 12 }}>
        <span style={{ color: green, textShadow: `0 0 10px ${green}66` }}>user@macbook</span>
        <span style={{ color: fg }}>:</span>
        <span style={{ color: blue, textShadow: `0 0 10px ${blue}66` }}>~/projects/termicolor</span>
        <span style={{ color: magenta }}> (main)</span>
        <span style={{ color: fg }}>$ npm run dev</span>
      </div>
      <div style={{ color: cyan, textShadow: `0 0 10px ${cyan}66` }}>
        VITE v6.0.1 ready in 234 ms
      </div>
      <div style={{ color: fg }}>
        ➜  Local: <span style={{ color: cyan }}>http://localhost:5173/</span>
      </div>
      <div style={{ marginTop: 12 }}>
        <span style={{ color: green, textShadow: `0 0 10px ${green}66` }}>user@macbook</span>
        <span style={{ color: fg }}>:</span>
        <span style={{ color: blue, textShadow: `0 0 10px ${blue}66` }}>~/projects/termicolor</span>
        <span style={{ color: magenta }}> (main)</span>
        <span style={{ color: fg }}>$ </span>
        <span
          style={{
            color: yellow,
            textShadow: `0 0 8px ${yellow}`,
            animation: 'blink 1s step-end infinite',
          }}
        >
          █
        </span>
      </div>
    </Box>
  );
}

/**
 * Code syntax view.
 */
function CodeView({ scheme }: { scheme: ColorScheme }) {
  const fg = rgbToHex(scheme.ui.foreground);
  const green = rgbToHex(scheme.ansi.green);
  const blue = rgbToHex(scheme.ansi.blue);
  const cyan = rgbToHex(scheme.ansi.cyan);
  const yellow = rgbToHex(scheme.ansi.yellow);
  const red = rgbToHex(scheme.ansi.red);
  const magenta = rgbToHex(scheme.ansi.magenta);
  const comment = rgbToHex(scheme.ansi.brightBlack);

  const lineStyle = {
    fontFamily: '"JetBrains Mono", monospace',
    fontSize: 13,
    lineHeight: 1.8,
  };

  return (
    <Box style={lineStyle}>
      <div style={{ color: comment }}>{'// Extract colors from an image'}</div>
      <div>
        <span style={{ color: magenta }}>async function</span>
        <span style={{ color: blue }}> extractColors</span>
        <span style={{ color: fg }}>(</span>
        <span style={{ color: red }}>image</span>
        <span style={{ color: fg }}>: </span>
        <span style={{ color: cyan }}>HTMLImageElement</span>
        <span style={{ color: fg }}>) {'{'}</span>
      </div>
      <div style={{ paddingLeft: 20 }}>
        <span style={{ color: magenta }}>const</span>
        <span style={{ color: fg }}> colors = </span>
        <span style={{ color: magenta }}>await</span>
        <span style={{ color: blue }}> colorThief</span>
        <span style={{ color: fg }}>.</span>
        <span style={{ color: yellow }}>getPalette</span>
        <span style={{ color: fg }}>(image, </span>
        <span style={{ color: green }}>32</span>
        <span style={{ color: fg }}>);</span>
      </div>
      <div style={{ paddingLeft: 20 }}>
        <span style={{ color: magenta }}>return</span>
        <span style={{ color: fg }}> colors.</span>
        <span style={{ color: yellow }}>map</span>
        <span style={{ color: fg }}>(</span>
        <span style={{ color: red }}>c</span>
        <span style={{ color: fg }}> {'=>'} {'({'}</span>
      </div>
      <div style={{ paddingLeft: 40 }}>
        <span style={{ color: fg }}>r: </span>
        <span style={{ color: red }}>c</span>
        <span style={{ color: fg }}>[</span>
        <span style={{ color: green }}>0</span>
        <span style={{ color: fg }}>], g: </span>
        <span style={{ color: red }}>c</span>
        <span style={{ color: fg }}>[</span>
        <span style={{ color: green }}>1</span>
        <span style={{ color: fg }}>], b: </span>
        <span style={{ color: red }}>c</span>
        <span style={{ color: fg }}>[</span>
        <span style={{ color: green }}>2</span>
        <span style={{ color: fg }}>]</span>
      </div>
      <div style={{ paddingLeft: 20 }}>
        <span style={{ color: fg }}>{'}'}));</span>
      </div>
      <div style={{ color: fg }}>{'}'}</div>
    </Box>
  );
}

/**
 * Full terminal preview - the hero component.
 */
export function TerminalPreview({ scheme }: TerminalPreviewProps) {
  const [view, setView] = useState<ViewMode>('bash');
  const bg = rgbToHex(scheme.ui.background);
  const fg = rgbToHex(scheme.ui.foreground);
  const accent = rgbToHex(scheme.ansi.green);

  return (
    <Box
      style={{
        position: 'relative',
        borderRadius: 16,
        overflow: 'hidden',
        // Outer glow
        boxShadow: `
          0 0 0 1px rgba(57, 255, 20, 0.15),
          0 4px 20px rgba(0, 0, 0, 0.5),
          0 0 60px rgba(57, 255, 20, 0.2),
          0 0 100px rgba(57, 255, 20, 0.15),
          0 0 140px rgba(57, 255, 20, 0.1)
        `,
        transition: 'box-shadow 0.3s ease, transform 0.3s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = `
          0 0 0 1px rgba(57, 255, 20, 0.3),
          0 8px 30px rgba(0, 0, 0, 0.6),
          0 0 80px rgba(57, 255, 20, 0.35),
          0 0 120px rgba(57, 255, 20, 0.25),
          0 0 160px rgba(57, 255, 20, 0.15)
        `;
        e.currentTarget.style.transform = 'translateY(-4px) scale(1.01)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = `
          0 0 0 1px rgba(57, 255, 20, 0.15),
          0 4px 20px rgba(0, 0, 0, 0.5),
          0 0 60px rgba(57, 255, 20, 0.2),
          0 0 100px rgba(57, 255, 20, 0.15),
          0 0 140px rgba(57, 255, 20, 0.1)
        `;
        e.currentTarget.style.transform = 'translateY(0) scale(1)';
      }}
    >
      {/* Scanlines overlay */}
      <Box
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          background: `repeating-linear-gradient(
            0deg,
            rgba(0, 0, 0, 0.1) 0px,
            rgba(0, 0, 0, 0.1) 1px,
            transparent 1px,
            transparent 2px
          )`,
          zIndex: 20,
          opacity: 0.5,
        }}
      />

      {/* CRT vignette */}
      <Box
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          background: `radial-gradient(
            ellipse at center,
            transparent 0%,
            transparent 60%,
            rgba(0, 0, 0, 0.3) 100%
          )`,
          zIndex: 15,
        }}
      />

      {/* Title bar */}
      <Box
        style={{
          background: 'linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <TrafficLights />
        <Text
          size="xs"
          ff="monospace"
          style={{
            color: fg,
            opacity: 0.4,
            letterSpacing: '0.05em',
          }}
        >
          termicolor — {view}
        </Text>
        <Box style={{ width: 52 }} /> {/* Spacer for centering */}
      </Box>

      {/* Tab bar */}
      <Box
        style={{
          background: bg,
          padding: '8px 12px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
        }}
      >
        <Group gap={4}>
          <TabButton active={view === 'swatches'} onClick={() => setView('swatches')} fg={fg} accent={accent}>
            Swatches
          </TabButton>
          <TabButton active={view === 'bash'} onClick={() => setView('bash')} fg={fg} accent={accent}>
            Bash
          </TabButton>
          <TabButton active={view === 'code'} onClick={() => setView('code')} fg={fg} accent={accent}>
            Code
          </TabButton>
        </Group>
      </Box>

      {/* Content area */}
      <Box
        style={{
          background: bg,
          padding: 20,
          minHeight: 220,
          position: 'relative',
        }}
      >
        {/* Inner shadow for depth */}
        <Box
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            boxShadow: 'inset 0 4px 30px rgba(0, 0, 0, 0.4)',
            zIndex: 10,
          }}
        />

        <Box style={{ position: 'relative', zIndex: 5 }}>
          {view === 'swatches' && <SwatchesView scheme={scheme} />}
          {view === 'bash' && <BashView scheme={scheme} />}
          {view === 'code' && <CodeView scheme={scheme} />}
        </Box>
      </Box>
    </Box>
  );
}
