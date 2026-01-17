/**
 * Main application component.
 * Phosphor Terminal aesthetic.
 */

import { useState, useCallback, useEffect } from 'react';
import { Container, Grid, Stack, Title, Text, Button, Group, TextInput, Modal, Tabs, Paper, Box, Menu, UnstyledButton } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import {
  IconDownload,
  IconDeviceFloppy,
  IconPalette,
  IconHistory,
  IconTerminal2,
  IconMoon,
  IconSun,
  IconChevronDown,
} from '@tabler/icons-react';
import type { FileWithPath } from '@mantine/dropzone';

import { AppShell } from './components/layout/AppShell';
import { ImageDropzone } from './components/image/ImageDropzone';
import { ImagePreview } from './components/image/ImagePreview';
import { ColorPaletteGrid } from './components/palette/ColorPaletteGrid';
import { ColorMapper } from './components/mapping/ColorMapper';
import { TerminalPreview } from './components/preview/TerminalPreview';
import { ProfileList } from './components/profiles/ProfileList';

import { useColorExtraction } from './hooks/useColorExtraction';
import { useColorMapping } from './hooks/useColorMapping';
import { useProfiles } from './hooks/useProfiles';
import { useExport } from './hooks/useExport';

import type { Profile } from './types/profile';
import type { ExtractedColor } from './types/color';

/**
 * Main application component.
 */
export function App() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [profileName, setProfileName] = useState('');
  const [saveModalOpened, { open: openSaveModal, close: closeSaveModal }] = useDisclosure(false);

  // Hooks
  const { colors, thumbnail, isLoading: isExtracting, extractColors, clearColors } = useColorExtraction();
  const {
    scheme,
    isDarkMode,
    minContrast,
    readabilityReport,
    generateScheme,
    toggleMode,
    setANSIColor,
    setUIColor,
    resetScheme,
    setScheme,
    setMinContrast,
    autoFixContrast,
  } = useColorMapping();
  const { profiles, isLoading: isLoadingProfiles, create, remove } = useProfiles();
  const { downloadScheme } = useExport();

  // Generate scheme when colors are extracted
  useEffect(() => {
    if (colors.length > 0) {
      generateScheme(colors);
    }
  }, [colors, generateScheme]);

  // Handle image drop
  const handleImageDrop = useCallback((files: FileWithPath[]) => {
    const file = files[0];
    if (file) {
      // Create preview URL
      const url = URL.createObjectURL(file);
      setImageUrl(url);

      // Extract colors
      extractColors(file);
    }
  }, [extractColors]);

  // Handle clear
  const handleClear = useCallback(() => {
    if (imageUrl) {
      URL.revokeObjectURL(imageUrl);
    }
    setImageUrl(null);
    clearColors();
    resetScheme();
  }, [imageUrl, clearColors, resetScheme]);

  // Handle regenerate
  const handleRegenerate = useCallback(() => {
    if (colors.length > 0) {
      generateScheme(colors);
      notifications.show({
        title: 'Regenerated',
        message: 'Color scheme has been regenerated from the palette',
        color: 'blue',
      });
    }
  }, [colors, generateScheme]);

  // Handle save profile
  const handleSaveProfile = useCallback(async () => {
    if (!profileName.trim()) {
      notifications.show({
        title: 'Error',
        message: 'Please enter a profile name',
        color: 'red',
      });
      return;
    }

    const profile = await create({
      name: profileName.trim(),
      scheme,
      thumbnail: thumbnail ?? undefined,
    });

    if (profile) {
      notifications.show({
        title: 'Saved',
        message: `Profile "${profile.name}" has been saved`,
        color: 'green',
      });
      setProfileName('');
      closeSaveModal();
    }
  }, [profileName, scheme, thumbnail, create, closeSaveModal]);

  // Handle load profile
  const handleLoadProfile = useCallback((profile: Profile) => {
    setScheme(profile.scheme);
    notifications.show({
      title: 'Loaded',
      message: `Loaded profile "${profile.name}"`,
      color: 'blue',
    });
  }, [setScheme]);

  // Handle delete profile
  const handleDeleteProfile = useCallback(async (profile: Profile) => {
    await remove(profile.id);
    notifications.show({
      title: 'Deleted',
      message: `Profile "${profile.name}" has been deleted`,
      color: 'red',
    });
  }, [remove]);

  // Handle export profile
  const handleExportProfile = useCallback((profile: Profile) => {
    downloadScheme(profile.scheme, profile.name);
    notifications.show({
      title: 'Downloaded',
      message: `Exported "${profile.name}.itermcolors"`,
      color: 'green',
    });
  }, [downloadScheme]);

  // Handle export current
  const handleExportCurrent = useCallback(() => {
    const name = profileName.trim() || 'termicolor-scheme';
    downloadScheme(scheme, name);
    notifications.show({
      title: 'Downloaded',
      message: `Exported "${name}.itermcolors"`,
      color: 'green',
    });
  }, [scheme, profileName, downloadScheme]);

  // Handle color select from palette
  const [selectedColor, setSelectedColor] = useState<ExtractedColor | null>(null);

  return (
    <AppShell>
      {/* Background effects */}
      <div className="grid-bg" />
      <div className="noise-overlay" />

      {/* Hero Header */}
      <Box
        style={{
          position: 'relative',
          borderBottom: '1px solid rgba(57, 255, 20, 0.1)',
          marginBottom: 40,
          paddingTop: 48,
          paddingBottom: 48,
        }}
      >
        {/* Hero glow effect */}
        <Box
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '60%',
            height: '200%',
            background: 'radial-gradient(ellipse at center, rgba(57, 255, 20, 0.08) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />
        <Container size="xl" style={{ position: 'relative', zIndex: 2 }}>
          <Stack align="center" gap="md">
            <Group gap="md" align="center">
              <Box
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 12,
                  background: 'linear-gradient(135deg, #39ff14 0%, #2eb810 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 30px rgba(57, 255, 20, 0.4), 0 0 60px rgba(57, 255, 20, 0.2)',
                }}
              >
                <IconTerminal2 size={28} stroke={2} color="#000" />
              </Box>
              <Title
                order={1}
                className="hero-title"
                style={{ fontSize: '2.5rem' }}
              >
                Termicolor
              </Title>
            </Group>
            <Text
              size="lg"
              ta="center"
              maw={500}
              style={{
                color: 'var(--text-secondary)',
                fontFamily: '"Space Grotesk", sans-serif',
              }}
            >
              Create a{' '}
              <Menu
                position="bottom"
                withArrow
                shadow="lg"
                styles={{
                  dropdown: {
                    background: 'rgba(18, 19, 24, 0.95)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(57, 255, 20, 0.3)',
                  },
                  item: {
                    '&[data-hovered]': {
                      background: 'rgba(57, 255, 20, 0.15)',
                    },
                  },
                }}
              >
                <Menu.Target>
                  <UnstyledButton
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      padding: '4px 12px',
                      borderRadius: 6,
                      background: 'rgba(57, 255, 20, 0.1)',
                      border: '1px solid rgba(57, 255, 20, 0.4)',
                      color: '#39ff14',
                      fontWeight: 700,
                      fontFamily: '"Space Mono", monospace',
                      fontSize: '1.125rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      boxShadow: '0 0 15px rgba(57, 255, 20, 0.2)',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {isDarkMode ? (
                      <>
                        <IconMoon size={16} />
                        Dark
                      </>
                    ) : (
                      <>
                        <IconSun size={16} />
                        Light
                      </>
                    )}
                    <IconChevronDown size={14} />
                  </UnstyledButton>
                </Menu.Target>
                <Menu.Dropdown>
                  <Menu.Item
                    leftSection={<IconMoon size={16} style={{ color: '#39ff14' }} />}
                    onClick={() => !isDarkMode && toggleMode()}
                    style={{
                      color: isDarkMode ? '#39ff14' : 'var(--text-secondary)',
                      fontWeight: isDarkMode ? 600 : 400,
                    }}
                  >
                    Dark Mode
                  </Menu.Item>
                  <Menu.Item
                    leftSection={<IconSun size={16} style={{ color: '#ffaa00' }} />}
                    onClick={() => isDarkMode && toggleMode()}
                    style={{
                      color: !isDarkMode ? '#ffaa00' : 'var(--text-secondary)',
                      fontWeight: !isDarkMode ? 600 : 400,
                    }}
                  >
                    Light Mode
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
              {' '}terminal theme from any image.
            </Text>
          </Stack>
        </Container>
      </Box>

      <Container size="xl" style={{ position: 'relative', zIndex: 2 }}>
        <Tabs defaultValue="create" variant="pills">
          <Tabs.List
            mb="xl"
            style={{
              background: 'rgba(18, 19, 24, 0.8)',
              padding: 6,
              borderRadius: 12,
              border: '1px solid rgba(57, 255, 20, 0.1)',
              backdropFilter: 'blur(10px)',
              width: 'fit-content',
            }}
          >
            <Tabs.Tab
              value="create"
              leftSection={<IconPalette size={16} />}
              style={{
                fontWeight: 600,
                fontFamily: '"Space Grotesk", sans-serif',
                transition: 'all 0.2s ease',
              }}
            >
              Create New
            </Tabs.Tab>
            <Tabs.Tab
              value="profiles"
              leftSection={<IconHistory size={16} />}
              style={{
                fontWeight: 600,
                fontFamily: '"Space Grotesk", sans-serif',
                transition: 'all 0.2s ease',
              }}
            >
              Saved Profiles
              {profiles.length > 0 && (
                <Text span ml={6} size="sm" style={{ opacity: 0.6 }}>
                  ({profiles.length})
                </Text>
              )}
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="create">
            <Grid gutter="xl">
              {/* Left column: Image and Palette */}
              <Grid.Col span={{ base: 12, md: 4 }}>
                <Stack gap="lg">
                  {/* Image upload/preview */}
                  {imageUrl ? (
                    <ImagePreview src={imageUrl} onClear={handleClear} />
                  ) : (
                    <ImageDropzone onDrop={handleImageDrop} loading={isExtracting} />
                  )}

                  {/* Extracted palette */}
                  {colors.length > 0 && (
                    <ColorPaletteGrid
                      colors={colors}
                      selectedColor={selectedColor ?? undefined}
                      onColorSelect={setSelectedColor}
                    />
                  )}

                  {/* Actions */}
                  {colors.length > 0 && (
                    <Paper
                      p="lg"
                      radius="lg"
                      className="glass-card"
                      style={{
                        border: '1px solid rgba(57, 255, 20, 0.15)',
                      }}
                    >
                      <Stack gap="md">
                        <Group justify="space-between" align="center">
                          <Text fw={600} size="sm" style={{ color: 'var(--text-secondary)' }}>
                            Export & Save
                          </Text>
                        </Group>
                        <Group grow>
                          <Button
                            leftSection={<IconDeviceFloppy size={18} />}
                            onClick={openSaveModal}
                            className="phosphor-btn"
                            style={{
                              background: 'linear-gradient(135deg, #2eb810 0%, #39ff14 100%)',
                              color: '#000',
                              fontWeight: 600,
                            }}
                          >
                            Save Profile
                          </Button>
                          <Button
                            variant="outline"
                            leftSection={<IconDownload size={18} />}
                            onClick={handleExportCurrent}
                            style={{
                              borderColor: 'rgba(57, 255, 20, 0.3)',
                              color: '#39ff14',
                            }}
                          >
                            Export .itermcolors
                          </Button>
                        </Group>
                      </Stack>
                    </Paper>
                  )}
                </Stack>
              </Grid.Col>

              {/* Right column: Color Mapping and Preview */}
              <Grid.Col span={{ base: 12, md: 8 }}>
                <Stack gap="lg">
                  {/* Terminal Preview */}
                  <TerminalPreview scheme={scheme} />

                  {/* Color Mapper */}
                  <ColorMapper
                    scheme={scheme}
                    extractedColors={colors}
                    minContrast={minContrast}
                    readabilityReport={readabilityReport}
                    onANSIColorChange={setANSIColor}
                    onUIColorChange={setUIColor}
                    onRegenerate={handleRegenerate}
                    onMinContrastChange={setMinContrast}
                    onAutoFix={autoFixContrast}
                  />
                </Stack>
              </Grid.Col>
            </Grid>
          </Tabs.Panel>

          <Tabs.Panel value="profiles">
            <ProfileList
              profiles={profiles}
              isLoading={isLoadingProfiles}
              onLoad={handleLoadProfile}
              onDelete={handleDeleteProfile}
              onExport={handleExportProfile}
            />
          </Tabs.Panel>
        </Tabs>
      </Container>

      {/* Save Profile Modal */}
      <Modal
        opened={saveModalOpened}
        onClose={closeSaveModal}
        title={
          <Group gap="xs">
            <IconDeviceFloppy size={20} style={{ color: '#39ff14' }} />
            <Text fw={600}>Save Profile</Text>
          </Group>
        }
        radius="lg"
        styles={{
          content: {
            background: 'rgba(18, 19, 24, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(57, 255, 20, 0.15)',
          },
          header: {
            background: 'transparent',
          },
        }}
      >
        <Stack gap="lg">
          <TextInput
            label="Profile Name"
            placeholder="My awesome color scheme"
            value={profileName}
            onChange={(e) => setProfileName(e.currentTarget.value)}
            data-autofocus
            size="md"
            styles={{
              input: {
                background: 'rgba(10, 10, 12, 0.8)',
                borderColor: 'rgba(57, 255, 20, 0.2)',
                '&:focus': {
                  borderColor: 'rgba(57, 255, 20, 0.5)',
                },
              },
            }}
          />
          <Group justify="flex-end" gap="sm">
            <Button
              variant="subtle"
              onClick={closeSaveModal}
              style={{ color: 'var(--text-secondary)' }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveProfile}
              className="phosphor-btn"
              style={{
                background: 'linear-gradient(135deg, #2eb810 0%, #39ff14 100%)',
                color: '#000',
                fontWeight: 600,
              }}
            >
              Save Profile
            </Button>
          </Group>
        </Stack>
      </Modal>
    </AppShell>
  );
}
