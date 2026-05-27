"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useSoundSettings } from "@/hooks/use-sound-settings";
import { MONKEY_SOUND_EVENT, type MonkeySoundEvent } from "@/lib/sound/sound-events";

const SOUND_FILES: Record<MonkeySoundEvent | "introMusic" | "ambientMusic", string> = {
  achievement: "/assets/sounds/alertas-trofeos-medallas.mp3",
  error: "/assets/sounds/error-action.mp3",
  bananaReward: "/assets/sounds/modal-bananas-ganadas.mp3",
  confirmation: "/assets/sounds/modal-confirmacion.mp3",
  alert: "/assets/sounds/Alertas.mp3",
  todayTaskComplete: "/assets/sounds/tarea-hoy-complete.mp3",
  notification: "/assets/sounds/notificaciones.mp3",
  alarm: "/assets/sounds/alarma.mp3",
  introMusic: "/assets/sounds/intromusic_home_login_register.mp3",
  ambientMusic: "/assets/sounds/musica-ambientacion.mp3",
};

const INTRO_ROUTES = new Set(["/", "/login", "/register", "/welcome"]);
const APP_SILENT_ROUTES = new Set(["/auth/confirm"]);
const FADE_INTERVAL_MS = 80;
const FADE_STEP = 0.08;

function shouldUseIntroMusic(pathname: string | null) {
  if (!pathname) return false;
  return INTRO_ROUTES.has(pathname);
}

function shouldUseAmbientMusic(pathname: string | null) {
  if (!pathname) return false;
  if (shouldUseIntroMusic(pathname)) return false;
  if (APP_SILENT_ROUTES.has(pathname)) return false;
  return true;
}

function safePause(audio: HTMLAudioElement | null) {
  if (!audio) return;
  audio.pause();
}

export function SoundSystemProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { soundControls } = useSoundSettings();
  const unlockedRef = useRef(false);
  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const effectsRef = useRef<Partial<Record<MonkeySoundEvent, HTMLAudioElement>>>({});
  const introRef = useRef<HTMLAudioElement | null>(null);
  const ambientRef = useRef<HTMLAudioElement | null>(null);
  const fadeTimerRef = useRef<number | null>(null);

  const volume = useMemo(() => Math.min(1, Math.max(0, soundControls.volume)), [soundControls.volume]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const unlock = () => {
      unlockedRef.current = true;
      setAudioUnlocked(true);
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    };
    window.addEventListener("pointerdown", unlock, { once: true });
    window.addEventListener("keydown", unlock, { once: true });
    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    };
  }, []);

  function getEffect(event: MonkeySoundEvent) {
    if (typeof window === "undefined") return null;
    if (!effectsRef.current[event]) {
      const audio = new Audio(SOUND_FILES[event]);
      audio.preload = "auto";
      effectsRef.current[event] = audio;
    }
    return effectsRef.current[event] ?? null;
  }

  function canPlayEffect(event: MonkeySoundEvent) {
    if (!soundControls.master || soundControls.quickMute || !unlockedRef.current) return false;
    if (event === "achievement" || event === "bananaReward") return soundControls.rewards;
    if (event === "alert" || event === "alarm") return soundControls.alerts;
    if (event === "notification") return soundControls.systemNotifications;
    return soundControls.actionEffects;
  }

  useEffect(() => {
    const handler = (event: Event) => {
      const detail = (event as CustomEvent<MonkeySoundEvent>).detail;
      if (!detail || !canPlayEffect(detail)) return;
      const audio = getEffect(detail);
      if (!audio) return;
      audio.volume = volume;
      audio.currentTime = 0;
      audio.play().catch(() => {
        // El navegador puede bloquear audio hasta una interacción del usuario.
      });
    };
    window.addEventListener(MONKEY_SOUND_EVENT, handler);
    return () => window.removeEventListener(MONKEY_SOUND_EVENT, handler);
  }, [soundControls.master, soundControls.quickMute, soundControls.actionEffects, soundControls.alerts, soundControls.rewards, soundControls.systemNotifications, volume]);

  function getLoopAudio(kind: "introMusic" | "ambientMusic") {
    if (typeof window === "undefined") return null;
    const ref = kind === "introMusic" ? introRef : ambientRef;
    if (!ref.current) {
      const audio = new Audio(SOUND_FILES[kind]);
      audio.loop = true;
      audio.preload = "auto";
      audio.volume = 0;
      ref.current = audio;
    }
    return ref.current;
  }

  function fadeTo(audio: HTMLAudioElement | null, targetVolume: number, onDone?: () => void) {
    if (!audio || typeof window === "undefined") return;
    if (fadeTimerRef.current) window.clearInterval(fadeTimerRef.current);
    fadeTimerRef.current = window.setInterval(() => {
      const direction = audio.volume < targetVolume ? 1 : -1;
      const next = audio.volume + FADE_STEP * direction;
      audio.volume = direction > 0 ? Math.min(targetVolume, next) : Math.max(targetVolume, next);
      if (Math.abs(audio.volume - targetVolume) < 0.01) {
        audio.volume = targetVolume;
        if (fadeTimerRef.current) window.clearInterval(fadeTimerRef.current);
        fadeTimerRef.current = null;
        onDone?.();
      }
    }, FADE_INTERVAL_MS);
  }

  useEffect(() => {
    const intro = getLoopAudio("introMusic");
    const ambient = getLoopAudio("ambientMusic");
    const useIntro = soundControls.master && !soundControls.quickMute && soundControls.introMusic && shouldUseIntroMusic(pathname);
    const useAmbient = soundControls.master && !soundControls.quickMute && soundControls.ambientMusic && shouldUseAmbientMusic(pathname);

    if (!unlockedRef.current) {
      safePause(intro);
      safePause(ambient);
      return;
    }

    if (useIntro && intro) {
      safePause(ambient);
      intro.play().then(() => fadeTo(intro, volume)).catch(() => undefined);
    } else if (intro) {
      fadeTo(intro, 0, () => safePause(intro));
    }

    if (useAmbient && ambient) {
      safePause(intro);
      ambient.play().then(() => fadeTo(ambient, volume * 0.62)).catch(() => undefined);
    } else if (ambient) {
      fadeTo(ambient, 0, () => safePause(ambient));
    }

    return () => undefined;
  }, [pathname, soundControls.master, soundControls.quickMute, soundControls.introMusic, soundControls.ambientMusic, volume, audioUnlocked]);

  useEffect(() => {
    return () => {
      safePause(introRef.current);
      safePause(ambientRef.current);
    };
  }, []);

  return <>{children}</>;
}
