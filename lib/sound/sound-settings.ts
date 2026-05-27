import type { SoundControls } from "@/types";

export const DEFAULT_SOUND_CONTROLS: SoundControls = {
  master: true,
  introMusic: true,
  ambientMusic: true,
  actionEffects: true,
  alerts: true,
  rewards: true,
  systemNotifications: true,
  quickMute: false,
  volume: 0.55,
};

export function normalizeSoundControls(value: Partial<SoundControls> | undefined, legacySounds = true): SoundControls {
  return {
    ...DEFAULT_SOUND_CONTROLS,
    ...(value ?? {}),
    master: typeof value?.master === "boolean" ? value.master : legacySounds,
    quickMute: typeof value?.quickMute === "boolean" ? value.quickMute : false,
    volume: Math.min(1, Math.max(0, Number(value?.volume ?? DEFAULT_SOUND_CONTROLS.volume))),
  };
}
