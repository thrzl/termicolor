/**
 * Main color mapping component combining ANSI and UI color editors.
 * Phosphor Terminal aesthetic.
 */

import { Stack, SimpleGrid, Paper, Text, Group, Button, SegmentedControl, Box } from '@mantine/core';
import { IconRefresh, IconSun, IconMoon } from '@tabler/icons-react';
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
  isDarkMode: boolean;
  minContrast: number;
  readabilityReport: ReadabilityReport;
  onANSIColorChange: (name: ANSIColorName, color: RGBColor) => void;
  onUIColorChange: (name: UIColorName, color: RGBColor) => void;
  onToggleMode: () => void;
  onRegenerate: () => void;
  onMinContrastChange: (value: number) => void;
  onAutoFix: () => void;
}

/**
 * Full color scheme mapper with ANSI and UI color editing.
 */
export function ColorMapper({
  scheme,
  extractedColors,
  isDarkMode,
  minContrast,
  readabilityReport,
  onANSIColorChange,
  onUIColorChange,
  onToggleMode,
  onRegenerate,
  onMinContrastChange,
  onAutoFix,
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

      {/* Theme Type & Regenerate */}
      <Paper
        p="md"
        radius="md"
        style={{
          background: 'rgba(26, 27, 35, 0.6)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.06)',
        }}
      >
        <Group justify="space-between" wrap="wrap" gap="sm">
          <Box>
            <Text size="sm" fw={600} mb={6} style={{ color: 'var(--text-secondary)' }}>
              Theme Mode
            </Text>
            <SegmentedControl
              value={isDarkMode ? 'dark' : 'light'}
              onChange={(value) => {
                if ((value === 'dark') !== isDarkMode) {
                  onToggleMode();
                }
              }}
              radius="md"
              styles={{
                root: {
                  background: 'rgba(10, 10, 12, 0.8)',
                  border: '1px solid rgba(57, 255, 20, 0.1)',
                },
                indicator: {
                  background: 'linear-gradient(135deg, #2eb810 0%, #39ff14 100%)',
                  boxShadow: '0 0 10px rgba(57, 255, 20, 0.3)',
                },
                label: {
                  color: 'var(--text-secondary)',
                  '&[data-active]': {
                    color: '#000',
                  },
                },
              }}
              data={[
                {
                  value: 'dark',
                  label: (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                      <IconMoon size={14} />
                      Dark
                    </span>
                  ),
                },
                {
                  value: 'light',
                  label: (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                      <IconSun size={14} />
                      Light
                    </span>
                  ),
                },
              ]}
            />
          </Box>
          <Button
            variant="outline"
            leftSection={<IconRefresh size={16} />}
            onClick={onRegenerate}
            disabled={!hasColors}
            radius="md"
            style={{
              borderColor: 'rgba(57, 255, 20, 0.3)',
              color: '#39ff14',
            }}
          >
            Regenerate from Image
          </Button>
        </Group>
      </Paper>

      {/* ANSI Colors Grid */}
      <ANSIColorGrid
        colors={scheme.ansi}
        onChange={onANSIColorChange}
        contrastInfo={readabilityReport.ansiContrast}
      />

      {/* UI Colors */}
      <Paper
        p="md"
        radius="md"
        style={{
          background: 'rgba(26, 27, 35, 0.6)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.06)',
        }}
      >
        <Stack gap="sm">
          <Text fw={600} size="sm" style={{ color: 'var(--text-secondary)' }}>
            UI Colors
          </Text>
          <SimpleGrid cols={{ base: 2, sm: 3, md: 5 }} spacing="xs">
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
