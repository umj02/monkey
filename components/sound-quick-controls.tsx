"use client";

import Link from "next/link";
import { Settings, Volume2, VolumeX } from "lucide-react";
import { useSoundSettings } from "@/hooks/use-sound-settings";

export function SoundQuickControls() {
  const { soundControls, updateSoundControls } = useSoundSettings();
  const muted = !soundControls.master || soundControls.quickMute;

  return (
    <div className="fixed right-4 top-[calc(14px+var(--safe-top))] z-[58] flex items-center gap-2 rounded-full border border-white/60 bg-white/80 p-1 shadow-soft backdrop-blur-xl">
      <button
        type="button"
        onClick={() => updateSoundControls(soundControls.master ? { quickMute: !soundControls.quickMute } : { master: true, quickMute: false })}
        className="grid h-9 w-9 place-items-center rounded-full text-monkey-ink transition active:scale-95"
        aria-label={muted ? "Activar sonido" : "Silenciar sonido"}
        title={muted ? "Activar sonido" : "Silenciar sonido"}
      >
        {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
      </button>
      <Link
        href="/settings#sounds"
        className="grid h-9 w-9 place-items-center rounded-full bg-gray-100 text-monkey-muted transition active:scale-95"
        aria-label="Ir a controles de sonido"
        title="Controles de sonido"
      >
        <Settings className="h-4 w-4" />
      </Link>
    </div>
  );
}
