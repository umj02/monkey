"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  ArrowUpRight,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  CheckSquare2,
  Flame,
  PiggyBank,
  Plus,
  Sparkles,
  Target,
  Trophy,
  WalletCards,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { AssetThumb } from "@/components/asset-thumb";
import { MonkeyAvatar } from "@/components/monkey-avatar";
import { useTasks } from "@/hooks/use-tasks";
import { useCalendarEvents } from "@/hooks/use-calendar-events";
import { useCalendarCompletions } from "@/hooks/use-calendar-completions";
import { useCalendarOverrides } from "@/hooks/use-calendar-overrides";
import { useWallet } from "@/hooks/use-wallet";
import { useProfile } from "@/hooks/use-profile";
import { buildAchievements } from "@/lib/achievements";
import { activityTypePillClass, inferActivityTypeFromEvent, inferActivityTypeFromIcon } from "@/lib/activity-types";
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

function fullDayLabel(dateKey: string) {
  return fromDateKey(dateKey).toLocaleDateString("es-CR", { weekday: "long", day: "numeric", month: "short" });
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
  const { profile } = useProfile();
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
    const net = income + extras - expenses - savings;
    return { income, extras, expenses, savings, budgetUse, topGoal, net };
  }, [wallet.budgetLimit, wallet.goals, walletTransactionsInRange]);

  const bestDay = useMemo(() => {
    return [...dayMetrics]
      .filter((day) => day.total > 0)
      .sort((a, b) => percent(b.done, b.total) - percent(a.done, a.total) || b.done - a.done)[0] ?? null;
  }, [dayMetrics]);

  const syncing = tasksSyncing || calendarSyncing || completionSyncStatus === "loading" || walletSyncing;
  const saving = calendarSyncStatus === "saving" || completionSyncStatus === "saving" || walletSyncStatus === "saving";
  const error = calendarError || completionError || walletError;
  const hasActivityData = summary.total > 0;
  const hasWalletData = walletTransactionsInRange.length > 0 || wallet.budgetLimit > 0 || wallet.goals.length > 0;
  const hasReportData = hasActivityData || hasWalletData;
  const topActivity = activityStats[0] ?? null;
  const achievementResult = useMemo(() => buildAchievements({
    blocks,
    events,
    completionMap,
    wallet,
    hasCompletedOnboarding: profile.hasCompletedOnboarding,
    todayKey,
  }), [blocks, completionMap, events, profile.hasCompletedOnboarding, todayKey, wallet]);

  return (
    <AppShell>
      <section className="page-pad pt-7">
        <header className="flex items-center justify-between gap-3">
          <Link href="/today" className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white shadow-card transition active:scale-95" aria-label="Volver a Hoy">
            <ArrowLeft className="h-5 w-5 text-monkey-muted" />
          </Link>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-black uppercase tracking-[.12em] text-monkey-green">Analytics</p>
            <h1 className="text-2xl font-black tracking-tight">Tus avances</h1>
          </div>
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-white shadow-card">
            <MonkeyAvatar size={34} variant="face" />
          </div>
        </header>

        <section className="mt-5 overflow-hidden rounded-[30px] bg-gradient-to-br from-monkey-green via-monkey-greenDark to-monkey-purple p-5 text-white shadow-soft">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-sm font-bold text-white/80">{hasReportData ? `Resumen de ${rangeLabel(mode, range.startKey, range.endKey)}` : "Tu primer reporte está listo"}</p>
              <h2 className="mt-2 text-[42px] font-black leading-none">{summary.completion}%</h2>
              <p className="mt-2 text-sm font-bold text-white/85">
                {hasActivityData ? `${summary.done} de ${summary.total} actividades completadas` : "Agregá checks o actividades para empezar a medir tu semana."}
              </p>
            </div>
            <div className="rounded-[24px] bg-white/20 p-3 backdrop-blur">
              <BarChart3 className="h-8 w-8" />
            </div>
          </div>
          <div className="mt-5 h-3 overflow-hidden rounded-full bg-white/25" aria-label={`Progreso ${summary.completion}%`}>
            <div className="h-full rounded-full bg-white transition-all" style={{ width: `${summary.completion}%` }} />
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-black">
            <StatusPill syncing={syncing} saving={saving} error={Boolean(error)} />
            <span className="rounded-full bg-white/20 px-3 py-1.5">{summary.activeDays} días activos</span>
            <span className="rounded-full bg-white/20 px-3 py-1.5">Racha {streak} días</span>
          </div>
        </section>

        {error ? <SyncWarning message={error} /> : null}

        {!hasReportData ? (
          <section className="mt-5 rounded-[28px] border border-monkey-green/15 bg-white p-4 shadow-card">
            <div className="flex items-start gap-3">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-[20px] bg-green-50 text-monkey-greenDark">
                <Sparkles className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-base font-black">Empezá con 1 acción</h2>
                <p className="mt-1 text-xs font-bold leading-relaxed text-monkey-muted">
                  Analytics se llena solo cuando usás Hoy, Calendario o Wallet. No hay datos inventados: todo sale de tus checks reales.
                </p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center text-[11px] font-black">
              <QuickLink href="/today" icon={<CheckSquare2 className="h-4 w-4" />} label="Hoy" />
              <QuickLink href="/calendar" icon={<CalendarDays className="h-4 w-4" />} label="Calendario" />
              <QuickLink href="/wallet" icon={<WalletCards className="h-4 w-4" />} label="Wallet" />
            </div>
          </section>
        ) : null}

        <div className="mt-4 grid grid-cols-2 rounded-[22px] bg-gray-100 p-1 text-sm font-black" role="tablist" aria-label="Rango de analítica">
          <button type="button" onClick={() => setMode("week")} className={cn("h-11 rounded-[18px] transition active:scale-[.99]", mode === "week" ? "bg-white text-monkey-green shadow-card" : "text-monkey-muted")} aria-pressed={mode === "week"}>Semana</button>
          <button type="button" onClick={() => setMode("month")} className={cn("h-11 rounded-[18px] transition active:scale-[.99]", mode === "month" ? "bg-white text-monkey-green shadow-card" : "text-monkey-muted")} aria-pressed={mode === "month"}>Mes</button>
        </div>

        <section className="mt-5 grid grid-cols-2 gap-3">
          <MetricCard icon={<CheckCircle2 className="h-5 w-5" />} label="Completadas" value={summary.done} hint={summary.total ? `${summary.total} en total` : "sin checks aún"} tone="green" />
          <MetricCard icon={<Flame className="h-5 w-5" />} label="Racha" value={`${streak}d`} hint={streak ? "días seguidos" : "empezá hoy"} tone="orange" />
          <MetricCard icon={<CalendarDays className="h-5 w-5" />} label="Calendario" value={summary.calendarDone} hint={summary.calendarTotal ? `${summary.calendarTotal} actividades` : "sin actividades"} tone="blue" />
          <MetricCard icon={<Target className="h-5 w-5" />} label="Tareas" value={summary.taskDone} hint={summary.taskTotal ? `${summary.taskTotal} checks` : "sin tareas"} tone="purple" />
        </section>

        <section className="mt-5 grid gap-3">
          <InsightCard icon={<CalendarDays className="h-5 w-5" />} label="Mejor día" value={bestDay ? fullDayLabel(bestDay.dateKey) : "Pendiente"} hint={bestDay ? `${bestDay.done}/${bestDay.total} completadas` : "Completá algo para calcularlo"} />
          <InsightCard icon={<Trophy className="h-5 w-5" />} label="Actividad top" value={topActivity?.label ?? "Pendiente"} hint={topActivity ? `${topActivity.total} registros en el período` : "Aparece cuando tengas actividad"} />
          <InsightCard icon={<PiggyBank className="h-5 w-5" />} label="Balance período" value={hasWalletData ? money(walletSummary.net, wallet.currency) : "Sin datos"} hint={wallet.budgetLimit ? `Presupuesto usado ${walletSummary.budgetUse}%` : "Agregá ingresos o gastos"} />
        </section>

        <section className="mt-6 rounded-card bg-white p-4 shadow-card">
          <SectionTitle title="Ritmo por día" subtitle="Completado vs. pendiente" icon={<Sparkles className="h-5 w-5 text-monkey-yellow" />} />
          {hasActivityData ? (
            <div className="flex items-end gap-2 overflow-x-auto pb-1">
              {dayMetrics.map((day) => {
                const value = percent(day.done, day.total);
                return (
                  <div key={day.dateKey} className="flex min-w-[42px] flex-col items-center gap-2">
                    <div className="flex h-24 w-8 items-end rounded-full bg-gray-100 p-1" title={`${day.done}/${day.total}`}>
                      <div className={cn("w-full rounded-full transition-all", day.done ? "bg-monkey-green" : "bg-gray-300")} style={{ height: `${Math.max(value, day.total ? 12 : 4)}%` }} />
                    </div>
                    <span className="text-[10px] font-black uppercase text-monkey-muted">{shortDay(day.dateKey)}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyAnalytics title="Sin ritmo todavía" body="Cuando marques tareas o calendario, acá vas a ver qué días se movieron más." actionHref="/today" actionLabel="Crear primer check" />
          )}
        </section>

        <section className="mt-6 rounded-card bg-white p-4 shadow-card">
          <SectionTitle title="Actividades por tipo" subtitle="Monitos, checks y avance" icon={<Trophy className="h-5 w-5 text-monkey-purple" />} />
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
            <EmptyAnalytics title="Aún no hay actividad" body="Completá tareas o eventos para que aparezcan tus patrones por tipo." actionHref="/calendar" actionLabel="Planear actividad" />
          )}
        </section>

        <section className="mt-6 rounded-card bg-white p-4 shadow-card">
          <SectionTitle title="Rutinas constantes" subtitle="Lo que más se repite en este período" icon={<Flame className="h-5 w-5 text-monkey-orange" />} />
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
            <EmptyAnalytics title="Sin rutinas repetidas" body="Repetí una actividad dos o más veces para verla como rutina." actionHref="/today" actionLabel="Ir a Hoy" />
          )}
        </section>

        <section className="mt-6 rounded-card bg-white p-4 shadow-card">
          <SectionTitle title="Wallet / Budget" subtitle="Resumen financiero del período" icon={<WalletCards className="h-5 w-5 text-monkey-green" />} />
          {hasWalletData ? (
            <>
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
                {!wallet.budgetLimit ? <p className="mt-2 text-[11px] font-bold text-monkey-muted">Definí un presupuesto para ver este indicador con más detalle.</p> : null}
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
            </>
          ) : (
            <EmptyAnalytics title="Wallet sin movimientos" body="Agregá ingresos, gastos o una meta para ver tu resumen financiero." actionHref="/wallet" actionLabel="Abrir Wallet" />
          )}
        </section>

        <section className="mt-6 rounded-card bg-white p-4 shadow-card">
          <SectionTitle title="Fuentes del reporte" subtitle="De dónde salen estos números" icon={<BarChart3 className="h-5 w-5 text-sky-700" />} />
          <div className="grid gap-2 text-xs font-bold text-monkey-muted">
            <SourceRow label="Hoy" value={`${summary.taskTotal} checks`} status={tasksSyncing ? "Actualizando" : "OK"} />
            <SourceRow label="Calendario" value={`${summary.calendarTotal} actividades`} status={calendarError ? "Revisar" : calendarSyncing ? "Actualizando" : "OK"} />
            <SourceRow label="Wallet" value={`${walletTransactionsInRange.length} movimientos`} status={walletError ? "Revisar" : walletSyncing ? "Actualizando" : "OK"} />
          </div>
        </section>

        <section className="mt-6 rounded-[28px] border border-monkey-purple/20 bg-purple-50 p-4">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-[20px] bg-white text-monkey-purple shadow-card"><Trophy className="h-5 w-5" /></div>
            <div className="min-w-0 flex-1">
              <h2 className="text-base font-black">Logros y medallas</h2>
              <p className="text-xs font-bold text-monkey-muted">
                {achievementResult.unlockedCount}/{achievementResult.totalCount} medallas desbloqueadas · {achievementResult.completion}% del tablero.
              </p>
            </div>
            <Link href="/achievements" className="shrink-0 rounded-full bg-white px-3 py-2 text-[11px] font-black text-monkey-purple shadow-card transition active:scale-95">
              Ver
            </Link>
          </div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-white">
            <div className="h-full rounded-full bg-monkey-purple" style={{ width: `${achievementResult.completion}%` }} />
          </div>
          {achievementResult.nextAchievement ? (
            <p className="mt-2 text-[11px] font-bold text-monkey-muted">
              Próximo: <span className="font-black text-monkey-purple">{achievementResult.nextAchievement.title}</span> · {achievementResult.nextAchievement.helper}
            </p>
          ) : (
            <p className="mt-2 text-[11px] font-bold text-monkey-muted">¡Tablero base completo!</p>
          )}
        </section>
      </section>
    </AppShell>
  );
}

function StatusPill({ syncing, saving, error }: { syncing: boolean; saving: boolean; error: boolean }) {
  const label = syncing ? "Actualizando…" : saving ? "Guardando…" : error ? "Revisar sync" : "Sincronizado";
  return <span className="rounded-full bg-white/20 px-3 py-1.5">{label}</span>;
}

function SyncWarning({ message }: { message: string }) {
  return (
    <div className="mt-4 flex items-start gap-3 rounded-[22px] border border-orange-100 bg-orange-50 p-3 text-orange-800">
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
      <p className="text-xs font-bold leading-relaxed">{message}</p>
    </div>
  );
}

function QuickLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link href={href} className="flex flex-col items-center justify-center gap-1 rounded-[18px] bg-gray-50 px-2 py-3 text-monkey-muted transition active:scale-95">
      {icon}
      <span>{label}</span>
    </Link>
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

function InsightCard({ icon, label, value, hint }: { icon: React.ReactNode; label: string; value: string; hint: string }) {
  return (
    <article className="flex items-center gap-3 rounded-[24px] bg-white p-3 shadow-card">
      <div className="grid h-11 w-11 shrink-0 place-items-center rounded-[18px] bg-gray-50 text-monkey-greenDark">{icon}</div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-black uppercase tracking-[.08em] text-monkey-muted">{label}</p>
        <p className="truncate text-sm font-black">{value}</p>
        <p className="truncate text-[11px] font-bold text-monkey-muted">{hint}</p>
      </div>
    </article>
  );
}

function EmptyAnalytics({ title, body, actionHref, actionLabel }: { title: string; body: string; actionHref?: string; actionLabel?: string }) {
  return (
    <div className="rounded-[22px] bg-gray-50 p-4 text-center">
      <div className="mx-auto grid h-11 w-11 place-items-center rounded-[18px] bg-white text-monkey-greenDark shadow-card">
        <Plus className="h-5 w-5" />
      </div>
      <p className="mt-3 text-sm font-black">{title}</p>
      <p className="mx-auto mt-1 max-w-[260px] text-xs font-bold leading-relaxed text-monkey-muted">{body}</p>
      {actionHref && actionLabel ? (
        <Link href={actionHref} className="mx-auto mt-3 inline-flex items-center gap-1 rounded-full bg-white px-4 py-2 text-xs font-black text-monkey-greenDark shadow-card transition active:scale-95">
          {actionLabel}
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      ) : null}
    </div>
  );
}

function SourceRow({ label, value, status }: { label: string; value: string; status: "OK" | "Actualizando" | "Revisar" }) {
  const statusClass = status === "OK" ? "bg-green-50 text-monkey-greenDark" : status === "Revisar" ? "bg-orange-50 text-orange-700" : "bg-sky-50 text-sky-700";
  return (
    <div className="flex items-center justify-between gap-3 rounded-[18px] bg-gray-50 px-3 py-2">
      <span className="min-w-0 flex-1 truncate">{label} · {value}</span>
      <span className={cn("shrink-0 rounded-full px-2.5 py-1 text-[10px] font-black", statusClass)}>{status}</span>
    </div>
  );
}
