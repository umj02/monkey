"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { BadgeCheck, Sparkles, Trophy, X } from "lucide-react";
import { useCalendarCompletions } from "@/hooks/use-calendar-completions";
import { useCalendarEvents } from "@/hooks/use-calendar-events";
import { usePersistentAchievements } from "@/hooks/use-persistent-achievements";
import { useProfile } from "@/hooks/use-profile";
import { useTasks } from "@/hooks/use-tasks";
import { useWallet } from "@/hooks/use-wallet";
import { buildAchievements, type Achievement, type AchievementTier } from "@/lib/achievements";
import { toDateKey } from "@/lib/calendar/calendar-utils";
import { getRewardCelebrationArt, getRewardMedalIcon } from "@/lib/reward-media";
import { cn } from "@/lib/utils";
import { playMonkeySound } from "@/lib/sound/sound-events";

const hiddenRewardRoutes = new Set(["/achievements", "/welcome", "/login", "/register", "/auth/confirm"]);

const tierCopy: Record<AchievementTier, { label: string; shell: string; chip: string; accent: string }> = {
  bronze: { label: "Bronce", shell: "from-orange-50 via-white to-yellow-50 border-orange-200", chip: "bg-orange-100 text-orange-700", accent: "text-orange-700" },
  silver: { label: "Plata", shell: "from-slate-50 via-white to-sky-50 border-slate-200", chip: "bg-slate-100 text-slate-700", accent: "text-slate-700" },
  gold: { label: "Oro", shell: "from-yellow-50 via-white to-green-50 border-monkey-yellow/50", chip: "bg-monkey-yellow text-orange-800", accent: "text-orange-800" },
  special: { label: "Especial", shell: "from-purple-50 via-white to-green-50 border-monkey-purple/25", chip: "bg-purple-100 text-monkey-purple", accent: "text-monkey-purple" },
};

export function AchievementRewardEngine() {
  const pathname = usePathname();
  const shouldHide = pathname ? hiddenRewardRoutes.has(pathname) : false;

  if (shouldHide) return null;
  return <AchievementRewardWatcher />;
}

function AchievementRewardWatcher() {
  const todayKey = useMemo(() => toDateKey(new Date()), []);
  const { profile } = useProfile();
  const { blocks } = useTasks();
  const { events } = useCalendarEvents();
  const { completionMap } = useCalendarCompletions();
  const { wallet } = useWallet();

  const calculatedResult = useMemo(() => buildAchievements({
    blocks,
    events,
    completionMap,
    wallet,
    hasCompletedOnboarding: profile.hasCompletedOnboarding,
    todayKey,
  }), [blocks, completionMap, events, profile.hasCompletedOnboarding, todayKey, wallet]);

  const { result, recentUnlockIds, clearRecentUnlocks, syncStatus, isPersistent } = usePersistentAchievements(calculatedResult);
  const [visible, setVisible] = useState(false);

  const recentAchievements = useMemo(() => {
    if (!recentUnlockIds.length) return [];
    return result.achievements.filter((achievement) => recentUnlockIds.includes(achievement.id));
  }, [recentUnlockIds, result.achievements]);

  useEffect(() => {
    if (!recentAchievements.length) return;
    setVisible(true);
    playMonkeySound("achievement");
    const timer = window.setTimeout(() => {
      setVisible(false);
      clearRecentUnlocks();
    }, 7200);

    return () => window.clearTimeout(timer);
  }, [clearRecentUnlocks, recentAchievements.length]);

  if (!visible || !recentAchievements.length) return null;

  return (
    <RewardMoment
      achievements={recentAchievements}
      syncing={syncStatus === "saving" || syncStatus === "loading"}
      isPersistent={isPersistent}
      onClose={() => {
        setVisible(false);
        clearRecentUnlocks();
      }}
    />
  );
}

function RewardMoment({ achievements, syncing, isPersistent, onClose }: { achievements: Achievement[]; syncing: boolean; isPersistent: boolean; onClose: () => void }) {
  const primary = achievements[0];
  const extraCount = Math.max(0, achievements.length - 1);
  const tone = tierCopy[primary?.tier ?? "bronze"];
  const title = achievements.length === 1 ? primary?.title : `${achievements.length} medallas nuevas`;
  const medalSrc = getRewardMedalIcon(primary?.tier ?? "bronze");
  const artSrc = getRewardCelebrationArt(primary?.tier ?? "bronze");

  return (
    <div className="fixed inset-0 z-[60]">
      <button type="button" aria-label="Cerrar notificación de logro" className="absolute inset-0 bg-slate-950/10 backdrop-blur-[1px]" onClick={onClose} />
      <div className="pointer-events-none absolute inset-x-0 bottom-[calc(90px+var(--safe-bottom))] mx-auto max-w-[430px] px-3 sm:px-4">
        <section className={cn("pointer-events-auto relative overflow-hidden rounded-[30px] border bg-gradient-to-br shadow-[0_24px_70px_rgba(15,23,42,.24)] animate-in slide-in-from-bottom-5", tone.shell)} role="status" aria-live="polite">
          <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/45" />
          <div className="absolute left-6 top-5 h-2.5 w-2.5 rounded-full bg-monkey-green/80 shadow-[0_0_0_6px_rgba(76,175,80,.12)]" />
          <div className="absolute right-12 top-9 h-3 w-3 rounded-full bg-monkey-yellow/90 shadow-[0_0_0_8px_rgba(255,213,79,.16)]" />

          <div className="relative p-4 sm:p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex items-center gap-2">
                <span className="rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-black uppercase tracking-[.08em] text-monkey-greenDark shadow-sm">Logro desbloqueado</span>
                <span className={cn("rounded-full px-2.5 py-1 text-[10px] font-black shadow-sm", tone.chip)}>{tone.label}</span>
              </div>
              <button type="button" onClick={onClose} className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/90 text-monkey-muted shadow-sm transition active:scale-95" aria-label="Cerrar logro desbloqueado">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-3 flex items-end gap-3">
              <div className="relative hidden w-[112px] shrink-0 self-end sm:block">
                <img src={artSrc} alt="Mono celebrando un logro" className="h-auto w-full object-contain drop-shadow-[0_18px_30px_rgba(15,23,42,.18)]" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-3">
                  <div className="grid h-14 w-14 shrink-0 place-items-center rounded-[20px] bg-white shadow-card">
                    <img src={medalSrc} alt={`Medalla ${tone.label}`} className="h-10 w-10 object-contain" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-lg font-black leading-tight text-slate-950">{title}</h2>
                    <p className="mt-1 text-xs font-bold leading-relaxed text-monkey-muted">
                      {isPersistent ? "Guardado en tus medallas." : "Logro listo en este dispositivo."} {syncing ? "Actualizando…" : "¡Seguí así!"}
                    </p>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {achievements.slice(0, 3).map((achievement) => (
                    <span key={achievement.id} className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-[11px] font-black text-slate-700 shadow-sm">
                      <BadgeCheck className="h-3.5 w-3.5 text-monkey-green" />
                      {achievement.title}
                    </span>
                  ))}
                  {extraCount > 2 ? <span className="rounded-full bg-white px-3 py-1.5 text-[11px] font-black text-monkey-muted shadow-sm">+{extraCount - 2} más</span> : null}
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2">
                  <Link href="/achievements" onClick={onClose} className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-monkey-green px-4 text-xs font-black text-white shadow-card transition active:scale-95">
                    <Trophy className="h-4 w-4" />
                    Ver medallas
                  </Link>
                  <Link href="/analytics" onClick={onClose} className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-white px-4 text-xs font-black text-monkey-greenDark shadow-card transition active:scale-95">
                    <Sparkles className="h-4 w-4" />
                    Avance
                  </Link>
                </div>
              </div>
            </div>

            <div className="relative mt-4 h-1.5 overflow-hidden rounded-full bg-white/70">
              <div className="h-full w-full origin-left rounded-full bg-monkey-green reward-timer" />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
