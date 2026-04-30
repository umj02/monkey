import { useLocalStorageState } from "@/lib/local-storage";
import { initialSettings } from "@/lib/services/profile-service";
import { STORAGE_KEYS } from "@/lib/storage-keys";
import type { Settings } from "@/types";

export function useSettings() {
  const [settings, setSettings, ready] = useLocalStorageState<Settings>(STORAGE_KEYS.settings, initialSettings);
  return { settings, setSettings, ready };
}
