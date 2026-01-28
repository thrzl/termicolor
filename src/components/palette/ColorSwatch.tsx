/**
 * Single color swatch component with drag support.
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
  draggable?: boolean;
}

const swatchStyle = (hex: string, size: number, selected: boolean, clickable: boolean, draggable: boolean) => ({
  width: size,
  height: size,
  backgroundColor: hex,
  borderRadius: 'var(--mantine-radius-sm)',
  border: selected
    ? '2px solid #8b5cf6'
    : '1px solid var(--mantine-color-default-border)',
  cursor: draggable ? 'grab' : clickable ? 'pointer' : 'default',
  transition: 'all 0.2s ease',
  boxShadow: selected ? '0 0 0 3px rgba(139, 92, 246, 0.2)' : 'none',
});

/** MIME type for color drag data. */
export const COLOR_DRAG_TYPE = 'application/x-termicolor';

/**
 * Displays a single color swatch that can be clicked to select or dragged to apply.
 */
export function ColorSwatch({
  color,
  label,
  size = 40,
  selected = false,
  onClick,
  draggable = false,
}: ColorSwatchProps) {
  const hex = rgbToHex(color);

  const handleMouseOver = (e: React.MouseEvent) => {
    if (onClick || draggable) {
      const element = e.currentTarget as HTMLElement;
      element.style.transform = 'scale(1.1)';
      element.style.boxShadow = '0 0 20px rgba(139, 92, 246, 0.4), 0 0 0 3px rgba(139, 92, 246, 0.2)';
    }
  };

  const handleMouseOut = (e: React.MouseEvent) => {
    if (onClick || draggable) {
      const element = e.currentTarget as HTMLElement;
      element.style.transform = 'scale(1)';
      element.style.boxShadow = selected ? '0 0 0 3px rgba(139, 92, 246, 0.2)' : 'none';
    }
  };

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData(COLOR_DRAG_TYPE, JSON.stringify(color));
    e.dataTransfer.effectAllowed = 'copy';
  };

  const tooltipLabel = label ? `${label}: ${hex}` : draggable ? `${hex} (drag to apply)` : hex;

  if (onClick) {
    return (
      <Tooltip label={tooltipLabel} withArrow>
        <UnstyledButton
          onClick={onClick}
          draggable={draggable}
          onDragStart={draggable ? handleDragStart : undefined}
          style={swatchStyle(hex, size, selected, true, draggable)}
          onMouseOver={handleMouseOver}
          onMouseOut={handleMouseOut}
        />
      </Tooltip>
    );
  }

  return (
    <Tooltip label={tooltipLabel} withArrow>
      <Box
        draggable={draggable}
        onDragStart={draggable ? handleDragStart : undefined}
        style={swatchStyle(hex, size, selected, false, draggable)}
        onMouseOver={handleMouseOver}
        onMouseOut={handleMouseOut}
      />
    </Tooltip>
  );
}
