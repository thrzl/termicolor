/**
 * Badge showing contrast ratio and level for a color.
 */

import { Badge, Tooltip, Text } from '@mantine/core';
import { IconCheck, IconX, IconAlertTriangle } from '@tabler/icons-react';
import type { ContrastInfo, ContrastLevel } from '@/lib/color/readability';
import { getContrastLevelColor } from '@/lib/color/readability';

interface ContrastBadgeProps {
  info: ContrastInfo;
  compact?: boolean;
}

/**
 * Gets the icon for a contrast level.
 */
function ContrastIcon({ level }: { level: ContrastLevel }) {
  switch (level) {
    case 'excellent':
    case 'good':
      return <IconCheck size={12} />;
    case 'fair':
      return <IconAlertTriangle size={12} />;
    case 'poor':
      return <IconX size={12} />;
  }
}

/**
 * Badge displaying contrast ratio with visual indicator.
 */
export function ContrastBadge({ info, compact = false }: ContrastBadgeProps) {
  const color = getContrastLevelColor(info.level);
  const ratioText = info.ratio.toFixed(1);

  const tooltipContent = (
    <div>
      <Text size="xs" fw={500}>Contrast Ratio: {ratioText}:1</Text>
      <Text size="xs" c="dimmed">
        WCAG AA: {info.meetsAA ? 'Pass' : 'Fail'} (≥4.5:1)
      </Text>
      <Text size="xs" c="dimmed">
        WCAG AAA: {info.meetsAAA ? 'Pass' : 'Fail'} (≥7:1)
      </Text>
    </div>
  );

  if (compact) {
    return (
      <Tooltip label={tooltipContent} withArrow multiline w={200}>
        <Badge
          size="xs"
          color={color}
          variant="light"
          leftSection={<ContrastIcon level={info.level} />}
        >
          {ratioText}
        </Badge>
      </Tooltip>
    );
  }

  return (
    <Tooltip label={tooltipContent} withArrow multiline w={200}>
      <Badge
        size="sm"
        color={color}
        variant="light"
        leftSection={<ContrastIcon level={info.level} />}
      >
        {ratioText}:1
      </Badge>
    </Tooltip>
  );
}
