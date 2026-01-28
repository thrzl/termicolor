/**
 * Unified theme tuning panel consolidating all color adjustment controls.
 * Combines readability score, contrast, saturation, and vibrant syntax settings.
 */

import {
  Paper,
  Group,
  Text,
  RingProgress,
  Stack,
  Badge,
  Tooltip,
  Slider,
  Box,
  Menu,
  UnstyledButton,
  Switch,
} from '@mantine/core';
import {
  IconWand,
  IconLock,
  IconAdjustments,
  IconSparkles,
  IconDroplet,
  IconContrast,
} from '@tabler/icons-react';
import type { ReadabilityReport } from '@/lib/color/readability';
import { CONTRAST_THRESHOLDS } from '@/lib/color/readability';

interface ThemeTunerProps {
  report: ReadabilityReport;
  minContrast: number;
  vibrantSyntax: boolean;
  saturationLevel: number;
  onMinContrastChange: (value: number) => void;
  onAutoFix?: (keepBackground?: boolean) => void;
  onVibrantSyntaxChange: (enabled: boolean) => void;
  onSaturationLevelChange: (level: number) => void;
}

/**
 * Gets color for score value.
 */
function getScoreColor(score: number): string {
  if (score >= 80) return '#22c55e';
  if (score >= 60) return '#3b82f6';
  if (score >= 40) return '#eab308';
  return '#ef4444';
}

/**
 * Gets label for score value.
 */
function getScoreLabel(score: number): string {
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Fair';
  return 'Poor';
}

/**
 * Counts how many colors meet a given contrast threshold.
 */
function countMeetingThreshold(report: ReadabilityReport, threshold: number): number {
  let count = 0;
  for (const info of Object.values(report.ansiContrast)) {
    if (info.ratio >= threshold) count++;
  }
  if (report.uiContrast.foreground && report.uiContrast.foreground.ratio >= threshold) count++;
  if (report.uiContrast.cursor && report.uiContrast.cursor.ratio >= threshold) count++;
  return count;
}

/**
 * Unified theme tuning panel with all color adjustment controls.
 */
export function ThemeTuner({
  report,
  minContrast,
  vibrantSyntax,
  saturationLevel,
  onMinContrastChange,
  onAutoFix,
  onVibrantSyntaxChange,
  onSaturationLevelChange,
}: ThemeTunerProps) {
  const scoreColor = getScoreColor(report.score);
  const scoreLabel = getScoreLabel(report.score);
  const meetingThreshold = countMeetingThreshold(report, minContrast);
  const needsFix = meetingThreshold < report.total;
  const showAutoFix = needsFix || report.schemeModified;

  const sliderStyles = {
    track: { background: 'rgba(139, 92, 246, 0.15)' },
    bar: { background: 'linear-gradient(90deg, #7c3aed, #8b5cf6)' },
    thumb: {
      borderColor: '#8b5cf6',
      background: '#fff',
      boxShadow: '0 0 8px rgba(139, 92, 246, 0.4)',
    },
    markLabel: { fontSize: 10, color: 'var(--text-tertiary)' },
    mark: { borderColor: 'rgba(139, 92, 246, 0.3)' },
  };

  return (
    <Paper
      p="md"
      radius="md"
      style={{
        background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.04) 0%, rgba(124, 58, 237, 0.02) 100%)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(139, 92, 246, 0.12)',
        boxShadow: '0 4px 24px rgba(0, 0, 0, 0.1)',
      }}
    >
      <Stack gap="lg">
        {/* Header: Score + Magic Wand */}
        <Group justify="space-between" align="center">
          <Group gap="md">
            <Tooltip
              label={`${meetingThreshold}/${report.total} colors meet ${minContrast.toFixed(1)}:1 contrast`}
              position="bottom"
            >
              <Box style={{ position: 'relative', cursor: 'help' }}>
                <RingProgress
                  size={52}
                  thickness={5}
                  roundCaps
                  sections={[{ value: report.score, color: scoreColor }]}
                  label={
                    <Text ta="center" size="sm" fw={700} style={{ color: scoreColor }}>
                      {report.score}
                    </Text>
                  }
                />
              </Box>
            </Tooltip>
            <Stack gap={2}>
              <Group gap="xs">
                <Text fw={600} size="sm" style={{ color: 'var(--text-primary)' }}>
                  Theme Tuner
                </Text>
                <Badge
                  size="xs"
                  radius="sm"
                  style={{
                    background: `${scoreColor}20`,
                    color: scoreColor,
                    border: `1px solid ${scoreColor}40`,
                    textTransform: 'none',
                  }}
                >
                  {scoreLabel}
                </Badge>
              </Group>
              <Text size="xs" style={{ color: 'var(--text-tertiary)' }}>
                {report.passAAA}/{report.total} meet AAA contrast
              </Text>
            </Stack>
          </Group>

          {onAutoFix && showAutoFix && (
            <Menu
              position="bottom-end"
              withArrow
              shadow="lg"
              styles={{
                dropdown: {
                  background: 'var(--bg-card)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid var(--border-subtle)',
                },
                item: {
                  transition: 'background 0.15s ease',
                  '&[data-hovered]': {
                    background: 'rgba(139, 92, 246, 0.15)',
                  },
                },
                arrow: {
                  borderColor: 'var(--border-subtle)',
                  background: 'var(--bg-card)',
                },
              }}
            >
              <Menu.Target>
                <Tooltip label={needsFix ? `Auto-fix ${report.total - meetingThreshold} colors` : 'Re-apply fix'}>
                  <UnstyledButton
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%)',
                      boxShadow: '0 0 16px rgba(139, 92, 246, 0.35)',
                      transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.05)';
                      e.currentTarget.style.boxShadow = '0 0 20px rgba(139, 92, 246, 0.5)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                      e.currentTarget.style.boxShadow = '0 0 16px rgba(139, 92, 246, 0.35)';
                    }}
                  >
                    <IconWand size={18} color="#fff" />
                  </UnstyledButton>
                </Tooltip>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item
                  leftSection={<IconAdjustments size={14} style={{ color: '#8b5cf6' }} />}
                  onClick={() => onAutoFix(false)}
                >
                  <Stack gap={2}>
                    <Text size="sm" fw={500} style={{ color: 'var(--text-primary)' }}>Smart fix</Text>
                    <Text size="xs" style={{ color: 'var(--text-tertiary)' }}>May adjust background if needed</Text>
                  </Stack>
                </Menu.Item>
                <Menu.Item
                  leftSection={<IconLock size={14} style={{ color: '#f59e0b' }} />}
                  onClick={() => onAutoFix(true)}
                >
                  <Stack gap={2}>
                    <Text size="sm" fw={500} style={{ color: 'var(--text-primary)' }}>Keep background</Text>
                    <Text size="xs" style={{ color: 'var(--text-tertiary)' }}>Only adjust foreground colors</Text>
                  </Stack>
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          )}
        </Group>

        {/* Divider */}
        <Box
          style={{
            height: 1,
            background: 'linear-gradient(90deg, transparent, rgba(139, 92, 246, 0.2), transparent)',
          }}
        />

        {/* Controls Grid */}
        <Stack gap="md">
          {/* Contrast Slider */}
          <Box>
            <Group justify="space-between" mb={8}>
              <Group gap="xs">
                <IconContrast size={14} style={{ color: '#8b5cf6' }} />
                <Text size="xs" fw={500} style={{ color: 'var(--text-secondary)' }}>
                  Min Contrast
                </Text>
              </Group>
              <Badge
                size="xs"
                radius="sm"
                style={{
                  background: 'rgba(139, 92, 246, 0.1)',
                  color: '#8b5cf6',
                  border: '1px solid rgba(139, 92, 246, 0.2)',
                }}
              >
                {minContrast.toFixed(1)}:1
              </Badge>
            </Group>
            <Slider
              value={minContrast}
              onChange={onMinContrastChange}
              min={2}
              max={10}
              step={0.5}
              styles={sliderStyles}
              marks={[
                { value: CONTRAST_THRESHOLDS.AA_LARGE, label: '3:1' },
                { value: CONTRAST_THRESHOLDS.AA_NORMAL, label: 'AA' },
                { value: CONTRAST_THRESHOLDS.AAA_NORMAL, label: 'AAA' },
              ]}
            />
          </Box>

          {/* Saturation Slider */}
          <Box>
            <Group justify="space-between" mb={8}>
              <Group gap="xs">
                <IconDroplet size={14} style={{ color: '#8b5cf6' }} />
                <Text size="xs" fw={500} style={{ color: 'var(--text-secondary)' }}>
                  Saturation
                </Text>
              </Group>
              <Badge
                size="xs"
                radius="sm"
                style={{
                  background: 'rgba(139, 92, 246, 0.1)',
                  color: '#8b5cf6',
                  border: '1px solid rgba(139, 92, 246, 0.2)',
                }}
              >
                {Math.round(saturationLevel * 100)}%
              </Badge>
            </Group>
            <Slider
              value={saturationLevel}
              onChange={onSaturationLevelChange}
              min={0.25}
              max={2}
              step={0.05}
              styles={sliderStyles}
              marks={[
                { value: 0.5, label: '50%' },
                { value: 1, label: '100%' },
                { value: 1.5, label: '150%' },
              ]}
            />
          </Box>

          {/* Vibrant Syntax Toggle */}
          <Group justify="space-between" align="center" pt={4}>
            <Tooltip
              label="Boost gray ANSI colors with saturated hues for better syntax visibility"
              multiline
              w={220}
              position="bottom-start"
            >
              <Group gap="xs" style={{ cursor: 'help' }}>
                <IconSparkles size={14} style={{ color: vibrantSyntax ? '#f59e0b' : 'var(--text-tertiary)' }} />
                <Text size="xs" fw={500} style={{ color: 'var(--text-secondary)' }}>
                  Vibrant syntax
                </Text>
              </Group>
            </Tooltip>
            <Switch
              checked={vibrantSyntax}
              onChange={(e) => onVibrantSyntaxChange(e.currentTarget.checked)}
              size="sm"
              styles={{
                track: {
                  backgroundColor: vibrantSyntax ? '#8b5cf6' : 'rgba(139, 92, 246, 0.15)',
                  borderColor: vibrantSyntax ? '#8b5cf6' : 'rgba(139, 92, 246, 0.25)',
                },
                thumb: {
                  backgroundColor: '#fff',
                  borderColor: vibrantSyntax ? '#8b5cf6' : 'rgba(139, 92, 246, 0.3)',
                },
              }}
            />
          </Group>
        </Stack>
      </Stack>
    </Paper>
  );
}
