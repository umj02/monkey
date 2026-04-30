import { useLocalStorageState } from "@/lib/local-storage";
import { initialProfile } from "@/lib/services/profile-service";
import { LEGACY_STORAGE_KEYS, STORAGE_KEYS } from "@/lib/storage-keys";
import type { Profile } from "@/types";

export function useProfile() {
  const [profile, setProfile, ready] = useLocalStorageState<Profile>(STORAGE_KEYS.profile, initialProfile, [...LEGACY_STORAGE_KEYS.profile]);
  return { profile, setProfile, ready };
}
