/**
 * Profile storage using IndexedDB via idb-keyval.
 */

import { get, set, del, keys } from 'idb-keyval';
import type { Profile, CreateProfileData, UpdateProfileData } from '@/types/profile';

const PROFILE_PREFIX = 'profile:';

/**
 * Generates a unique ID for a new profile.
 *
 * :returns: Unique string identifier.
 */
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Gets the storage key for a profile ID.
 *
 * :param id: Profile ID.
 * :returns: Storage key string.
 */
function getKey(id: string): string {
  return `${PROFILE_PREFIX}${id}`;
}

/**
 * Creates a new profile.
 *
 * :param data: Profile data.
 * :returns: Promise resolving to the created profile.
 */
export async function createProfile(data: CreateProfileData): Promise<Profile> {
  const now = Date.now();
  const profile: Profile = {
    id: generateId(),
    name: data.name,
    scheme: data.scheme,
    thumbnail: data.thumbnail,
    createdAt: now,
    updatedAt: now,
  };

  await set(getKey(profile.id), profile);
  return profile;
}

/**
 * Gets a profile by ID.
 *
 * :param id: Profile ID.
 * :returns: Promise resolving to the profile or undefined if not found.
 */
export async function getProfile(id: string): Promise<Profile | undefined> {
  return get<Profile>(getKey(id));
}

/**
 * Gets all saved profiles.
 *
 * :returns: Promise resolving to array of all profiles.
 */
export async function getAllProfiles(): Promise<Profile[]> {
  const allKeys = await keys();
  const profileKeys = (allKeys as string[]).filter((k) => k.startsWith(PROFILE_PREFIX));

  const profiles: Profile[] = [];
  for (const key of profileKeys) {
    const profile = await get<Profile>(key);
    if (profile) {
      profiles.push(profile);
    }
  }

  // Sort by updated date, newest first
  return profiles.sort((a, b) => b.updatedAt - a.updatedAt);
}

/**
 * Updates an existing profile.
 *
 * :param id: Profile ID to update.
 * :param data: Updated profile data.
 * :returns: Promise resolving to the updated profile or undefined if not found.
 */
export async function updateProfile(
  id: string,
  data: UpdateProfileData
): Promise<Profile | undefined> {
  const existing = await getProfile(id);
  if (!existing) {
    return undefined;
  }

  const updated: Profile = {
    ...existing,
    ...data,
    updatedAt: Date.now(),
  };

  await set(getKey(id), updated);
  return updated;
}

/**
 * Deletes a profile by ID.
 *
 * :param id: Profile ID to delete.
 * :returns: Promise resolving when deletion is complete.
 */
export async function deleteProfile(id: string): Promise<void> {
  await del(getKey(id));
}

/**
 * Checks if a profile with the given name already exists.
 *
 * :param name: Profile name to check.
 * :param excludeId: Optional ID to exclude from check (for updates).
 * :returns: Promise resolving to true if name is taken.
 */
export async function isNameTaken(
  name: string,
  excludeId?: string
): Promise<boolean> {
  const profiles = await getAllProfiles();
  return profiles.some(
    (p) => p.name.toLowerCase() === name.toLowerCase() && p.id !== excludeId
  );
}
