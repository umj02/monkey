"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowLeft, BarChart3, CalendarDays, CheckCircle2, Flame, PiggyBank, Sparkles, Target, Trophy, WalletCards } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { AssetThumb } from "@/components/asset-thumb";
import { MonkeyAvatar } from "@/components/monkey-avatar";
import { useTasks } from "@/hooks/use-tasks";
import { useCalendarEvents } from "@/hooks/use-calendar-events";
import { useCalendarCompletions } from "@/hooks/use-calendar-completions";
import { useCalendarOverrides } from "@/hooks/use-calendar-overrides";
import { useWallet } from "@/hooks/use-wallet";
import { activityTypePillClass, getActivityTypeByKey, inferActivityTypeFromEvent, inferActivityTypeFromIcon } from "@/lib/activity-types";
import { applyCalendarOverridesForDate, fromDateKey, getCalendarEventDone, toDateKey } from "@/lib/calendar/calendar-utils";
import { cn } from "@/lib/utils";
import type { CalendarEvent, WalletTransaction, WalletTransactionType } from "@/types";

type RangeMode = "week" | "month";

type DayMetric = {
  dateKey: string;
  total: number;
  done: number;
};

type ActivityMetric = {
  key: string;
  label: string;
  iconKey: string;
  color: CalendarEvent["color"];
  total: number;
  done: number;
};

const walletTypeLabels: Record<WalletTransactionType, string> = {
  income: "Ingresos",
  extra: "Extras",
  expense: "Gastos",
  saving: "Ahorros",
};

const walletTone: Record<WalletTransactionType, string> = {
  income: "bg-green-50 text-monkey-greenDark",
  extra: "bg-yellow-50 text-orange-700",
  expense: "bg-pink-50 text-monkey-pink",
  saving: "bg-purple-50 text-purple-700",
};

function addDays(date: Date, amount: number) {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + amount);
  return copy;
}

function startOfWeek(date: Date) {
  const copy = new Date(date);
  const day = copy.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  copy.setDate(copy.getDate() + diff);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function endOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

function datesBetween(start: Date, end: Date) {
  const days: string[] = [];
  let cursor = new Date(start);
  cursor.setHours(0, 0, 0, 0);
  const last = new Date(end);
  last.setHours(0, 0, 0, 0);
  while (cursor <= last) {
    days.push(toDateKey(cursor));
    cursor = addDays(cursor, 1);
  }
  return days;
}

function isBetween(dateKey: string, startKey: string, endKey: string) {
  return dateKey >= startKey && dateKey <= endKey;
}

function percent(done: number, total: number) {
  if (!total) return 0;
  return Math.round((done / total) * 100);
}

function money(value: number, currency = "CRC") {
  return new Intl.NumberFormat("es-CR", { style: "currency", currency, maximumFractionDigits: currency === "CRC" ? 0 : 2 }).format(value);
}

function rangeLabel(mode: RangeMode, startKey: string, endKey: string) {
  const start = fromDateKey(startKey);
  const end = fromDateKey(endKey);
  if (mode === "week") {
    const startLabel = start.toLocaleDateString("es-CR", { day: "numeric", month: "short" });
    const endLabel = end.toLocaleDateString("es-CR", { day: "numeric", month: "short" });
    return `${startLabel} - ${endLabel}`;
  }
  return start.toLocaleDateString("es-CR", { month: "long", year: "numeric" });
}

function shortDay(dateKey: string) {
  const date = fromDateKey(dateKey);
  return date.toLocaleDateString("es-CR", { weekday: "short" }).replace(".", "").slice(0, 3);
}

function transactionAmountByType(transactions: WalletTransaction[], type: WalletTransactionType) {
  return transactions.filter((item) => item.type === type).reduce((sum, item) => sum + item.amount, 0);
}

export default function AnalyticsPage() {
  const [mode, setMode] = useState<RangeMode>("week");
  const today = useMemo(() => new Date(), []);
  const todayKey = useMemo(() => toDateKey(today), [today]);
  const { blocks, syncing: tasksSyncing } = useTasks();
  const { events, syncing: calendarSyncing, syncStatus: calendarSyncStatus, lastError: calendarError } = useCalendarEvents();
  const { completionMap, syncStatus: completionSyncStatus, lastError: completionError } = useCalendarCompletions();
  const { overrides } = useCalendarOverrides();
  const { wallet, syncing: walletSyncing, syncStatus: walletSyncStatus, lastError: walletError } = useWallet();

  const range = useMemo(() => {
    const start = mode === "week" ? startOfWeek(today) : startOfMonth(today);
    const end = mode === "week" ? addDays(start, 6) : endOfMonth(today);
    const startKey = toDateKey(start);
    const endKey = toDateKey(end);
    return { startKey, endKey, days: datesBetween(start, end) };
  }, [mode, today]);

  const calendarOccurrences = useMemo(() => {
    return range.days.flatMap((dateKey) =>
      applyCalendarOverridesForDate(events, overrides, dateKey).map((event) => ({ event, dateKey })),
    );
  }, [events, overrides, range.days]);

  const taskBlocksInRange = useMemo(() => {
    return blocks.filter((block) => isBetween(block.date ?? todayKey, range.startKey, range.endKey));
  }, [blocks, range.endKey, range.startKey, todayKey]);

  const walletTransactionsInRange = useMemo(() => {
    return wallet.transactions.filter((item) => isBetween(item.date, range.startKey, range.endKey));
  }, [range.endKey, range.startKey, wallet.transactions]);

  const dayMetrics = useMemo<DayMetric[]>(() => {
    return range.days.map((dateKey) => {
      const blockTasks = blocks
        .filter((block) => (block.date ?? todayKey) === dateKey)
        .flatMap((block) => block.tasks);
      const dayEvents = calendarOccurrences.filter((item) => item.dateKey === dateKey);
      const total = blockTasks.length + dayEvents.length;
      const done = blockTasks.filter((task) => task.done).length + dayEvents.filter(({ event }) => getCalendarEventDone(event, dateKey, completionMap)).length;
      return { dateKey, total, done };
    });
  }, [blocks, calendarOccurrences, completionMap, range.days, todayKey]);

  const summary = useMemo(() => {
    const taskTotal = taskBlocksInRange.reduce((sum, block) => sum + block.tasks.length, 0);
    const taskDone = taskBlocksInRange.reduce((sum, block) => sum + block.tasks.filter((task) => task.done).length, 0);
    const calendarTotal = calendarOccurrences.length;
    const calendarDone = calendarOccurrences.filter(({ event, dateKey }) => getCalendarEventDone(event, dateKey, completionMap)).length;
    const total = taskTotal + calendarTotal;
    const done = taskDone + calendarDone;
    const activeDays = dayMetrics.filter((day) => day.total > 0 || walletTransactionsInRange.some((tx) => tx.date === day.dateKey)).length;
    return { taskTotal, taskDone, calendarTotal, calendarDone, total, done, completion: percent(done, total), activeDays };
  }, [calendarOccurrences, completionMap, dayMetrics, taskBlocksInRange, walletTransactionsInRange]);

  const streak = useMemo(() => {
    let count = 0;
    let cursor = todayKey;
    while (true) {
      const metric = dayMetrics.find((day) => day.dateKey === cursor);
      if (!metric || metric.done <= 0) break;
      count += 1;
      cursor = toDateKey(addDays(fromDateKey(cursor), -1));
    }
    return count;
  }, [dayMetrics, todayKey]);

  const activityStats = useMemo<ActivityMetric[]>(() => {
    const byKey = new Map<string, ActivityMetric>();
    function addMetric(key: string, label: string, iconKey: string, color: CalendarEvent["color"], done: boolean) {
      const current = byKey.get(key) ?? { key, label, iconKey, color, total: 0, done: 0 };
      current.total += 1;
      if (done) current.done += 1;
      byKey.set(key, current);
    }

    taskBlocksInRange.forEach((block) => {
      const type = inferActivityTypeFromIcon(block.icon);
      block.tasks.forEach((task) => addMetric(type.key, type.label, type.iconKey, type.color, task.done));
    });

    calendarOccurrences.forEach(({ event, dateKey }) => {
      const type = inferActivityTypeFromEvent(event);
      addMetric(type.key, type.label, type.iconKey, type.color, getCalendarEventDone(event, dateKey, completionMap));
    });

    return Array.from(byKey.values()).sort((a, b) => b.total - a.total || b.done - a.done).slice(0, 6);
  }, [calendarOccurrences, completionMap, taskBlocksInRange]);

  const routineStats = useMemo(() => {
    return activityStats.filter((item) => item.total >= 2).slice(0, 3);
  }, [activityStats]);

  const walletSummary = useMemo(() => {
    const income = transactionAmountByType(walletTransactionsInRange, "income");
    const extras = transactionAmountByType(walletTransactionsInRange, "extra");
    const expenses = transactionAmountByType(walletTransactionsInRange, "expense");
    const savings = transactionAmountByType(walletTransactionsInRange, "saving");
    const budgetUse = wallet.budgetLimit > 0 ? Math.min(100, Math.round((expenses / wallet.budgetLimit) * 100)) : 0;
    const topGoal = wallet.goals[0] ?? null;
    return { income, extras, expenses, savings, budgetUse, topGoal };
  }, [wallet.budgetLimit, wallet.goals, walletTransactionsInRange]);

  const syncing = tasksSyncing || calendarSyncing || completionSyncStatus === "loading" || walletSyncing;
  const saving = calendarSyncStatus === "saving" || completionSyncStatus === "saving" || walletSyncStatus === "saving";
  const error = calendarError || completionError || walletError;

  return (
    <AppShell>
      <section className="page-pad pt-7">
        <header className="flex items-center justify-between gap-3">
          <Link href="/today" className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white shadow-card transition active:scale-95" aria-label="Volver a Hoy">
            <ArrowLeft className="h-5 w-5 text-monkey-muted" />
          </Link>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-black uppercase tracking-[.12em] text-monkey-green">Analytics Foundation</p>
            <h1 className="text-2xl font-black tracking-tight">Tus avances</h1>
          </div>
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-white shadow-card">
            <MonkeyAvatar size={34} variant="face" />
          </div>
        </header>

        <section className="mt-5 overflow-hidden rounded-[28px] bg-gradient-to-br from-monkey-green to-monkey-purple p-5 text-white shadow-soft">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-sm font-bold text-white/80">Resumen de {rangeLabel(mode, range.startKey, range.endKey)}</p>
              <h2 className="mt-2 text-[42px] font-black leading-none">{summary.completion}%</h2>
              <p className="mt-2 text-sm font-bold text-white/85">{summary.done} de {summary.total} actividades completadas</p>
            </div>
            <div className="rounded-[24px] bg-white/20 p-3 backdrop-blur">
              <BarChart3 className="h-8 w-8" />
            </div>
          </div>
          <div className="mt-5 h-3 overflow-hidden rounded-full bg-white/25">
            <div className="h-full rounded-full bg-white transition-all" style={{ width: `${summary.completion}%` }} />
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-black">
            <span className="rounded-full bg-white/20 px-3 py-1.5">{syncing ? "Actualizando…" : saving ? "Guardando…" : error ? "Revisar sync" : "Sincronizado"}</span>
            <span className="rounded-full bg-white/20 px-3 py-1.5">{summary.activeDays} días activos</span>
            <span className="rounded-full bg-white/20 px-3 py-1.5">Racha {streak} días</span>
          </div>
        </section>

        <div className="mt-4 grid grid-cols-2 rounded-[22px] bg-gray-100 p-1 text-sm font-black">
          <button type="button" onClick={() => setMode("week")} className={cn("h-11 rounded-[18px] transition active:scale-[.99]", mode === "week" ? "bg-white text-monkey-green shadow-card" : "text-monkey-muted")}>Semana</button>
          <button type="button" onClick={() => setMode("month")} className={cn("h-11 rounded-[18px] transition active:scale-[.99]", mode === "month" ? "bg-white text-monkey-green shadow-card" : "text-monkey-muted")}>Mes</button>
        </div>

        <section className="mt-5 grid grid-cols-2 gap-3">
          <MetricCard icon={<CheckCircle2 className="h-5 w-5" />} label="Completadas" value={summary.done} hint={`${summary.total} en total`} tone="green" />
          <MetricCard icon={<Flame className="h-5 w-5" />} label="Racha" value={`${streak}d`} hint="días seguidos" tone="orange" />
          <MetricCard icon={<CalendarDays className="h-5 w-5" />} label="Calendario" value={summary.calendarDone} hint={`${summary.calendarTotal} actividades`} tone="blue" />
          <MetricCard icon={<Target className="h-5 w-5" />} label="Tareas" value={summary.taskDone} hint={`${summary.taskTotal} checks`} tone="purple" />
        </section>

        <section className="mt-6 rounded-card bg-white p-4 shadow-card">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black">Ritmo por día</h2>
              <p className="text-xs font-bold text-monkey-muted">Completado vs. pendiente</p>
            </div>
            <Sparkles className="h-5 w-5 text-monkey-yellow" />
          </div>
          <div className="flex items-end gap-2 overflow-x-auto pb-1">
            {dayMetrics.map((day) => {
              const value = percent(day.done, day.total);
              return (
                <div key={day.dateKey} className="flex min-w-[42px] flex-col items-center gap-2">
                  <div className="flex h-24 w-8 items-end rounded-full bg-gray-100 p-1">
                    <div className="w-full rounded-full bg-monkey-green transition-all" style={{ height: `${Math.max(value, day.total ? 12 : 4)}%` }} />
                  </div>
                  <span className="text-[10px] font-black uppercase text-monkey-muted">{shortDay(day.dateKey)}</span>
                </div>
              );
            })}
          </div>
        </section>

        <section className="mt-6 rounded-card bg-white p-4 shadow-card">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black">Actividades por tipo</h2>
              <p className="text-xs font-bold text-monkey-muted">Monitos, checks y avance</p>
            </div>
            <Trophy className="h-5 w-5 text-monkey-purple" />
          </div>
          {activityStats.length ? (
            <div className="space-y-3">
              {activityStats.map((item) => (
                <article key={item.key} className="rounded-[22px] border border-gray-100 bg-gray-50 p-3">
                  <div className="flex items-center gap-3">
                    <span className={cn("grid h-12 w-12 place-items-center rounded-[18px]", activityTypePillClass(item.color))}>
                      <AssetThumb icon={item.iconKey} alt={item.label} size={34} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="truncate text-sm font-black">{item.label}</h3>
                        <span className="shrink-0 text-xs font-black text-monkey-muted">{percent(item.done, item.total)}%</span>
                      </div>
                      <div className="mt-2 h-2 overflow-hidden rounded-full bg-white">
                        <div className="h-full rounded-full bg-monkey-green" style={{ width: `${percent(item.done, item.total)}%` }} />
                      </div>
                      <p className="mt-1 text-[11px] font-bold text-monkey-muted">{item.done}/{item.total} completadas</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <EmptyAnalytics title="Aún no hay actividad" body="Cuando completés tareas o calendario, acá van a aparecer tus patrones." />
          )}
        </section>

        <section className="mt-6 rounded-card bg-white p-4 shadow-card">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black">Rutinas constantes</h2>
              <p className="text-xs font-bold text-monkey-muted">Lo que más se repite en este período</p>
            </div>
            <Flame className="h-5 w-5 text-monkey-orange" />
          </div>
          {routineStats.length ? (
            <div className="grid gap-3">
              {routineStats.map((item) => (
                <div key={item.key} className="flex items-center justify-between rounded-[20px] bg-green-50 px-3 py-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <AssetThumb icon={item.iconKey} alt={item.label} size={38} />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-black">{item.label}</p>
                      <p className="text-[11px] font-bold text-monkey-muted">{item.total} veces · {item.done} checks</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-monkey-greenDark">constante</span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyAnalytics title="Sin rutinas repetidas" body="Repetí una actividad dos o más veces para verla como rutina." />
          )}
        </section>

        <section className="mt-6 rounded-card bg-white p-4 shadow-card">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black">Wallet / Budget</h2>
              <p className="text-xs font-bold text-monkey-muted">Resumen financiero del período</p>
            </div>
            <WalletCards className="h-5 w-5 text-monkey-green" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            {(["income", "extra", "expense", "saving"] as WalletTransactionType[]).map((type) => (
              <div key={type} className={cn("rounded-[20px] p-3", walletTone[type])}>
                <p className="text-[11px] font-black uppercase tracking-[.08em] opacity-70">{walletTypeLabels[type]}</p>
                <p className="mt-1 text-sm font-black">{money(transactionAmountByType(walletTransactionsInRange, type), wallet.currency)}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-[22px] bg-gray-50 p-3">
            <div className="flex items-center justify-between text-xs font-black">
              <span>Uso de presupuesto</span>
              <span>{walletSummary.budgetUse}%</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-white">
              <div className="h-full rounded-full bg-monkey-pink" style={{ width: `${walletSummary.budgetUse}%` }} />
            </div>
          </div>
          {walletSummary.topGoal ? (
            <div className="mt-3 flex items-center gap-3 rounded-[22px] bg-purple-50 p-3">
              <PiggyBank className="h-5 w-5 shrink-0 text-purple-700" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-black">Meta: {walletSummary.topGoal.title}</p>
                <p className="text-[11px] font-bold text-monkey-muted">{money(walletSummary.topGoal.current, walletSummary.topGoal.currency)} de {money(walletSummary.topGoal.target, walletSummary.topGoal.currency)}</p>
              </div>
            </div>
          ) : null}
        </section>

        <section className="mt-6 rounded-[28px] border border-dashed border-monkey-purple/30 bg-purple-50 p-4">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-[20px] bg-white text-monkey-purple shadow-card"><Trophy className="h-5 w-5" /></div>
            <div className="min-w-0">
              <h2 className="text-base font-black">Logros y medallas</h2>
              <p className="text-xs font-bold text-monkey-muted">Base lista para desbloquear premios por racha, ahorro y rutinas.</p>
            </div>
          </div>
        </section>
      </section>
    </AppShell>
  );
}

function MetricCard({ icon, label, value, hint, tone }: { icon: React.ReactNode; label: string; value: React.ReactNode; hint: string; tone: "green" | "orange" | "blue" | "purple" }) {
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
      <p className="mt-1 text-2xl font-black">{value}</p>
      <p className="text-xs font-bold text-monkey-muted">{hint}</p>
    </article>
  );
}

function EmptyAnalytics({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-[22px] bg-gray-50 p-4 text-center">
      <p className="text-sm font-black">{title}</p>
      <p className="mt-1 text-xs font-bold text-monkey-muted">{body}</p>
    </div>
  );
}
