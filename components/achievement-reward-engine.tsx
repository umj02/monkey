"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { BadgeCheck, PartyPopper, Sparkles, Trophy, X } from "lucide-react";
import { MonkeyAvatar } from "@/components/monkey-avatar";
import { useCalendarCompletions } from "@/hooks/use-calendar-completions";
import { useCalendarEvents } from "@/hooks/use-calendar-events";
import { usePersistentAchievements } from "@/hooks/use-persistent-achievements";
import { useProfile } from "@/hooks/use-profile";
import { useTasks } from "@/hooks/use-tasks";
import { useWallet } from "@/hooks/use-wallet";
import { buildAchievements, type Achievement, type AchievementTier } from "@/lib/achievements";
import { toDateKey } from "@/lib/calendar/calendar-utils";
import { cn } from "@/lib/utils";

const hiddenRewardRoutes = new Set(["/achievements", "/welcome", "/login", "/register", "/auth/confirm"]);

const tierCopy: Record<AchievementTier, { label: string; className: string; iconClass: string }> = {
  bronze: { label: "Bronce", className: "from-orange-50 via-white to-yellow-50 border-orange-200", iconClass: "bg-orange-100 text-orange-700" },
  silver: { label: "Plata", className: "from-slate-50 via-white to-green-50 border-slate-200", iconClass: "bg-slate-100 text-slate-700" },
  gold: { label: "Oro", className: "from-yellow-50 via-white to-green-50 border-monkey-yellow/50", iconClass: "bg-monkey-yellow text-orange-800" },
  special: { label: "Especial", className: "from-purple-50 via-white to-green-50 border-monkey-purple/25", iconClass: "bg-purple-100 text-monkey-purple" },
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

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-[calc(92px+var(--safe-bottom))] z-[60] mx-auto max-w-[430px] px-4" role="status" aria-live="polite">
      <section className={cn("pointer-events-auto overflow-hidden rounded-[32px] border bg-gradient-to-br p-4 shadow-[0_22px_70px_rgba(15,23,42,.22)] backdrop-blur animate-in slide-in-from-bottom-5", tone.className)}>
        <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-white/50" />
        <div className="absolute right-10 top-5 h-3 w-3 animate-ping rounded-full bg-monkey-yellow" />
        <div className="absolute left-8 top-3 h-2 w-2 animate-pulse rounded-full bg-monkey-green" />

        <div className="relative flex items-start gap-3">
          <div className={cn("grid h-16 w-16 shrink-0 place-items-center rounded-[24px] shadow-card", tone.iconClass)}>
            {primary?.tier === "special" ? <MonkeyAvatar size={42} variant="face" /> : <img src="/assets/onboarding/medallas-07.png" alt="Medalla desbloqueada" className="h-12 w-12 object-contain" />}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-white/80 px-2.5 py-1 text-[10px] font-black uppercase tracking-[.08em] text-monkey-greenDark shadow-sm">Logro desbloqueado</span>
              <span className="rounded-full bg-white/70 px-2 py-1 text-[10px] font-black text-monkey-muted">{tone.label}</span>
            </div>
            <h2 className="mt-2 text-lg font-black leading-tight text-slate-950">{title}</h2>
            <p className="mt-1 text-xs font-bold leading-relaxed text-monkey-muted">
              {isPersistent ? "Guardado en tu historial de medallas." : "Logro calculado en este dispositivo."} {syncing ? "Sincronizando..." : "¡Seguí así!"}
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              {achievements.slice(0, 3).map((achievement) => (
                <span key={achievement.id} className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-[11px] font-black text-slate-700 shadow-sm">
                  <BadgeCheck className="h-3.5 w-3.5 text-monkey-green" />
                  {achievement.title}
                </span>
              ))}
              {extraCount > 2 ? <span className="rounded-full bg-white px-3 py-1.5 text-[11px] font-black text-monkey-muted shadow-sm">+{extraCount - 2} más</span> : null}
            </div>

            <div className="mt-3 flex items-center gap-2">
              <Link href="/achievements" onClick={onClose} className="inline-flex h-10 items-center gap-2 rounded-full bg-monkey-green px-4 text-xs font-black text-white shadow-card transition active:scale-95">
                <Trophy className="h-4 w-4" />
                Ver medallas
              </Link>
              <Link href="/analytics" onClick={onClose} className="inline-flex h-10 items-center gap-2 rounded-full bg-white px-4 text-xs font-black text-monkey-greenDark shadow-card transition active:scale-95">
                <Sparkles className="h-4 w-4" />
                Avance
              </Link>
            </div>
          </div>

          <button type="button" onClick={onClose} className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/85 text-monkey-muted shadow-sm transition active:scale-95" aria-label="Cerrar logro desbloqueado">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="relative mt-4 h-1.5 overflow-hidden rounded-full bg-white/70">
          <div className="h-full w-full origin-left rounded-full bg-monkey-green reward-timer" />
        </div>
      </section>
    </div>
  );
}
