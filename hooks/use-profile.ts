"use client";

import { useEffect } from "react";
import { useLocalStorageState } from "@/lib/local-storage";
import { initialProfile, fetchSupabaseProfile, upsertSupabaseProfile } from "@/lib/services/profile-service";
import { LEGACY_STORAGE_KEYS, STORAGE_KEYS } from "@/lib/storage-keys";
import { useAuth } from "@/hooks/use-auth";
import type { Profile } from "@/types";

export function useProfile() {
  const { session, mode } = useAuth();
  const [profile, setLocalProfile, ready] = useLocalStorageState<Profile>(STORAGE_KEYS.profile, initialProfile, [...LEGACY_STORAGE_KEYS.profile]);

  useEffect(() => {
    if (!session || mode !== "supabase") return;
    fetchSupabaseProfile(session.userId, session.email).then((remote) => {
      if (remote) setLocalProfile(remote);
    });
  }, [session?.userId, mode]);

  function setProfile(next: Profile) {
    setLocalProfile(next);
    if (session && mode === "supabase") void upsertSupabaseProfile(session.userId, next);
  }

  const normalizedProfile: Profile = { ...profile, hasCompletedOnboarding: profile.hasCompletedOnboarding ?? true };

  return { profile: normalizedProfile, setProfile, ready };
}
