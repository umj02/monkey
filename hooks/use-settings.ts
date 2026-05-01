import { useLocalStorageState } from "@/lib/local-storage";
import { initialSettings } from "@/lib/services/profile-service";
import { LEGACY_STORAGE_KEYS, STORAGE_KEYS } from "@/lib/storage-keys";
import type { Settings } from "@/types";

export function useSettings() {
  const [settings, setSettings, ready] = useLocalStorageState<Settings>(STORAGE_KEYS.settings, initialSettings, [...LEGACY_STORAGE_KEYS.settings]);
  return { settings, setSettings, ready };
}
