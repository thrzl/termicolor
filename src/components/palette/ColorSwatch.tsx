/**
 * Single color swatch component.
 */

import { UnstyledButton, Tooltip, Box } from '@mantine/core';
import type { RGBColor } from '@/types/color';
import { rgbToHex } from '@/lib/color/conversion';

interface ColorSwatchProps {
  color: RGBColor;
  label?: string;
  size?: number;
  selected?: boolean;
  onClick?: () => void;
}

const swatchStyle = (hex: string, size: number, selected: boolean, clickable: boolean) => ({
  width: size,
  height: size,
  backgroundColor: hex,
  borderRadius: 'var(--mantine-radius-sm)',
  border: selected
    ? '2px solid var(--mantine-color-blue-5)'
    : '1px solid var(--mantine-color-default-border)',
  cursor: clickable ? 'pointer' : 'default',
  transition: 'transform 0.1s ease',
});

/**
 * Displays a single color swatch that can be clicked to select.
 */
export function ColorSwatch({
  color,
  label,
  size = 40,
  selected = false,
  onClick,
}: ColorSwatchProps) {
  const hex = rgbToHex(color);

  const handleMouseOver = (e: React.MouseEvent) => {
    if (onClick) {
      (e.currentTarget as HTMLElement).style.transform = 'scale(1.1)';
    }
  };

  const handleMouseOut = (e: React.MouseEvent) => {
    if (onClick) {
      (e.currentTarget as HTMLElement).style.transform = 'scale(1)';
    }
  };

  const tooltipLabel = label ? `${label}: ${hex}` : hex;

  if (onClick) {
    return (
      <Tooltip label={tooltipLabel} withArrow>
        <UnstyledButton
          onClick={onClick}
          style={swatchStyle(hex, size, selected, true)}
          onMouseOver={handleMouseOver}
          onMouseOut={handleMouseOut}
        />
      </Tooltip>
    );
  }

  return (
    <Tooltip label={tooltipLabel} withArrow>
      <Box style={swatchStyle(hex, size, selected, false)} />
    </Tooltip>
  );
}
