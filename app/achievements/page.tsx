"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  Award,
  BadgeCheck,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  Flame,
  Lock,
  Medal,
  PiggyBank,
  Repeat2,
  Sparkles,
  Target,
  Trophy,
  WalletCards,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { MonkeyAvatar } from "@/components/monkey-avatar";
import { useCalendarCompletions } from "@/hooks/use-calendar-completions";
import { useCalendarEvents } from "@/hooks/use-calendar-events";
import { useProfile } from "@/hooks/use-profile";
import { useTasks } from "@/hooks/use-tasks";
import { useWallet } from "@/hooks/use-wallet";
import { buildAchievements, type Achievement, type AchievementGroup, type AchievementTier } from "@/lib/achievements";
import { toDateKey } from "@/lib/calendar/calendar-utils";
import { cn } from "@/lib/utils";

type FilterMode = "all" | "unlocked" | "locked";

const groupLabels: Record<AchievementGroup, string> = {
  daily: "Hoy",
  calendar: "Calendario",
  wallet: "Wallet",
  growth: "Crecimiento",
};

const tierLabels: Record<AchievementTier, string> = {
  bronze: "Bronce",
  silver: "Plata",
  gold: "Oro",
  special: "Especial",
};

function achievementIcon(icon: string, className = "h-5 w-5") {
  const icons: Record<string, React.ReactNode> = {
    check: <CheckCircle2 className={className} />,
    sparkles: <Sparkles className={className} />,
    target: <Target className={className} />,
    flame: <Flame className={className} />,
    monkey: <MonkeyAvatar size={30} variant="face" />,
    calendar: <CalendarDays className={className} />,
    trophy: <Trophy className={className} />,
    repeat: <Repeat2 className={className} />,
    wallet: <WalletCards className={className} />,
    piggy: <PiggyBank className={className} />,
  };
  return icons[icon] ?? <Award className={className} />;
}

export default function AchievementsPage() {
  const [filter, setFilter] = useState<FilterMode>("all");
  const todayKey = useMemo(() => toDateKey(new Date()), []);
  const { profile } = useProfile();
  const { blocks, syncing: tasksSyncing } = useTasks();
  const { events, syncing: calendarSyncing } = useCalendarEvents();
  const { completionMap, syncStatus: completionSyncStatus } = useCalendarCompletions();
  const { wallet, syncing: walletSyncing } = useWallet();

  const result = useMemo(() => buildAchievements({
    blocks,
    events,
    completionMap,
    wallet,
    hasCompletedOnboarding: profile.hasCompletedOnboarding,
    todayKey,
  }), [blocks, completionMap, events, profile.hasCompletedOnboarding, todayKey, wallet]);

  const visibleAchievements = result.achievements.filter((achievement) => {
    if (filter === "unlocked") return achievement.unlocked;
    if (filter === "locked") return !achievement.unlocked;
    return true;
  });

  const syncing = tasksSyncing || calendarSyncing || completionSyncStatus === "loading" || walletSyncing;
  const groups = (["daily", "calendar", "wallet", "growth"] as AchievementGroup[]).map((group) => ({
    group,
    total: result.achievements.filter((achievement) => achievement.group === group).length,
    done: result.achievements.filter((achievement) => achievement.group === group && achievement.unlocked).length,
  }));

  return (
    <AppShell>
      <section className="page-pad pt-7">
        <header className="flex items-center justify-between gap-3">
          <Link href="/analytics" className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white shadow-card transition active:scale-95" aria-label="Volver a Analítica">
            <ArrowLeft className="h-5 w-5 text-monkey-muted" />
          </Link>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-black uppercase tracking-[.12em] text-monkey-purple">Logros</p>
            <h1 className="text-2xl font-black tracking-tight">Mis medallas</h1>
          </div>
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-white shadow-card">
            <Medal className="h-6 w-6 text-monkey-yellow" />
          </div>
        </header>

        <section className="mt-5 overflow-hidden rounded-[30px] bg-gradient-to-br from-monkey-purple via-monkey-greenDark to-monkey-green p-5 text-white shadow-soft">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-sm font-bold text-white/80">Progreso de medallas</p>
              <h2 className="mt-2 text-[42px] font-black leading-none">{result.unlockedCount}/{result.totalCount}</h2>
              <p className="mt-2 text-sm font-bold text-white/85">{result.completion}% del tablero desbloqueado</p>
            </div>
            <div className="rounded-[24px] bg-white/20 p-3 backdrop-blur">
              <Trophy className="h-8 w-8" />
            </div>
          </div>
          <div className="mt-5 h-3 overflow-hidden rounded-full bg-white/25" aria-label={`Progreso ${result.completion}%`}>
            <div className="h-full rounded-full bg-white transition-all" style={{ width: `${result.completion}%` }} />
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-black">
            <span className="rounded-full bg-white/20 px-3 py-1.5">{syncing ? "Actualizando…" : "Sincronizado"}</span>
            <span className="rounded-full bg-white/20 px-3 py-1.5">Racha {result.stats.streak} días</span>
            <span className="rounded-full bg-white/20 px-3 py-1.5">{result.stats.activeDays} días activos</span>
          </div>
        </section>

        {result.nextAchievement ? <NextAchievementCard achievement={result.nextAchievement} /> : <AllDoneCard />}

        <section className="mt-5 grid grid-cols-2 gap-3">
          {groups.map(({ group, done, total }) => (
            <article key={group} className="rounded-card bg-white p-4 shadow-card">
              <p className="text-[11px] font-black uppercase tracking-[.08em] text-monkey-muted">{groupLabels[group]}</p>
              <p className="mt-1 text-2xl font-black">{done}/{total}</p>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-100">
                <div className="h-full rounded-full bg-monkey-green" style={{ width: `${total ? Math.round((done / total) * 100) : 0}%` }} />
              </div>
            </article>
          ))}
        </section>

        <div className="mt-5 grid grid-cols-3 rounded-[22px] bg-gray-100 p-1 text-sm font-black" role="tablist" aria-label="Filtro de logros">
          <FilterButton active={filter === "all"} onClick={() => setFilter("all")} label="Todos" />
          <FilterButton active={filter === "unlocked"} onClick={() => setFilter("unlocked")} label="Ganados" />
          <FilterButton active={filter === "locked"} onClick={() => setFilter("locked")} label="Próximos" />
        </div>

        <section className="mt-5 grid gap-3">
          {visibleAchievements.map((achievement) => <AchievementCard key={achievement.id} achievement={achievement} />)}
        </section>

        <section className="mt-6 rounded-[28px] border border-monkey-green/15 bg-white p-4 shadow-card">
          <div className="flex items-start gap-3">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-[20px] bg-green-50 text-monkey-greenDark">
              <BarChart3 className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-base font-black">Cómo se calculan</h2>
              <p className="mt-1 text-xs font-bold leading-relaxed text-monkey-muted">
                Esta primera base no crea tablas nuevas: las medallas se calculan con tus tareas, calendario, completions, onboarding y Wallet. Más adelante se pueden persistir en Supabase si queremos historial exacto de fecha de desbloqueo.
              </p>
            </div>
          </div>
        </section>
      </section>
    </AppShell>
  );
}

function FilterButton({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return <button type="button" onClick={onClick} className={cn("h-11 rounded-[18px] transition active:scale-[.99]", active ? "bg-white text-monkey-green shadow-card" : "text-monkey-muted")} aria-pressed={active}>{label}</button>;
}

function NextAchievementCard({ achievement }: { achievement: Achievement }) {
  return (
    <section className="mt-5 rounded-[28px] border border-monkey-yellow/30 bg-yellow-50 p-4">
      <div className="flex items-start gap-3">
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-[20px] bg-white text-orange-700 shadow-card">
          {achievementIcon(achievement.icon)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-black uppercase tracking-[.08em] text-orange-700">Próximo logro</p>
          <h2 className="mt-1 text-base font-black">{achievement.title}</h2>
          <p className="mt-1 text-xs font-bold leading-relaxed text-monkey-muted">{achievement.helper}</p>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-white">
            <div className="h-full rounded-full bg-monkey-yellow" style={{ width: `${achievement.progress}%` }} />
          </div>
        </div>
      </div>
    </section>
  );
}

function AllDoneCard() {
  return (
    <section className="mt-5 rounded-[28px] bg-green-50 p-4 text-monkey-greenDark">
      <div className="flex items-center gap-3">
        <BadgeCheck className="h-7 w-7" />
        <div>
          <h2 className="text-base font-black">¡Tablero completo!</h2>
          <p className="text-xs font-bold opacity-80">Ya desbloqueaste todas las medallas base.</p>
        </div>
      </div>
    </section>
  );
}

function AchievementCard({ achievement }: { achievement: Achievement }) {
  return (
    <article className={cn("rounded-[26px] border p-4 shadow-card", achievement.unlocked ? "border-monkey-green/15 bg-white" : "border-gray-100 bg-gray-50")}> 
      <div className="flex items-center gap-3">
        <div className={cn("grid h-14 w-14 shrink-0 place-items-center rounded-[22px]", achievement.unlocked ? "bg-green-50 text-monkey-greenDark" : "bg-white text-monkey-muted")}> 
          {achievement.unlocked ? achievementIcon(achievement.icon, "h-6 w-6") : <Lock className="h-5 w-5" />}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-sm font-black">{achievement.title}</h3>
            {achievement.unlocked ? <BadgeCheck className="h-4 w-4 shrink-0 text-monkey-green" /> : null}
          </div>
          <p className="mt-1 text-xs font-bold leading-relaxed text-monkey-muted">{achievement.description}</p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-black text-monkey-muted shadow-sm">{groupLabels[achievement.group]}</span>
            <span className={cn("rounded-full px-2.5 py-1 text-[10px] font-black", tierClass(achievement.tier))}>{tierLabels[achievement.tier]}</span>
            <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-black text-monkey-muted shadow-sm">{achievement.progress}%</span>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-white">
            <div className={cn("h-full rounded-full", achievement.unlocked ? "bg-monkey-green" : "bg-gray-300")} style={{ width: `${achievement.progress}%` }} />
          </div>
        </div>
      </div>
    </article>
  );
}

function tierClass(tier: AchievementTier) {
  if (tier === "gold") return "bg-yellow-50 text-orange-700";
  if (tier === "silver") return "bg-slate-100 text-slate-700";
  if (tier === "special") return "bg-purple-50 text-monkey-purple";
  return "bg-orange-50 text-orange-700";
}
