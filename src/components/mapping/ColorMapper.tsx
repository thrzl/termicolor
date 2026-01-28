/**
 * Main color mapping component combining ANSI and UI color editors.
 * Linear-style purple gradient aesthetic.
 */

import { Stack, SimpleGrid, Paper, Text, Group, Button, Switch, Slider, Tooltip } from '@mantine/core';
import { IconBrush, IconDice5, IconSparkles, IconDroplet } from '@tabler/icons-react';
import type { ColorScheme, ANSIColorName, UIColorName, RGBColor, ExtractedColor } from '@/types/color';
import { UI_COLOR_ORDER, UI_DISPLAY_NAMES } from '@/lib/iterm/schema';
import type { ReadabilityReport } from '@/lib/color/readability';
import { getContrastInfo } from '@/lib/color/readability';
import { ANSIColorGrid } from './ANSIColorGrid';
import { ColorSlotEditor } from './ColorSlotEditor';
import { ReadabilityScore } from './ReadabilityScore';

interface ColorMapperProps {
  scheme: ColorScheme;
  extractedColors: ExtractedColor[];
  minContrast: number;
  readabilityReport: ReadabilityReport;
  vibrantSyntax: boolean;
  saturationLevel: number;
  onANSIColorChange: (name: ANSIColorName, color: RGBColor) => void;
  onUIColorChange: (name: UIColorName, color: RGBColor) => void;
  onRegenerate: () => void;
  onRandomize: () => void;
  onRandomizeUI: () => void;
  onMinContrastChange: (value: number) => void;
  onAutoFix: () => void;
  onVibrantSyntaxChange: (enabled: boolean) => void;
  onSaturationLevelChange: (level: number) => void;
}

/**
 * Full color scheme mapper with ANSI and UI color editing.
 */
export function ColorMapper({
  scheme,
  extractedColors,
  minContrast,
  readabilityReport,
  vibrantSyntax,
  saturationLevel,
  onANSIColorChange,
  onUIColorChange,
  onRegenerate,
  onRandomize,
  onRandomizeUI,
  onMinContrastChange,
  onAutoFix,
  onVibrantSyntaxChange,
  onSaturationLevelChange,
}: ColorMapperProps) {
  const hasColors = extractedColors.length > 0;

  // Compute UI color contrast info
  const uiContrastInfo = {
    foreground: getContrastInfo(scheme.ui.foreground, scheme.ui.background),
    cursor: getContrastInfo(scheme.ui.cursor, scheme.ui.background),
    cursorText: getContrastInfo(scheme.ui.cursorText, scheme.ui.cursor),
    selection: getContrastInfo(scheme.ui.selection, scheme.ui.background),
    selectionText: getContrastInfo(scheme.ui.selectionText, scheme.ui.selection),
  };

  return (
    <Stack gap="md">
      {/* Readability Score with contrast slider */}
      <ReadabilityScore
        report={readabilityReport}
        minContrast={minContrast}
        onMinContrastChange={onMinContrastChange}
        onAutoFix={onAutoFix}
      />

      {/* Color Adjustments */}
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
        <Stack gap="md">
          <Group justify="space-between" align="center">
            <Tooltip
              label="Replace gray ANSI colors with saturated versions for better syntax highlighting visibility"
              multiline
              w={250}
            >
              <Group gap="xs" style={{ cursor: 'help' }}>
                <IconSparkles size={16} style={{ color: '#f59e0b' }} />
                <Text fw={500} size="sm" style={{ color: 'var(--text-secondary)' }}>
                  Vibrant syntax colors
                </Text>
              </Group>
            </Tooltip>
            <Switch
              checked={vibrantSyntax}
              onChange={(e) => onVibrantSyntaxChange(e.currentTarget.checked)}
              size="sm"
              styles={{
                track: {
                  backgroundColor: vibrantSyntax ? '#8b5cf6' : 'var(--border-subtle)',
                  borderColor: vibrantSyntax ? '#8b5cf6' : 'var(--border-subtle)',
                },
                thumb: {
                  backgroundColor: '#fff',
                  borderColor: vibrantSyntax ? '#8b5cf6' : 'var(--border-subtle)',
                },
              }}
            />
          </Group>
          <Group gap="md" align="center">
            <Group gap="xs" style={{ minWidth: 100 }}>
              <IconDroplet size={16} style={{ color: '#8b5cf6' }} />
              <Text fw={500} size="sm" style={{ color: 'var(--text-secondary)' }}>
                Saturation
              </Text>
            </Group>
            <Slider
              value={saturationLevel}
              onChange={onSaturationLevelChange}
              min={0.25}
              max={2}
              step={0.05}
              marks={[
                { value: 0.5, label: '50%' },
                { value: 1, label: '100%' },
                { value: 1.5, label: '150%' },
              ]}
              style={{ flex: 1 }}
              styles={{
                track: { background: 'var(--border-subtle)' },
                bar: { background: 'linear-gradient(90deg, #8b5cf6, #a78bfa)' },
                thumb: { borderColor: '#8b5cf6', background: '#fff' },
                markLabel: { fontSize: 10, color: 'var(--text-tertiary)' },
              }}
            />
          </Group>
        </Stack>
      </Paper>

      {/* ANSI Colors Grid with regenerate button */}
      <ANSIColorGrid
        colors={scheme.ansi}
        onChange={onANSIColorChange}
        contrastInfo={readabilityReport.ansiContrast}
        onRegenerate={onRegenerate}
        onRandomize={onRandomize}
        canRegenerate={hasColors}
      />

      {/* UI Colors - 7 colors in a single responsive row */}
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
              <IconBrush size={16} style={{ color: '#8b5cf6' }} />
              <Text fw={600} size="sm" style={{ color: 'var(--text-secondary)' }}>
                UI Colors
              </Text>
            </Group>
            <Button
              variant="subtle"
              size="xs"
              leftSection={<IconDice5 size={14} />}
              onClick={onRandomizeUI}
              styles={{
                root: {
                  background: 'rgba(139, 92, 246, 0.1)',
                  border: '1px solid rgba(139, 92, 246, 0.3)',
                  color: '#8b5cf6',
                  fontWeight: 500,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    background: 'rgba(139, 92, 246, 0.2)',
                    border: '1px solid rgba(139, 92, 246, 0.5)',
                  },
                },
              }}
            >
              Randomize
            </Button>
          </Group>
          <SimpleGrid cols={{ base: 4, sm: 7 }} spacing={4} verticalSpacing="xs">
            {UI_COLOR_ORDER.map((name) => (
              <ColorSlotEditor
                key={name}
                label={UI_DISPLAY_NAMES[name]}
                color={scheme.ui[name]}
                onChange={(color) => onUIColorChange(name, color)}
                contrastInfo={uiContrastInfo[name as keyof typeof uiContrastInfo]}
                size={28}
              />
            ))}
          </SimpleGrid>
        </Stack>
      </Paper>
    </Stack>
  );
}
