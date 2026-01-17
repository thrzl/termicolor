/**
 * Image dropzone component for uploading images.
 * Linear-style purple gradient aesthetic.
 */

import { useRef } from 'react';
import { Text, Group, rem, Stack, Box } from '@mantine/core';
import { Dropzone, IMAGE_MIME_TYPE, type FileWithPath } from '@mantine/dropzone';
import { IconUpload, IconPhoto, IconX } from '@tabler/icons-react';

interface ImageDropzoneProps {
  onDrop: (files: FileWithPath[]) => void;
  loading?: boolean;
  disabled?: boolean;
}

/**
 * Dropzone for image file uploads with purple glow effects.
 */
export function ImageDropzone({ onDrop, loading = false, disabled = false }: ImageDropzoneProps) {
  const openRef = useRef<() => void>(null);

  return (
    <Dropzone
      openRef={openRef}
      onDrop={onDrop}
      accept={IMAGE_MIME_TYPE}
      maxSize={10 * 1024 ** 2}
      loading={loading}
      disabled={disabled}
      multiple={false}
      radius="lg"
      styles={{
        root: {
          minHeight: rem(200),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.03) 0%, rgba(124, 58, 237, 0.02) 100%)',
          border: '2px dashed rgba(139, 92, 246, 0.25)',
          transition: 'all 0.3s ease',
          '&:hover': {
            borderColor: 'rgba(139, 92, 246, 0.5)',
            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.06) 0%, rgba(124, 58, 237, 0.03) 100%)',
            boxShadow: '0 0 30px rgba(139, 92, 246, 0.1), inset 0 0 30px rgba(139, 92, 246, 0.03)',
          },
          '&[data-accept]': {
            borderColor: '#8b5cf6',
            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(124, 58, 237, 0.05) 100%)',
            boxShadow: '0 0 40px rgba(139, 92, 246, 0.2), inset 0 0 40px rgba(139, 92, 246, 0.05)',
          },
          '&[data-reject]': {
            borderColor: '#ff5f57',
            background: 'rgba(255, 95, 87, 0.08)',
            boxShadow: '0 0 30px rgba(255, 95, 87, 0.15)',
          },
        },
      }}
    >
      <Box style={{ pointerEvents: 'none', textAlign: 'center' }}>
        <Dropzone.Accept>
          <Box
            style={{
              width: 72,
              height: 72,
              borderRadius: 16,
              background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto',
              marginBottom: 16,
              boxShadow: '0 0 30px rgba(139, 92, 246, 0.5), 0 0 60px rgba(139, 92, 246, 0.3)',
            }}
          >
            <IconUpload size={36} stroke={1.5} color="#000" />
          </Box>
        </Dropzone.Accept>
        <Dropzone.Reject>
          <Box
            style={{
              width: 72,
              height: 72,
              borderRadius: 16,
              background: 'rgba(255, 95, 87, 0.2)',
              border: '2px solid #ff5f57',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto',
              marginBottom: 16,
              boxShadow: '0 0 30px rgba(255, 95, 87, 0.3)',
            }}
          >
            <IconX size={36} stroke={1.5} color="#ff5f57" />
          </Box>
        </Dropzone.Reject>
        <Dropzone.Idle>
          <Box
            style={{
              width: 72,
              height: 72,
              borderRadius: 16,
              background: 'rgba(139, 92, 246, 0.08)',
              border: '2px solid rgba(139, 92, 246, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto',
              marginBottom: 16,
              transition: 'all 0.3s ease',
            }}
          >
            <IconPhoto size={36} stroke={1.5} style={{ color: '#8b5cf6', opacity: 0.7 }} />
          </Box>
        </Dropzone.Idle>

        <Stack gap={6} align="center">
          <Text
            size="lg"
            fw={600}
            style={{
              fontFamily: '"Space Grotesk", sans-serif',
              color: 'var(--text-primary)',
            }}
          >
            Drop an image here
          </Text>
          <Text
            size="sm"
            style={{
              color: 'var(--text-secondary)',
              fontFamily: '"Space Grotesk", sans-serif',
            }}
          >
            or click to browse your files
          </Text>
          <Group gap={6} mt="xs">
            {['PNG', 'JPG', 'WebP', 'GIF'].map((format) => (
              <Text
                key={format}
                size="xs"
                style={{
                  padding: '4px 10px',
                  background: 'rgba(139, 92, 246, 0.08)',
                  border: '1px solid rgba(139, 92, 246, 0.15)',
                  borderRadius: 6,
                  fontFamily: '"JetBrains Mono", monospace',
                  color: '#8b5cf6',
                  fontSize: 10,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                {format}
              </Text>
            ))}
          </Group>
        </Stack>
      </Box>
    </Dropzone>
  );
}
