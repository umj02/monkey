"use client";

import Link from "next/link";
import { useMemo } from "react";
import {
  ArrowLeft,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  Flame,
  PiggyBank,
  Sparkles,
  ShieldCheck,
  Trophy,
  Banana,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { MonkeyAvatar } from "@/components/monkey-avatar";
import { useCalendarCompletions } from "@/hooks/use-calendar-completions";
import { useCalendarEvents } from "@/hooks/use-calendar-events";
import { useCalendarOverrides } from "@/hooks/use-calendar-overrides";
import { usePersistentAchievements } from "@/hooks/use-persistent-achievements";
import { useProfile } from "@/hooks/use-profile";
import { useTasks } from "@/hooks/use-tasks";
import { useWallet } from "@/hooks/use-wallet";
import { useChallenges } from "@/hooks/use-challenges";
import { buildAchievements, type Achievement } from "@/lib/achievements";
import { applyCalendarOverridesForDate, getCalendarEventDone, toDateKey } from "@/lib/calendar/calendar-utils";
import { getRewardMedalIcon, getRewardTrophyIcon } from "@/lib/reward-media";
import { cn } from "@/lib/utils";
import type { WalletTransactionType } from "@/types";

type DayReport = {
  key: string;
  label: string;
  shortLabel: string;
  tasksTotal: number;
  tasksDone: number;
  calendarTotal: number;
  calendarDone: number;
  walletCount: number;
  achievementCount: number;
  score: number;
};

const walletTypeLabels: Record<WalletTransactionType, string> = {
  income: "Ingresos",
  extra: "Extras",
  expense: "Gastos",
  saving: "Ahorro",
};

const walletTone: Record<WalletTransactionType, string> = {
  income: "bg-green-50 text-monkey-greenDark",
  extra: "bg-purple-50 text-purple-700",
  expense: "bg-orange-50 text-orange-700",
  saving: "bg-sky-50 text-sky-700",
};

function addDays(date: Date, amount: number) {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + amount);
  return copy;
}

function formatDay(dateKey: string, weekday: "short" | "long" = "short") {
  try {
    const [year, month, day] = dateKey.split("-").map(Number);
    return new Intl.DateTimeFormat("es-CR", { weekday, day: "2-digit", month: "short" }).format(new Date(year, month - 1, day));
  } catch {
    return dateKey;
  }
}

function money(value: number, currency: string) {
  return new Intl.NumberFormat("es-CR", { style: "currency", currency }).format(value || 0);
}

function walletTotal(transactions: { type: WalletTransactionType; amount: number }[], type: WalletTransactionType) {
  return transactions.filter((transaction) => transaction.type === type).reduce((sum, transaction) => sum + transaction.amount, 0);
}

function motivationalMessage(completion: number, streak: number, achievementsThisWeek: number) {
  if (completion >= 85) return "Semana poderosa: mantuviste buen ritmo y cerraste muchas actividades.";
  if (streak >= 3) return "Tu racha está tomando fuerza. Un check más hoy mantiene el impulso.";
  if (achievementsThisWeek > 0) return "Ganaste medallas esta semana. Seguí usando tus avances como motivación.";
  if (completion >= 45) return "Vas avanzando. La próxima semana puede mejorar con pocas acciones diarias.";
  return "Semana de arranque: elegí una tarea simple para activar el ritmo de nuevo.";
}

export default function WeeklySummaryPage() {
  const todayKey = useMemo(() => toDateKey(new Date()), []);
  const weekDays = useMemo(() => Array.from({ length: 7 }, (_, index) => {
    const date = addDays(new Date(), index - 6);
    return toDateKey(date);
  }), []);
  const weekSet = useMemo(() => new Set(weekDays), [weekDays]);

  const { profile } = useProfile();
  const { blocks, syncing: tasksSyncing } = useTasks();
  const { events, syncing: calendarSyncing } = useCalendarEvents();
  const { overrides } = useCalendarOverrides();
  const { completionMap, syncStatus: completionSyncStatus } = useCalendarCompletions();
  const { wallet, syncing: walletSyncing } = useWallet();
  const { bananaLedger, summary: challengeSummary, syncing: challengeSyncing } = useChallenges();

  const calculatedAchievementResult = useMemo(() => buildAchievements({
    blocks,
    events,
    completionMap,
    wallet,
    hasCompletedOnboarding: profile.hasCompletedOnboarding,
    todayKey,
  }), [blocks, completionMap, events, profile.hasCompletedOnboarding, todayKey, wallet]);
  const { result: achievementResult, syncStatus: achievementSyncStatus } = usePersistentAchievements(calculatedAchievementResult);

  const achievementsThisWeek = useMemo(() => achievementResult.achievements.filter((achievement) => {
    if (!achievement.unlockedAt) return false;
    return weekSet.has(toDateKey(new Date(achievement.unlockedAt)));
  }), [achievementResult.achievements, weekSet]);

  const walletTransactionsThisWeek = useMemo(() => wallet.transactions.filter((transaction) => weekSet.has(transaction.date)), [wallet.transactions, weekSet]);

  const dayReports = useMemo<DayReport[]>(() => weekDays.map((dateKey) => {
    const dayBlocks = blocks.filter((block) => (block.date ?? todayKey) === dateKey);
    const tasksTotal = dayBlocks.reduce((sum, block) => sum + block.tasks.length, 0);
    const tasksDone = dayBlocks.reduce((sum, block) => sum + block.tasks.filter((task) => task.done).length, 0);
    const dayEvents = applyCalendarOverridesForDate(events, overrides, dateKey);
    const calendarTotal = dayEvents.length;
    const calendarDone = dayEvents.filter((event) => getCalendarEventDone(event, dateKey, completionMap)).length;
    const walletCount = wallet.transactions.filter((transaction) => transaction.date === dateKey).length;
    const achievementCount = achievementsThisWeek.filter((achievement) => achievement.unlockedAt && toDateKey(new Date(achievement.unlockedAt)) === dateKey).length;
    const score = tasksDone + calendarDone + walletCount + achievementCount;
    return {
      key: dateKey,
      label: formatDay(dateKey, "long"),
      shortLabel: formatDay(dateKey),
      tasksTotal,
      tasksDone,
      calendarTotal,
      calendarDone,
      walletCount,
      achievementCount,
      score,
    };
  }), [achievementsThisWeek, blocks, completionMap, events, overrides, todayKey, wallet.transactions, weekDays]);

  const totals = useMemo(() => {
    const taskTotal = dayReports.reduce((sum, day) => sum + day.tasksTotal, 0);
    const taskDone = dayReports.reduce((sum, day) => sum + day.tasksDone, 0);
    const calendarTotal = dayReports.reduce((sum, day) => sum + day.calendarTotal, 0);
    const calendarDone = dayReports.reduce((sum, day) => sum + day.calendarDone, 0);
    const total = taskTotal + calendarTotal;
    const done = taskDone + calendarDone;
    const completion = total ? Math.round((done / total) * 100) : 0;
    const bestDay = [...dayReports].sort((a, b) => b.score - a.score)[0] ?? null;
    return { taskTotal, taskDone, calendarTotal, calendarDone, total, done, completion, bestDay };
  }, [dayReports]);

  const walletSummary = useMemo(() => ({
    income: walletTotal(walletTransactionsThisWeek, "income"),
    extra: walletTotal(walletTransactionsThisWeek, "extra"),
    expense: walletTotal(walletTransactionsThisWeek, "expense"),
    saving: walletTotal(walletTransactionsThisWeek, "saving"),
  }), [walletTransactionsThisWeek]);

  const bananasThisWeek = bananaLedger.filter((entry) => weekSet.has(toDateKey(new Date(entry.createdAt))));
  const bananasTotal = bananasThisWeek.reduce((sum, entry) => sum + entry.amount, 0);

  const syncing = tasksSyncing || calendarSyncing || completionSyncStatus === "loading" || walletSyncing || challengeSyncing || achievementSyncStatus === "loading";
  const message = motivationalMessage(totals.completion, achievementResult.stats.streak, achievementsThisWeek.length);

  return (
    <AppShell>
      <section className="page-pad pt-7 pb-8">
        <header className="flex items-center justify-between gap-3">
          <Link href="/analytics" className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white shadow-card transition active:scale-95" aria-label="Volver a Analítica">
            <ArrowLeft className="h-5 w-5 text-monkey-muted" />
          </Link>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-black uppercase tracking-[.12em] text-monkey-greenDark">Reporte semanal</p>
            <h1 className="text-2xl font-black tracking-tight">Resumen de progreso</h1>
          </div>
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-white shadow-card">
            <img src={getRewardTrophyIcon()} alt="Trofeo" className="h-8 w-8 object-contain" />
          </div>
        </header>

        <section className="mt-5 overflow-hidden rounded-[34px] bg-gradient-to-br from-monkey-green via-monkey-greenDark to-monkey-purple p-5 text-white shadow-soft">
          <div className="flex items-end gap-4">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-white/80">Últimos 7 días</p>
              <h2 className="mt-2 text-[44px] font-black leading-none">{totals.completion}%</h2>
              <p className="mt-2 text-sm font-bold leading-relaxed text-white/85">{message}</p>
            </div>
            <div className="hidden w-24 shrink-0 sm:block">
              <MonkeyAvatar size={88} variant="face" />
            </div>
          </div>
          <div className="mt-5 h-3 overflow-hidden rounded-full bg-white/25" aria-label={`Progreso semanal ${totals.completion}%`}>
            <div className="h-full rounded-full bg-white transition-all" style={{ width: `${totals.completion}%` }} />
          </div>
          <div className="mt-4 flex flex-wrap gap-2 text-xs font-black">
            <span className="rounded-full bg-white/20 px-3 py-1.5">{syncing ? "Actualizando…" : "Sincronizado"}</span>
            <span className="rounded-full bg-white/20 px-3 py-1.5">Racha {achievementResult.stats.streak} días</span>
            <span className="rounded-full bg-white/20 px-3 py-1.5">{achievementsThisWeek.length} medallas</span>
          </div>
        </section>

        <section className="mt-5 grid grid-cols-2 gap-3">
          <MetricCard icon={<CheckCircle2 className="h-5 w-5" />} label="Checks" value={`${totals.taskDone}/${totals.taskTotal}`} hint="Tareas actuales" tone="green" />
          <MetricCard icon={<CalendarDays className="h-5 w-5" />} label="Calendario" value={`${totals.calendarDone}/${totals.calendarTotal}`} hint="Actividades cumplidas" tone="blue" />
          <MetricCard icon={<Trophy className="h-5 w-5" />} label="Logros" value={String(achievementsThisWeek.length)} hint="Ganados esta semana" tone="purple" />
          <MetricCard icon={<Flame className="h-5 w-5" />} label="Mejor día" value={totals.bestDay?.score ? totals.bestDay.shortLabel : "Pendiente"} hint={totals.bestDay?.score ? `${totals.bestDay.score} avances` : "Aún sin actividad"} tone="orange" />
        </section>

        <section className="mt-6 rounded-card bg-white p-4 shadow-card">
          <SectionTitle title="Ritmo por día" subtitle="Checks, calendario, bananas y medallas" icon={<BarChart3 className="h-5 w-5 text-monkey-greenDark" />} />
          <div className="grid gap-3">
            {dayReports.map((day) => <DayRow key={day.key} day={day} maxScore={Math.max(1, ...dayReports.map((item) => item.score))} />)}
          </div>
        </section>

        <section className="mt-6 rounded-card bg-white p-4 shadow-card">
          <SectionTitle title="Bananas semanales" subtitle="Monedero interno de recompensas" icon={<Banana className="h-5 w-5 text-orange-600" />} />
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-[20px] bg-yellow-50 p-3 text-orange-700">
              <p className="text-[11px] font-black uppercase tracking-[.08em] opacity-70">Reclamadas</p>
              <p className="mt-1 text-sm font-black">{bananasTotal} bananas</p>
            </div>
            <div className="rounded-[20px] bg-green-50 p-3 text-monkey-greenDark">
              <p className="text-[11px] font-black uppercase tracking-[.08em] opacity-70">Listas</p>
              <p className="mt-1 text-sm font-black">{challengeSummary.bananasAvailable} bananas</p>
            </div>
            <div className="rounded-[20px] bg-purple-50 p-3 text-purple-700">
              <p className="text-[11px] font-black uppercase tracking-[.08em] opacity-70">Retos activos</p>
              <p className="mt-1 text-sm font-black">{challengeSummary.active}</p>
            </div>
            <div className="rounded-[20px] bg-pink-50 p-3 text-monkey-pink">
              <p className="text-[11px] font-black uppercase tracking-[.08em] opacity-70">No ganadas</p>
              <p className="mt-1 text-sm font-black">{challengeSummary.bananasLost}</p>
            </div>
          </div>
          {!bananasThisWeek.length ? <EmptyPanel title="Sin bananas esta semana" body="Completá retos para sumar bananas al monedero." href="/wallet" label="Abrir Bananas" /> : null}
        </section>

        <section className="mt-6 rounded-card bg-white p-4 shadow-card">
          <SectionTitle title="Logros ganados" subtitle="Medallas desbloqueadas durante esta semana" icon={<Sparkles className="h-5 w-5 text-monkey-purple" />} />
          {achievementsThisWeek.length ? (
            <div className="grid gap-3">
              {achievementsThisWeek.slice(0, 4).map((achievement) => <AchievementRow key={achievement.id} achievement={achievement} />)}
              {achievementsThisWeek.length > 4 ? <Link href="/achievements" className="rounded-full bg-purple-50 px-4 py-3 text-center text-xs font-black text-monkey-purple">Ver todas las medallas</Link> : null}
            </div>
          ) : (
            <EmptyPanel title="Sin medallas nuevas" body="Completá checks, calendario o bananas para desbloquear la próxima." href="/achievements" label="Ver logros" />
          )}
        </section>

        <section className="mt-6 rounded-[28px] border border-monkey-green/15 bg-green-50 p-4">
          <div className="flex items-start gap-3">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-[20px] bg-white text-monkey-greenDark shadow-card">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-base font-black">Siguiente enfoque</h2>
              <p className="mt-1 text-xs font-bold leading-relaxed text-monkey-muted">
                {totals.completion >= 70 ? "Mantené la racha con una tarea pequeña diaria y revisá tu calendario antes de empezar." : "Elegí una sola actividad para completar hoy. Un check simple puede activar toda la semana."}
              </p>
              <div className="mt-3 grid grid-cols-3 gap-2 text-center text-[11px] font-black text-monkey-greenDark">
                <QuickLink href="/today" label="Hoy" />
                <QuickLink href="/calendar" label="Calendario" />
                <QuickLink href="/guardian-share" label="Compartir" />
              </div>
            </div>
          </div>
        </section>
      </section>
    </AppShell>
  );
}

function SectionTitle({ title, subtitle, icon }: { title: string; subtitle: string; icon: React.ReactNode }) {
  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <div className="min-w-0">
        <h2 className="text-lg font-black">{title}</h2>
        <p className="text-xs font-bold text-monkey-muted">{subtitle}</p>
      </div>
      <div className="shrink-0">{icon}</div>
    </div>
  );
}

function MetricCard({ icon, label, value, hint, tone }: { icon: React.ReactNode; label: string; value: string; hint: string; tone: "green" | "orange" | "blue" | "purple" }) {
  const toneClass = {
    green: "bg-green-50 text-monkey-greenDark",
    orange: "bg-orange-50 text-orange-700",
    blue: "bg-sky-50 text-sky-700",
    purple: "bg-purple-50 text-purple-700",
  }[tone];
  return (
    <article className="rounded-card bg-white p-4 shadow-card">
      <div className={cn("grid h-10 w-10 place-items-center rounded-[16px]", toneClass)}>{icon}</div>
      <p className="mt-3 text-[11px] font-black uppercase tracking-[.08em] text-monkey-muted">{label}</p>
      <p className="mt-1 truncate text-xl font-black">{value}</p>
      <p className="text-xs font-bold text-monkey-muted">{hint}</p>
    </article>
  );
}

function DayRow({ day, maxScore }: { day: DayReport; maxScore: number }) {
  const width = Math.round((day.score / maxScore) * 100);
  return (
    <article className="rounded-[22px] bg-gray-50 p-3">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-black capitalize">{day.label}</p>
          <p className="text-[11px] font-bold text-monkey-muted">{day.tasksDone} checks · {day.calendarDone} calendario · {day.walletCount} wallet</p>
        </div>
        <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-monkey-greenDark shadow-sm">{day.score}</span>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-white">
        <div className="h-full rounded-full bg-monkey-green" style={{ width: `${width}%` }} />
      </div>
    </article>
  );
}

function AchievementRow({ achievement }: { achievement: Achievement }) {
  return (
    <article className="flex items-center gap-3 rounded-[22px] bg-purple-50 p-3">
      <div className="grid h-12 w-12 shrink-0 place-items-center rounded-[18px] bg-white shadow-card">
        <img src={getRewardMedalIcon(achievement.tier)} alt={achievement.title} className="h-9 w-9 object-contain" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-black">{achievement.title}</p>
        <p className="text-[11px] font-bold text-monkey-muted">{achievement.description}</p>
      </div>
      <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-black text-monkey-purple">Nueva</span>
    </article>
  );
}

function EmptyPanel({ title, body, href, label }: { title: string; body: string; href: string; label: string }) {
  return (
    <div className="rounded-[24px] border border-dashed border-gray-200 bg-gray-50 p-4 text-center">
      <h3 className="text-sm font-black">{title}</h3>
      <p className="mx-auto mt-1 max-w-[260px] text-xs font-bold leading-relaxed text-monkey-muted">{body}</p>
      <Link href={href} className="mt-3 inline-flex h-10 items-center rounded-full bg-white px-4 text-xs font-black text-monkey-greenDark shadow-card">{label}</Link>
    </div>
  );
}

function QuickLink({ href, label }: { href: string; label: string }) {
  return <Link href={href} className="rounded-full bg-white px-3 py-2 shadow-sm transition active:scale-95">{label}</Link>;
}
