/**
 * Readability score indicator component.
 * Linear-style purple gradient aesthetic.
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
} from '@mantine/core';
import { IconEye, IconWand, IconLock, IconAdjustments } from '@tabler/icons-react';
import type { ReadabilityReport } from '@/lib/color/readability';
import { CONTRAST_THRESHOLDS } from '@/lib/color/readability';

interface ReadabilityScoreProps {
  report: ReadabilityReport;
  minContrast: number;
  onMinContrastChange: (value: number) => void;
  onAutoFix?: (keepBackground?: boolean) => void;
}

/**
 * Gets color for score value.
 */
function getScoreColor(score: number): string {
  if (score >= 80) return 'green';
  if (score >= 60) return 'blue';
  if (score >= 40) return 'yellow';
  return 'red';
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
 * Displays overall readability score with details and contrast threshold slider.
 */
export function ReadabilityScore({
  report,
  minContrast,
  onMinContrastChange,
  onAutoFix,
}: ReadabilityScoreProps) {
  const color = getScoreColor(report.score);
  const label = getScoreLabel(report.score);

  // Count colors meeting the current threshold
  const meetingThreshold = countMeetingThreshold(report, minContrast);
  const needsFix = meetingThreshold < report.total;
  // Show magic wand if colors need fixing OR if scheme was modified since last auto-fix
  const showAutoFix = needsFix || report.schemeModified;

  return (
    <Paper
      p="md"
      radius="md"
      style={{
        background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.03) 0%, rgba(124, 58, 237, 0.02) 100%)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(139, 92, 246, 0.1)',
      }}
    >
      <Stack gap="md">
        <Group justify="space-between" align="flex-start">
          <Group gap="md">
            <RingProgress
              size={64}
              thickness={6}
              roundCaps
              sections={[{ value: report.score, color }]}
              label={
                <Text ta="center" size="md" fw={700}>
                  {report.score}
                </Text>
              }
            />
            <Stack gap={4}>
              <Group gap="xs">
                <IconEye size={16} style={{ color: '#8b5cf6' }} />
                <Text fw={600}>Readability Score</Text>
                <Badge color={color} variant="light" size="sm" radius="sm">
                  {label}
                </Badge>
              </Group>
              <Text size="sm" style={{ color: 'var(--text-secondary)' }}>
                {meetingThreshold}/{report.total} colors meet {minContrast.toFixed(1)}:1 contrast
              </Text>
              <Tooltip
                label="WCAG AAA requires 7:1 contrast ratio for normal text. AA requires 4.5:1. Higher contrast = better readability."
                multiline
                w={260}
              >
                <Text size="xs" style={{ color: 'var(--text-muted)', cursor: 'help', textDecoration: 'underline dotted' }}>
                  ({report.passAAA}/{report.total} meet AAA 7:1)
                </Text>
              </Tooltip>
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
                <Tooltip label={needsFix ? `Auto-fix ${report.total - meetingThreshold} colors below ${minContrast.toFixed(1)}:1` : 'Re-apply contrast fix'}>
                  <UnstyledButton
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 8,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%)',
                      boxShadow: '0 0 15px rgba(139, 92, 246, 0.3)',
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
                  style={{
                    color: 'var(--text-primary)',
                    fontFamily: '"Space Grotesk", sans-serif',
                  }}
                >
                  <Stack gap={2}>
                    <Text size="sm" fw={500}>Smart fix</Text>
                    <Text size="xs" c="dimmed">May adjust background if needed</Text>
                  </Stack>
                </Menu.Item>
                <Menu.Item
                  leftSection={<IconLock size={14} style={{ color: '#f59e0b' }} />}
                  onClick={() => onAutoFix(true)}
                  style={{
                    color: 'var(--text-primary)',
                    fontFamily: '"Space Grotesk", sans-serif',
                  }}
                >
                  <Stack gap={2}>
                    <Text size="sm" fw={500}>Keep background</Text>
                    <Text size="xs" c="dimmed">Only adjust foreground colors</Text>
                  </Stack>
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          )}
        </Group>

        {/* Contrast threshold slider */}
        <Box>
          <Group justify="space-between" mb={4}>
            <Text size="xs" fw={500} style={{ color: 'var(--text-secondary)' }}>
              Minimum Contrast Ratio
            </Text>
            <Badge
              variant="light"
              size="sm"
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
            styles={{
              track: {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              },
              bar: {
                backgroundColor: '#8b5cf6',
              },
              thumb: {
                backgroundColor: '#8b5cf6',
                borderColor: '#8b5cf6',
                boxShadow: '0 0 10px rgba(139, 92, 246, 0.5)',
              },
              mark: {
                borderColor: 'rgba(139, 92, 246, 0.3)',
              },
              markLabel: {
                color: 'var(--text-muted)',
                fontSize: 10,
              },
            }}
            marks={[
              { value: CONTRAST_THRESHOLDS.AA_LARGE, label: '3:1' },
              { value: CONTRAST_THRESHOLDS.AA_NORMAL, label: 'AA' },
              { value: CONTRAST_THRESHOLDS.AAA_NORMAL, label: 'AAA' },
            ]}
          />
        </Box>
      </Stack>
    </Paper>
  );
}
