import { useLocalStorageState } from "@/lib/local-storage";
import { LEGACY_STORAGE_KEYS, STORAGE_KEYS } from "@/lib/storage-keys";
import type { Settings } from "@/types";

const initialSettings: Settings = {
  darkMode: false,
  sounds: true,
  sync: true,
  theme: "colorful"
};

export function useSettings() {
  const [settings, setSettings, ready] = useLocalStorageState<Settings>(STORAGE_KEYS.settings, initialSettings, [...LEGACY_STORAGE_KEYS.settings]);
  return { settings, setSettings, ready };
}
