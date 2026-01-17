/**
 * Image preview component showing the uploaded image.
 * Linear-style purple gradient aesthetic.
 */

import { Image, Paper, CloseButton, Box, Group } from '@mantine/core';

interface ImagePreviewProps {
  src: string;
  onClear?: () => void;
}

/**
 * Displays a preview of the uploaded image with option to clear.
 */
export function ImagePreview({ src, onClear }: ImagePreviewProps) {
  return (
    <Paper
      radius="lg"
      p="xs"
      pos="relative"
      style={{
        background: 'rgba(26, 27, 35, 0.6)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.06)',
      }}
    >
      <Group justify="flex-end" mb="xs">
        {onClear && (
          <CloseButton
            onClick={onClear}
            title="Remove image"
            size="sm"
            style={{
              color: '#ff5f57',
            }}
          />
        )}
      </Group>
      <Box
        style={{
          maxHeight: 300,
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 8,
          background: 'rgba(10, 10, 12, 0.5)',
        }}
      >
        <Image
          src={src}
          alt="Uploaded image"
          fit="contain"
          mah={280}
          radius="sm"
        />
      </Box>
    </Paper>
  );
}
