"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Award,
  BadgeCheck,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Flame,
  HelpCircle,
  Lock,
  PartyPopper,
  PiggyBank,
  Repeat2,
  Sparkles,
  Target,
  Trophy,
  WalletCards,
  X,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { MonkeyAvatar } from "@/components/monkey-avatar";
import { getRewardCelebrationArt, getRewardMedalIcon, getRewardTrophyIcon } from "@/lib/reward-media";
import { useCalendarCompletions } from "@/hooks/use-calendar-completions";
import { useCalendarEvents } from "@/hooks/use-calendar-events";
import { useProfile } from "@/hooks/use-profile";
import { useTasks } from "@/hooks/use-tasks";
import { useWallet } from "@/hooks/use-wallet";
import { buildAchievements, type Achievement, type AchievementGroup, type AchievementTier } from "@/lib/achievements";
import { usePersistentAchievements } from "@/hooks/use-persistent-achievements";
import { toDateKey } from "@/lib/calendar/calendar-utils";
import { cn } from "@/lib/utils";

type FilterMode = "all" | "unlocked" | "locked";

const groupLabels: Record<AchievementGroup, string> = {
  daily: "Hoy",
  calendar: "Calendario",
  wallet: "Wallet",
  growth: "Crecimiento",
};

const groupHints: Record<AchievementGroup, string> = {
  daily: "Checks, tareas y avance de tu día.",
  calendar: "Actividades planeadas y completadas.",
  wallet: "Movimientos, metas y presupuesto.",
  growth: "Rachas, rutinas y hábitos constantes.",
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

  const calculatedResult = useMemo(() => buildAchievements({
    blocks,
    events,
    completionMap,
    wallet,
    hasCompletedOnboarding: profile.hasCompletedOnboarding,
    todayKey,
  }), [blocks, completionMap, events, profile.hasCompletedOnboarding, todayKey, wallet]);
  const { result, persistedUnlocks, syncStatus, lastError, isPersistent, recentUnlockIds, lastSyncedAt, clearRecentUnlocks } = usePersistentAchievements(calculatedResult);
  const [showUnlockFeedback, setShowUnlockFeedback] = useState(false);

  useEffect(() => {
    if (!recentUnlockIds.length) return;
    setShowUnlockFeedback(true);
  }, [recentUnlockIds]);

  const visibleAchievements = result.achievements
    .filter((achievement) => {
      if (filter === "unlocked") return achievement.unlocked;
      if (filter === "locked") return !achievement.unlocked;
      return true;
    })
    .sort((a, b) => {
      if (filter === "unlocked") return (b.unlockedAt ?? "").localeCompare(a.unlockedAt ?? "");
      if (a.unlocked !== b.unlocked) return a.unlocked ? -1 : 1;
      return b.progress - a.progress;
    });

  const syncing = tasksSyncing || calendarSyncing || completionSyncStatus === "loading" || walletSyncing;
  const groups = (["daily", "calendar", "wallet", "growth"] as AchievementGroup[]).map((group) => ({
    group,
    total: result.achievements.filter((achievement) => achievement.group === group).length,
    done: result.achievements.filter((achievement) => achievement.group === group && achievement.unlocked).length,
  }));
  const hasAnyActivity = result.stats.totalTasks > 0 || result.stats.totalCalendarEvents > 0 || result.stats.totalWalletTransactions > 0 || profile.hasCompletedOnboarding;

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
            <img src={getRewardTrophyIcon()} alt="Trofeo" className="h-8 w-8 object-contain" />
          </div>
        </header>

        <section className="mt-5 overflow-hidden rounded-[32px] bg-gradient-to-br from-monkey-purple via-monkey-greenDark to-monkey-green p-5 text-white shadow-soft">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-sm font-bold text-white/80">Progreso de medallas</p>
              <h2 className="mt-2 text-[42px] font-black leading-none">{result.unlockedCount}/{result.totalCount}</h2>
              <p className="mt-2 text-sm font-bold text-white/85">{result.completion}% del tablero desbloqueado</p>
            </div>
            <div className="rounded-[24px] bg-white/20 p-3 backdrop-blur">
              <img src={getRewardTrophyIcon()} alt="Trofeo de logros" className="h-10 w-10 object-contain" />
            </div>
          </div>
          <div className="mt-5 h-3 overflow-hidden rounded-full bg-white/25" aria-label={`Progreso ${result.completion}%`}>
            <div className="h-full rounded-full bg-white transition-all" style={{ width: `${result.completion}%` }} />
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs font-black">
            <MiniStat label="Estado" value={syncing ? "Actualizando" : "Listo"} />
            <MiniStat label="Racha" value={`${result.stats.streak} días`} />
            <MiniStat label="Activos" value={`${result.stats.activeDays} días`} />
          </div>
        </section>

        <PersistenceStatusCard syncStatus={syncStatus} lastError={lastError} isPersistent={isPersistent} persistedCount={persistedUnlocks.length} lastSyncedAt={lastSyncedAt} />
        {showUnlockFeedback && recentUnlockIds.length ? (
          <UnlockFeedbackBanner
            achievements={result.achievements.filter((achievement) => recentUnlockIds.includes(achievement.id))}
            onClose={() => {
              setShowUnlockFeedback(false);
              clearRecentUnlocks();
            }}
          />
        ) : null}
        {!hasAnyActivity ? <StarterEmptyState /> : null}
        {hasAnyActivity && result.nextAchievement ? <NextAchievementCard achievement={result.nextAchievement} /> : null}
        {hasAnyActivity && !result.nextAchievement ? <AllDoneCard /> : null}

        <section className="mt-5 grid grid-cols-2 gap-3">
          {groups.map(({ group, done, total }) => (
            <GroupProgressCard key={group} group={group} done={done} total={total} />
          ))}
        </section>

        <section className="mt-5 rounded-[28px] bg-white p-4 shadow-card">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-black">Explorar medallas</h2>
              <p className="text-xs font-bold text-monkey-muted">Filtrá para ver lo ganado o lo que sigue.</p>
            </div>
            <span className="rounded-full bg-gray-100 px-3 py-1.5 text-[11px] font-black text-monkey-muted">{visibleAchievements.length} visibles</span>
          </div>
          <div className="mt-4 grid grid-cols-3 rounded-[22px] bg-gray-100 p-1 text-sm font-black" role="tablist" aria-label="Filtro de logros">
            <FilterButton active={filter === "all"} onClick={() => setFilter("all")} label="Todos" count={result.totalCount} />
            <FilterButton active={filter === "unlocked"} onClick={() => setFilter("unlocked")} label="Ganados" count={result.unlockedCount} />
            <FilterButton active={filter === "locked"} onClick={() => setFilter("locked")} label="Próximos" count={result.totalCount - result.unlockedCount} />
          </div>
        </section>

        {visibleAchievements.length ? (
          <section className="mt-5 grid gap-3">
            {visibleAchievements.map((achievement) => <AchievementCard key={achievement.id} achievement={achievement} recentlyUnlocked={recentUnlockIds.includes(achievement.id)} />)}
          </section>
        ) : (
          <FilterEmptyState filter={filter} />
        )}

        <TipsSection />
        <SourcesSection />
      </section>
    </AppShell>
  );
}

function PersistenceStatusCard({ syncStatus, lastError, isPersistent, persistedCount, lastSyncedAt }: { syncStatus: string; lastError: string | null; isPersistent: boolean; persistedCount: number; lastSyncedAt: string | null }) {
  const copy = !isPersistent
    ? { title: "Modo local", body: "Los logros se calculan en este dispositivo. Al iniciar sesión con Supabase se guardarán con fecha de desbloqueo." }
    : syncStatus === "saving"
      ? { title: "Guardando medallas", body: "Estamos sincronizando tus nuevos logros con Supabase." }
      : syncStatus === "loading"
        ? { title: "Cargando historial", body: "Buscando tus medallas guardadas en tu cuenta." }
        : syncStatus === "error"
          ? { title: "Sincronización pendiente", body: lastError || "No se pudo sincronizar el historial de logros." }
          : { title: "Historial sincronizado", body: persistedCount ? `${persistedCount} medallas guardadas${lastSyncedAt ? ` · ${formatSyncTime(lastSyncedAt)}` : ""}.` : "Cuando ganés una medalla, quedará guardada en tu cuenta." };

  return (
    <section className={cn("mt-5 rounded-[24px] border p-4", syncStatus === "error" ? "border-orange-200 bg-orange-50" : "border-monkey-green/15 bg-white")}>
      <div className="flex items-start gap-3">
        <div className={cn("grid h-11 w-11 shrink-0 place-items-center rounded-[18px]", syncStatus === "error" ? "bg-white text-orange-700" : "bg-green-50 text-monkey-greenDark")}>
          <BadgeCheck className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-black">{copy.title}</h2>
          <p className="mt-1 text-xs font-bold leading-relaxed text-monkey-muted">{copy.body}</p>
        </div>
      </div>
    </section>
  );
}

function formatUnlockedAt(value?: string | null) {
  if (!value) return null;
  try {
    return new Intl.DateTimeFormat("es-CR", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value));
  } catch {
    return null;
  }
}

function formatSyncTime(value?: string | null) {
  if (!value) return null;
  try {
    return new Intl.DateTimeFormat("es-CR", { hour: "2-digit", minute: "2-digit" }).format(new Date(value));
  } catch {
    return null;
  }
}

function UnlockFeedbackBanner({ achievements, onClose }: { achievements: Achievement[]; onClose: () => void }) {
  const primary = achievements[0];
  const title = achievements.length === 1 ? achievements[0]?.title : `${achievements.length} medallas nuevas`;
  const tier = primary?.tier ?? "bronze";
  return (
    <section className="mt-5 overflow-hidden rounded-[30px] border border-monkey-yellow/40 bg-gradient-to-br from-yellow-50 via-white to-green-50 p-4 shadow-card">
      <div className="flex items-end gap-3">
        <img src={getRewardCelebrationArt(tier)} alt="Mono celebrando" className="hidden h-28 w-24 shrink-0 object-contain sm:block" />
        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-3">
            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-[22px] bg-white shadow-card">
              <img src={getRewardMedalIcon(tier)} alt="Medalla desbloqueada" className="h-10 w-10 object-contain" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-black uppercase tracking-[.1em] text-orange-700">Desbloqueada ahora</p>
              <h2 className="mt-1 text-lg font-black">{title}</h2>
              <p className="mt-1 text-xs font-bold leading-relaxed text-monkey-muted">Tus medallas nuevas ya se guardan y este banner solo aparece para desbloqueos recientes.</p>
            </div>
            <button type="button" onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full bg-white text-monkey-muted shadow-sm transition active:scale-95" aria-label="Cerrar banner de logro">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {achievements.slice(0, 3).map((achievement) => (
              <span key={achievement.id} className="rounded-full bg-white px-3 py-1.5 text-[11px] font-black text-monkey-greenDark shadow-sm">
                {achievement.title}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[18px] bg-white/15 px-2 py-2 backdrop-blur">
      <p className="text-[10px] uppercase tracking-[.08em] text-white/70">{label}</p>
      <p className="mt-0.5 truncate text-xs text-white">{value}</p>
    </div>
  );
}

function FilterButton({ active, onClick, label, count }: { active: boolean; onClick: () => void; label: string; count: number }) {
  return (
    <button type="button" onClick={onClick} className={cn("flex h-11 items-center justify-center gap-1 rounded-[18px] transition active:scale-[.99]", active ? "bg-white text-monkey-green shadow-card" : "text-monkey-muted")} aria-pressed={active}>
      <span>{label}</span>
      <span className={cn("rounded-full px-1.5 py-0.5 text-[10px]", active ? "bg-green-50" : "bg-white/80")}>{count}</span>
    </button>
  );
}

function StarterEmptyState() {
  return (
    <section className="mt-5 rounded-[30px] border border-dashed border-monkey-green/35 bg-green-50/70 p-5">
      <div className="flex items-start gap-4">
        <div className="grid h-14 w-14 shrink-0 place-items-center rounded-[22px] bg-white shadow-card">
          <MonkeyAvatar size={40} variant="face" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-black uppercase tracking-[.1em] text-monkey-greenDark">Primeros pasos</p>
          <h2 className="mt-1 text-lg font-black">Tus medallas se activan cuando empezás a usar la app</h2>
          <p className="mt-1 text-sm font-bold leading-relaxed text-monkey-muted">Creá una tarea, planeá una actividad o registrá un movimiento para que Monkey Checks empiece a calcular tus logros.</p>
          <div className="mt-4 grid gap-2 sm:grid-cols-3">
            <QuickLink href="/today" label="Crear tarea" />
            <QuickLink href="/calendar" label="Planear día" />
            <QuickLink href="/wallet" label="Abrir Wallet" />
          </div>
        </div>
      </div>
    </section>
  );
}

function QuickLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="flex h-11 items-center justify-between rounded-[18px] bg-white px-3 text-xs font-black text-monkey-greenDark shadow-card transition active:scale-[.98]">
      {label}<ChevronRight className="h-4 w-4" />
    </Link>
  );
}

function NextAchievementCard({ achievement }: { achievement: Achievement }) {
  return (
    <section className="mt-5 rounded-[28px] border border-monkey-yellow/30 bg-yellow-50 p-4">
      <div className="flex items-start gap-3">
        <div className="grid h-14 w-14 shrink-0 place-items-center rounded-[22px] bg-white shadow-card">
          <img src={getRewardMedalIcon(achievement.tier)} alt={`Medalla ${tierLabels[achievement.tier]}`} className="h-10 w-10 object-contain" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-black uppercase tracking-[.08em] text-orange-700">Próximo logro</p>
          <h2 className="mt-1 text-base font-black">{achievement.title}</h2>
          <p className="mt-1 text-xs font-bold leading-relaxed text-monkey-muted">{achievement.helper}</p>
          <div className="mt-3 flex items-center gap-2">
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-white">
              <div className="h-full rounded-full bg-monkey-yellow" style={{ width: `${achievement.progress}%` }} />
            </div>
            <span className="text-xs font-black text-orange-700">{achievement.progress}%</span>
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
        <img src={getRewardTrophyIcon()} alt="Trofeo" className="h-8 w-8 object-contain" />
        <div>
          <h2 className="text-base font-black">¡Tablero completo!</h2>
          <p className="text-xs font-bold opacity-80">Ya desbloqueaste todas las medallas base. La próxima etapa puede guardar historial en Supabase.</p>
        </div>
      </div>
    </section>
  );
}

function GroupProgressCard({ group, done, total }: { group: AchievementGroup; done: number; total: number }) {
  const value = total ? Math.round((done / total) * 100) : 0;
  return (
    <article className="rounded-card bg-white p-4 shadow-card">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[11px] font-black uppercase tracking-[.08em] text-monkey-muted">{groupLabels[group]}</p>
          <p className="mt-1 text-2xl font-black">{done}/{total}</p>
        </div>
        <span className="rounded-full bg-green-50 px-2 py-1 text-[10px] font-black text-monkey-greenDark">{value}%</span>
      </div>
      <p className="mt-2 min-h-8 text-[11px] font-bold leading-snug text-monkey-muted">{groupHints[group]}</p>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-100">
        <div className="h-full rounded-full bg-monkey-green" style={{ width: `${value}%` }} />
      </div>
    </article>
  );
}

function AchievementCard({ achievement, recentlyUnlocked }: { achievement: Achievement; recentlyUnlocked: boolean }) {
  const unlocked = achievement.unlocked;
  const medalSrc = getRewardMedalIcon(achievement.tier);
  return (
    <article className={cn("rounded-[26px] border p-4 shadow-card transition", recentlyUnlocked && "ring-4 ring-monkey-yellow/40", unlocked ? "border-monkey-green/15 bg-white" : "border-gray-100 bg-gray-50")}> 
      <div className="flex items-start gap-3">
        <div className={cn("relative grid h-14 w-14 shrink-0 place-items-center rounded-[22px] shadow-sm", unlocked ? "bg-green-50" : "bg-white")}> 
          <img src={medalSrc} alt={`Medalla ${tierLabels[achievement.tier]}`} className={cn("h-10 w-10 object-contain", !unlocked && "opacity-45 grayscale")} />
          {!unlocked ? <span className="absolute -right-1 -top-1 grid h-6 w-6 place-items-center rounded-full bg-slate-900 text-white"><Lock className="h-3.5 w-3.5" /></span> : null}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-sm font-black">{achievement.title}</h3>
            {unlocked ? <BadgeCheck className="h-4 w-4 shrink-0 text-monkey-green" /> : null}
          </div>
          <p className="mt-1 text-xs font-bold leading-relaxed text-monkey-muted">{achievement.description}</p>
          {unlocked && achievement.unlockedAt ? <p className="mt-2 rounded-[16px] bg-green-50 px-3 py-2 text-[11px] font-black leading-snug text-monkey-greenDark">Desbloqueado el {formatUnlockedAt(achievement.unlockedAt)}</p> : null}
          {!unlocked ? <p className="mt-2 rounded-[16px] bg-white px-3 py-2 text-[11px] font-bold leading-snug text-monkey-muted">{achievement.helper}</p> : null}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-black text-monkey-muted shadow-sm">{groupLabels[achievement.group]}</span>
            <span className={cn("rounded-full px-2.5 py-1 text-[10px] font-black", tierClass(achievement.tier))}>{tierLabels[achievement.tier]}</span>
            <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-black text-monkey-muted shadow-sm">{achievement.progress}%</span>
            {recentlyUnlocked ? <span className="rounded-full bg-yellow-50 px-2.5 py-1 text-[10px] font-black text-orange-700">Nueva</span> : null}
            {achievement.persisted ? <span className="rounded-full bg-green-50 px-2.5 py-1 text-[10px] font-black text-monkey-greenDark">Guardada</span> : null}
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-white">
            <div className={cn("h-full rounded-full", unlocked ? "bg-monkey-green" : "bg-gray-300")} style={{ width: `${achievement.progress}%` }} />
          </div>
        </div>
      </div>
    </article>
  );
}

function FilterEmptyState({ filter }: { filter: FilterMode }) {
  const copy = filter === "unlocked"
    ? { title: "Todavía no hay medallas ganadas", body: "Completá tu primer check para desbloquear la primera medalla." }
    : { title: "No hay medallas en este filtro", body: "Probá con Todos para ver el tablero completo." };
  return (
    <section className="mt-5 rounded-[28px] bg-white p-5 text-center shadow-card">
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-[22px] bg-gray-50 text-monkey-muted">
        <HelpCircle className="h-6 w-6" />
      </div>
      <h2 className="mt-3 text-base font-black">{copy.title}</h2>
      <p className="mx-auto mt-1 max-w-[260px] text-sm font-bold leading-relaxed text-monkey-muted">{copy.body}</p>
    </section>
  );
}

function TipsSection() {
  const tips = [
    { title: "Para ganar rápido", body: "Marcá una tarea como lista en Hoy.", href: "/today", label: "Ir a Hoy", icon: CheckCircle2 },
    { title: "Para crear rutina", body: "Repetí una actividad 3 veces en calendario.", href: "/calendar", label: "Abrir calendario", icon: Repeat2 },
    { title: "Para Wallet", body: "Registrá un movimiento o creá una meta.", href: "/wallet", label: "Abrir Wallet", icon: WalletCards },
  ];
  return (
    <section className="mt-6 rounded-[28px] bg-white p-4 shadow-card">
      <h2 className="text-base font-black">Cómo desbloquear más</h2>
      <div className="mt-3 grid gap-3">
        {tips.map((tip) => (
          <Link key={tip.title} href={tip.href} className="flex items-center gap-3 rounded-[22px] bg-gray-50 p-3 transition active:scale-[.99]">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-[18px] bg-white text-monkey-greenDark shadow-sm">
              <tip.icon className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-black">{tip.title}</h3>
              <p className="text-xs font-bold text-monkey-muted">{tip.body}</p>
            </div>
            <span className="hidden text-[11px] font-black text-monkey-green sm:inline">{tip.label}</span>
            <ChevronRight className="h-4 w-4 shrink-0 text-monkey-muted" />
          </Link>
        ))}
      </div>
    </section>
  );
}

function SourcesSection() {
  return (
    <section className="mt-6 rounded-[28px] border border-monkey-green/15 bg-white p-4 shadow-card">
      <div className="flex items-start gap-3">
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-[20px] bg-green-50 text-monkey-greenDark">
          <BarChart3 className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-base font-black">Cómo se calculan</h2>
          <p className="mt-1 text-xs font-bold leading-relaxed text-monkey-muted">
Las medallas se calculan con Hoy, Calendario, completions, onboarding y Wallet. Desde v2.22.1, el momento de recompensa usa arte dedicado de oro, plata y bronce, respeta mejor el espacio móvil, conserva el guardado en Supabase y evita repetir animaciones al recargar.
          </p>
        </div>
      </div>
    </section>
  );
}

function tierClass(tier: AchievementTier) {
  if (tier === "gold") return "bg-yellow-50 text-orange-700";
  if (tier === "silver") return "bg-slate-100 text-slate-700";
  if (tier === "special") return "bg-purple-50 text-monkey-purple";
  return "bg-orange-50 text-orange-700";
}
