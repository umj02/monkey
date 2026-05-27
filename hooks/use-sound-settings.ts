import { useCallback } from "react";
import { useSettings } from "@/hooks/use-settings";
import { DEFAULT_SOUND_CONTROLS, normalizeSoundControls } from "@/lib/sound/sound-settings";
import type { SoundControls } from "@/types";

export function useSoundSettings() {
  const { settings, setSettings, ready } = useSettings();
  const soundControls = normalizeSoundControls(settings.soundControls, settings.sounds);

  const updateSoundControls = useCallback((patch: Partial<SoundControls>) => {
    setSettings((current) => {
      const currentControls = normalizeSoundControls(current.soundControls, current.sounds);
      const nextControls = { ...DEFAULT_SOUND_CONTROLS, ...currentControls, ...patch };
      return { ...current, sounds: nextControls.master, soundControls: nextControls };
    });
  }, [setSettings]);

  return { ready, soundControls, updateSoundControls };
}
