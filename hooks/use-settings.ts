import { useLocalStorageState } from "@/lib/local-storage";
import { initialSettings } from "@/lib/services/profile-service";
import { LEGACY_STORAGE_KEYS, STORAGE_KEYS } from "@/lib/storage-keys";
import type { Settings } from "@/types";
import { normalizeSoundControls } from "@/lib/sound/sound-settings";

export function useSettings() {
  const [settings, setSettings, ready] = useLocalStorageState<Settings>(STORAGE_KEYS.settings, initialSettings, [...LEGACY_STORAGE_KEYS.settings]);
  const normalizedSettings: Settings = { ...settings, sounds: normalizeSoundControls(settings.soundControls, settings.sounds).master, soundControls: normalizeSoundControls(settings.soundControls, settings.sounds) };
  return { settings: normalizedSettings, setSettings, ready };
}
