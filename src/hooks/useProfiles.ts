/**
 * Hook for managing saved color scheme profiles.
 */

import { useState, useCallback, useEffect } from 'react';
import type { Profile, CreateProfileData, UpdateProfileData } from '@/types/profile';
import {
  getAllProfiles,
  createProfile,
  updateProfile,
  deleteProfile,
  getProfile,
} from '@/lib/storage/profiles';

interface UseProfilesResult {
  /** All saved profiles. */
  profiles: Profile[];
  /** Whether profiles are being loaded. */
  isLoading: boolean;
  /** Error message if operation failed. */
  error: string | null;
  /** Create a new profile. */
  create: (data: CreateProfileData) => Promise<Profile | null>;
  /** Update an existing profile. */
  update: (id: string, data: UpdateProfileData) => Promise<Profile | null>;
  /** Delete a profile. */
  remove: (id: string) => Promise<void>;
  /** Load a profile by ID. */
  load: (id: string) => Promise<Profile | null>;
  /** Refresh the profiles list. */
  refresh: () => Promise<void>;
}

/**
 * Hook for CRUD operations on saved profiles.
 *
 * :returns: Profiles state and methods.
 */
export function useProfiles(): UseProfilesResult {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const allProfiles = await getAllProfiles();
      setProfiles(allProfiles);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load profiles');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load profiles on mount
  useEffect(() => {
    refresh();
  }, [refresh]);

  const create = useCallback(async (data: CreateProfileData): Promise<Profile | null> => {
    setError(null);
    try {
      const profile = await createProfile(data);
      setProfiles((prev) => [profile, ...prev]);
      return profile;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create profile');
      return null;
    }
  }, []);

  const update = useCallback(async (id: string, data: UpdateProfileData): Promise<Profile | null> => {
    setError(null);
    try {
      const updated = await updateProfile(id, data);
      if (updated) {
        setProfiles((prev) =>
          prev.map((p) => (p.id === id ? updated : p))
        );
      }
      return updated ?? null;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
      return null;
    }
  }, []);

  const remove = useCallback(async (id: string): Promise<void> => {
    setError(null);
    try {
      await deleteProfile(id);
      setProfiles((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete profile');
    }
  }, []);

  const load = useCallback(async (id: string): Promise<Profile | null> => {
    setError(null);
    try {
      const profile = await getProfile(id);
      return profile ?? null;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load profile');
      return null;
    }
  }, []);

  return {
    profiles,
    isLoading,
    error,
    create,
    update,
    remove,
    load,
    refresh,
  };
}
