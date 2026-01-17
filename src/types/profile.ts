/**
 * Profile types for saved color schemes.
 */

import type { ColorScheme } from './color';

/** A saved color scheme profile. */
export interface Profile {
  /** Unique identifier. */
  id: string;
  /** User-defined name. */
  name: string;
  /** The color scheme. */
  scheme: ColorScheme;
  /** Base64 encoded thumbnail of the source image. */
  thumbnail?: string;
  /** Timestamp when created. */
  createdAt: number;
  /** Timestamp when last modified. */
  updatedAt: number;
}

/** Data needed to create a new profile. */
export interface CreateProfileData {
  name: string;
  scheme: ColorScheme;
  thumbnail?: string;
}

/** Data for updating an existing profile. */
export interface UpdateProfileData {
  name?: string;
  scheme?: ColorScheme;
  thumbnail?: string;
}
