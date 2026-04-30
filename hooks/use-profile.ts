import { useLocalStorageState } from "@/lib/local-storage";
import { initialProfile } from "@/lib/services/profile-service";
import { STORAGE_KEYS } from "@/lib/storage-keys";
import type { Profile } from "@/types";

export function useProfile() {
  const [profile, setProfile, ready] = useLocalStorageState<Profile>(STORAGE_KEYS.profile, initialProfile);
  return { profile, setProfile, ready };
}
