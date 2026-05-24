"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Ban,
  ArrowLeft,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Copy,
  Eye,
  EyeOff,
  Flame,
  KeyRound,
  Loader2,
  LockKeyhole,
  PiggyBank,
  RefreshCw,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Trophy,
  WalletCards,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { MonkeyAvatar } from "@/components/monkey-avatar";
import { Toast, type ToastState } from "@/components/toast";
import { useCalendarCompletions } from "@/hooks/use-calendar-completions";
import { useCalendarEvents } from "@/hooks/use-calendar-events";
import { useCalendarOverrides } from "@/hooks/use-calendar-overrides";
import { usePersistentAchievements } from "@/hooks/use-persistent-achievements";
import { useProfile } from "@/hooks/use-profile";
import { useTasks } from "@/hooks/use-tasks";
import { useWallet } from "@/hooks/use-wallet";
import { buildAchievements } from "@/lib/achievements";
import { applyCalendarOverridesForDate, getCalendarEventDone, toDateKey } from "@/lib/calendar/calendar-utils";
import { getRewardMedalIcon, getRewardTrophyIcon } from "@/lib/reward-media";
import { createGuardianShareToken, fetchGuardianShareByToken, revokeGuardianShareToken, type SecureGuardianShareRecord } from "@/lib/services/guardian-share-service";
import { cn } from "@/lib/utils";
import type { WalletCurrency, WalletTransactionType } from "@/types";

type GuardianDayReport = {
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

type GuardianAchievement = {
  id: string;
  title: string;
  description: string;
  tier: "bronze" | "silver" | "gold" | "special";
};

type GuardianShareVersion = "2.24.0" | "2.24.1" | "2.25.0";

type GuardianVisibleSections = {
  calendar: boolean;
  achievements: boolean;
  bestDay: boolean;
  streak: boolean;
  wallet: boolean;
};

type GuardianSharePayload = {
  version: GuardianShareVersion;
  createdAt: string;
  expiresAt?: string;
  childName: string;
  guardianLabel: string;
  weekLabel: string;
  completion: number;
  taskDone: number;
  taskTotal: number;
  calendarDone: number;
  calendarTotal: number;
  streak: number;
  bestDayLabel: string;
  bestDayScore: number;
  achievementsThisWeek: GuardianAchievement[];
  dayReports: GuardianDayReport[];
  message: string;
  focus: string;
  visibleSections?: GuardianVisibleSections;
  wallet?: {
    currency: WalletCurrency;
    transactions: number;
    income: number;
    expense: number;
    saving: number;
    extra: number;
  };
};

type ActiveSecureGuardianShare = SecureGuardianShareRecord & {
  url: string;
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

function money(value: number, currency: WalletCurrency) {
  return new Intl.NumberFormat("es-CR", { style: "currency", currency }).format(value || 0);
}

function walletTotal(transactions: { type: WalletTransactionType; amount: number }[], type: WalletTransactionType) {
  return transactions.filter((transaction) => transaction.type === type).reduce((sum, transaction) => sum + transaction.amount, 0);
}

function motivationalMessage(completion: number, streak: number, achievementsThisWeek: number) {
  if (completion >= 85) return "Excelente semana: sostuvo buen ritmo, completó actividades y mantuvo un avance muy sólido.";
  if (streak >= 3) return "Buena constancia: la racha muestra que está creando un hábito positivo.";
  if (achievementsThisWeek > 0) return "Hay progreso visible: esta semana desbloqueó nuevas medallas.";
  if (completion >= 45) return "Va avanzando: con una actividad simple al día puede mejorar la próxima semana.";
  return "Semana de arranque: conviene acompañar con metas pequeñas y fáciles de completar.";
}

function focusMessage(completion: number, taskDone: number, calendarDone: number) {
  if (completion >= 75) return "Mantener la rutina actual y revisar calendario al inicio del día.";
  if (calendarDone < taskDone) return "Reforzar actividades programadas del calendario con recordatorios simples.";
  if (taskDone === 0) return "Empezar con un check corto en Hoy para activar el hábito.";
  return "Elegir 1 tarea importante por día y celebrar cada avance completado.";
}

function encodeSharePayload(payload: GuardianSharePayload) {
  const json = JSON.stringify(payload);
  const encoded = typeof window === "undefined" ? "" : window.btoa(unescape(encodeURIComponent(json)));
  return encoded.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function decodeSharePayload(raw: string): GuardianSharePayload | null {
  try {
    const padded = raw.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((raw.length + 3) % 4);
    const json = decodeURIComponent(escape(window.atob(padded)));
    const parsed = JSON.parse(json) as GuardianSharePayload;
    if (!parsed || !["2.24.0", "2.24.1", "2.25.0"].includes(parsed.version)) return null;
    return parsed;
  } catch {
    return null;
  }
}


function defaultVisibleSections(payload?: GuardianSharePayload): GuardianVisibleSections {
  return payload?.visibleSections ?? {
    calendar: true,
    achievements: true,
    bestDay: true,
    streak: true,
    wallet: Boolean(payload?.wallet),
  };
}

function isShareExpired(payload: GuardianSharePayload) {
  if (!payload.expiresAt) return false;
  return new Date(payload.expiresAt).getTime() < Date.now();
}

function maskDayReports(dayReports: GuardianDayReport[], visibleSections: GuardianVisibleSections) {
  return dayReports.map((day) => ({
    ...day,
    calendarTotal: visibleSections.calendar ? day.calendarTotal : 0,
    calendarDone: visibleSections.calendar ? day.calendarDone : 0,
    walletCount: visibleSections.wallet ? day.walletCount : 0,
    achievementCount: visibleSections.achievements ? day.achievementCount : 0,
    score: day.tasksDone + (visibleSections.calendar ? day.calendarDone : 0) + (visibleSections.wallet ? day.walletCount : 0) + (visibleSections.achievements ? day.achievementCount : 0),
  }));
}

function shareExpirationLabel(payload: GuardianSharePayload) {
  if (!payload.expiresAt) return "Sin expiración";
  return new Intl.DateTimeFormat("es-CR", { dateStyle: "medium" }).format(new Date(payload.expiresAt));
}

export default function GuardianSharePage() {
  const [sharedPayload, setSharedPayload] = useState<GuardianSharePayload | null>(null);
  const [invalidShare, setInvalidShare] = useState(false);
  const [revokedShare, setRevokedShare] = useState(false);
  const [shareChecked, setShareChecked] = useState(false);

  useEffect(() => {
    let active = true;

    async function readShare() {
      const params = new URLSearchParams(window.location.search);
      const token = params.get("token");
      const legacyRaw = params.get("share");

      if (token) {
        const result = await fetchGuardianShareByToken<GuardianSharePayload>(token);
        if (!active) return;
        if (!result?.payload) {
          setInvalidShare(true);
        } else if (result.status === "revoked") {
          setRevokedShare(true);
        } else {
          setSharedPayload({ ...result.payload, expiresAt: result.expiresAt || result.payload.expiresAt });
        }
        setShareChecked(true);
        return;
      }

      if (legacyRaw) {
        const decoded = decodeSharePayload(legacyRaw);
        if (decoded) setSharedPayload(decoded);
        else setInvalidShare(true);
      }
      setShareChecked(true);
    }

    readShare();
    return () => { active = false; };
  }, []);

  if (!shareChecked) {
    return (
      <main className="app-screen grid place-items-center px-6 text-center">
        <div>
          <div className="mx-auto h-14 w-14 animate-pulse rounded-full bg-monkey-green/20" />
          <p className="mt-4 text-sm font-bold text-monkey-muted">Preparando vista compartida...</p>
        </div>
      </main>
    );
  }

  if (invalidShare) return <GuardianInvalidShareView />;
  if (revokedShare) return <GuardianRevokedShareView />;
  if (sharedPayload) {
    if (isShareExpired(sharedPayload)) return <GuardianExpiredShareView payload={sharedPayload} />;
    return <GuardianPublicView payload={sharedPayload} />;
  }
  return <GuardianShareBuilder />;
}

function GuardianShareBuilder() {
  const todayKey = useMemo(() => toDateKey(new Date()), []);
  const weekDays = useMemo(() => Array.from({ length: 7 }, (_, index) => toDateKey(addDays(new Date(), index - 6))), []);
  const weekSet = useMemo(() => new Set(weekDays), [weekDays]);
  const { profile } = useProfile();
  const { blocks, syncing: tasksSyncing } = useTasks();
  const { events, syncing: calendarSyncing } = useCalendarEvents();
  const { overrides } = useCalendarOverrides();
  const { completionMap, syncStatus: completionSyncStatus } = useCalendarCompletions();
  const { wallet, syncing: walletSyncing } = useWallet();
  const [guardianLabel, setGuardianLabel] = useState("Encargado/a");
  const [childAlias, setChildAlias] = useState(profile.name || "Monkey user");
  const [includeWallet, setIncludeWallet] = useState(false);
  const [includeCalendar, setIncludeCalendar] = useState(true);
  const [includeAchievements, setIncludeAchievements] = useState(true);
  const [includeBestDay, setIncludeBestDay] = useState(true);
  const [includeStreak, setIncludeStreak] = useState(true);
  const [expiresInDays, setExpiresInDays] = useState<7 | 14 | 30>(14);
  const [generatedLink, setGeneratedLink] = useState("");
  const [shareSaving, setShareSaving] = useState(false);
  const [activeShare, setActiveShare] = useState<ActiveSecureGuardianShare | null>(null);
  const [toast, setToast] = useState<ToastState>(null);

  useEffect(() => {
    setChildAlias(profile.name || "Monkey user");
  }, [profile.name]);

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

  const dayReports = useMemo<GuardianDayReport[]>(() => weekDays.map((dateKey) => {
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

  const syncing = tasksSyncing || calendarSyncing || completionSyncStatus === "loading" || walletSyncing || achievementSyncStatus === "loading";
  const visibleSections = useMemo<GuardianVisibleSections>(() => ({
    calendar: includeCalendar,
    achievements: includeAchievements,
    bestDay: includeBestDay,
    streak: includeStreak,
    wallet: includeWallet,
  }), [includeAchievements, includeBestDay, includeCalendar, includeStreak, includeWallet]);
  const message = motivationalMessage(totals.completion, achievementResult.stats.streak, achievementsThisWeek.length);
  const focus = focusMessage(totals.completion, totals.taskDone, totals.calendarDone);

  const payload = useMemo<GuardianSharePayload>(() => {
    const expiresAt = addDays(new Date(), expiresInDays).toISOString();
    const maskedDayReports = maskDayReports(dayReports, visibleSections);
    return {
    version: "2.25.0",
    createdAt: new Date().toISOString(),
    expiresAt,
    childName: childAlias.trim() || "Monkey user",
    guardianLabel: guardianLabel.trim() || "Encargado/a",
    weekLabel: `${formatDay(weekDays[0])} - ${formatDay(weekDays[6])}`,
    completion: totals.completion,
    taskDone: totals.taskDone,
    taskTotal: totals.taskTotal,
    calendarDone: includeCalendar ? totals.calendarDone : 0,
    calendarTotal: includeCalendar ? totals.calendarTotal : 0,
    streak: includeStreak ? achievementResult.stats.streak : 0,
    bestDayLabel: includeBestDay && totals.bestDay?.score ? totals.bestDay.shortLabel : "Oculto",
    bestDayScore: includeBestDay ? (totals.bestDay?.score ?? 0) : 0,
    achievementsThisWeek: includeAchievements ? achievementsThisWeek.slice(0, 6).map((achievement) => ({
      id: achievement.id,
      title: achievement.title,
      description: achievement.description,
      tier: achievement.tier,
    })) : [],
    dayReports: maskedDayReports,
    message,
    focus,
    visibleSections,
    wallet: includeWallet ? {
      currency: wallet.currency,
      transactions: walletTransactionsThisWeek.length,
      income: walletSummary.income,
      expense: walletSummary.expense,
      saving: walletSummary.saving,
      extra: walletSummary.extra,
    } : undefined,
    };
  }, [achievementResult.stats.streak, achievementsThisWeek, childAlias, dayReports, expiresInDays, focus, guardianLabel, includeAchievements, includeBestDay, includeCalendar, includeStreak, includeWallet, message, totals.bestDay?.score, totals.bestDay?.shortLabel, totals.calendarDone, totals.calendarTotal, totals.completion, totals.taskDone, totals.taskTotal, visibleSections, wallet.currency, walletSummary.expense, walletSummary.extra, walletSummary.income, walletSummary.saving, walletTransactionsThisWeek.length, weekDays]);

  useEffect(() => {
    setGeneratedLink("");
    setActiveShare(null);
  }, [payload]);

  function notify(messageText: string, type: "success" | "error" = "success") {
    setToast({ message: messageText, type });
    window.setTimeout(() => setToast(null), 2400);
  }

  async function generateLink() {
    setShareSaving(true);
    const secureRecord = await createGuardianShareToken(payload as unknown as Record<string, unknown>, {
      childAlias: payload.childName,
      guardianLabel: payload.guardianLabel,
      expiresAt: payload.expiresAt || addDays(new Date(), expiresInDays).toISOString(),
      includeCalendar,
      includeAchievements,
      includeBestDay,
      includeStreak,
      includeWallet,
    });
    setShareSaving(false);

    if (!secureRecord) {
      notify("No pudimos guardar el link seguro. Revisá tu sesión e intentá de nuevo.", "error");
      return "";
    }

    const link = `${window.location.origin}/guardian-share?token=${secureRecord.token}`;
    setGeneratedLink(link);
    setActiveShare({ ...secureRecord, url: link });
    notify(generatedLink ? "Token seguro actualizado" : "Token seguro generado");
    return link;
  }

  async function copyLink() {
    const link = generatedLink || await generateLink();
    if (!link) return;
    try {
      await navigator.clipboard.writeText(link);
      notify("Link seguro copiado");
    } catch {
      notify("No se pudo copiar. Seleccioná el link manualmente.", "error");
    }
  }

  async function revokeActiveLink() {
    if (!activeShare?.id) return;
    setShareSaving(true);
    const ok = await revokeGuardianShareToken(activeShare.id);
    setShareSaving(false);
    if (!ok) {
      notify("No se pudo desactivar el link.", "error");
      return;
    }
    setGeneratedLink("");
    setActiveShare(null);
    notify("Link desactivado");
  }

  return (
    <AppShell>
      <Toast toast={toast} onClose={() => setToast(null)} />
      <section className="page-pad pt-7 pb-8">
        <header className="flex items-center justify-between gap-3">
          <Link href="/weekly-summary" className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white shadow-card transition active:scale-95" aria-label="Volver a resumen semanal">
            <ArrowLeft className="h-5 w-5 text-monkey-muted" />
          </Link>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-black uppercase tracking-[.12em] text-monkey-greenDark">Vista familiar</p>
            <h1 className="text-2xl font-black tracking-tight">Compartir progreso</h1>
          </div>
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-white shadow-card">
            <ShieldCheck className="h-6 w-6 text-monkey-green" />
          </div>
        </header>

        <section className="mt-5 overflow-hidden rounded-[34px] bg-gradient-to-br from-monkey-green via-monkey-greenDark to-monkey-purple p-5 text-white shadow-soft">
          <div className="flex items-end gap-4">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-white/80">Reporte seguro de 7 días</p>
              <h2 className="mt-2 text-[40px] font-black leading-none">{totals.completion}%</h2>
              <p className="mt-2 text-sm font-bold leading-relaxed text-white/85">Generá una vista compacta de solo lectura con link seguro, sin exponer login ni edición.</p>
            </div>
            <div className="hidden w-24 shrink-0 sm:block"><MonkeyAvatar size={88} variant="face" /></div>
          </div>
          <div className="mt-5 h-3 overflow-hidden rounded-full bg-white/25"><div className="h-full rounded-full bg-white" style={{ width: `${totals.completion}%` }} /></div>
          <div className="mt-4 flex flex-wrap gap-2 text-xs font-black">
            <span className="rounded-full bg-white/20 px-3 py-1.5">{syncing ? "Actualizando…" : "Sincronizado"}</span>
            <span className="rounded-full bg-white/20 px-3 py-1.5">Solo lectura</span>
            <span className="rounded-full bg-white/20 px-3 py-1.5">Link seguro</span>
          </div>
        </section>

        <section className="mt-5 rounded-card bg-white p-4 shadow-card">
          <SectionTitle title="Datos que verá el encargado" subtitle="Controlá el nombre visible y el resumen compartido" icon={<LockKeyhole className="h-5 w-5 text-monkey-greenDark" />} />
          <div className="grid gap-3">
            <label className="block">
              <span className="text-xs font-black uppercase tracking-[.08em] text-monkey-muted">Nombre visible</span>
              <input value={childAlias} onChange={(event) => setChildAlias(event.target.value)} className="mt-2 h-12 w-full rounded-[18px] border border-gray-100 bg-gray-50 px-4 text-sm font-bold outline-none focus:border-monkey-green" placeholder="Nombre o alias" />
            </label>
            <label className="block">
              <span className="text-xs font-black uppercase tracking-[.08em] text-monkey-muted">Para</span>
              <input value={guardianLabel} onChange={(event) => setGuardianLabel(event.target.value)} className="mt-2 h-12 w-full rounded-[18px] border border-gray-100 bg-gray-50 px-4 text-sm font-bold outline-none focus:border-monkey-green" placeholder="Mamá, Papá, Encargado/a" />
            </label>
            <div className="rounded-[24px] border border-gray-100 bg-gray-50 p-3">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-black uppercase tracking-[.08em] text-monkey-muted">Privacidad del reporte</p>
                  <p className="text-xs font-bold leading-relaxed text-monkey-muted">Elegí qué verá el encargado en el link.</p>
                </div>
                <SlidersHorizontal className="h-5 w-5 shrink-0 text-monkey-greenDark" />
              </div>
              <div className="grid gap-2">
                <PrivacyToggle label="Calendario" checked={includeCalendar} onClick={() => setIncludeCalendar((value) => !value)} />
                <PrivacyToggle label="Logros y medallas" checked={includeAchievements} onClick={() => setIncludeAchievements((value) => !value)} />
                <PrivacyToggle label="Mejor día" checked={includeBestDay} onClick={() => setIncludeBestDay((value) => !value)} />
                <PrivacyToggle label="Racha" checked={includeStreak} onClick={() => setIncludeStreak((value) => !value)} />
                <PrivacyToggle label="Wallet" checked={includeWallet} onClick={() => setIncludeWallet((value) => !value)} />
              </div>
            </div>
            <div className="rounded-[24px] border border-gray-100 bg-gray-50 p-3">
              <p className="text-xs font-black uppercase tracking-[.08em] text-monkey-muted">Expiración</p>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {[7, 14, 30].map((days) => (
                  <button key={days} type="button" onClick={() => setExpiresInDays(days as 7 | 14 | 30)} className={cn("h-10 rounded-full text-xs font-black transition active:scale-95", expiresInDays === days ? "bg-monkey-green text-white shadow-card" : "bg-white text-monkey-greenDark")}>{days} días</button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mt-5 grid grid-cols-2 gap-3">
          <MetricCard icon={<CheckCircle2 className="h-5 w-5" />} label="Checks" value={`${totals.taskDone}/${totals.taskTotal}`} hint="Tareas actuales" tone="green" />
          <MetricCard icon={<CalendarDays className="h-5 w-5" />} label="Calendario" value={includeCalendar ? `${totals.calendarDone}/${totals.calendarTotal}` : "Oculto"} hint="Actividades" tone="blue" />
          <MetricCard icon={<Trophy className="h-5 w-5" />} label="Medallas" value={includeAchievements ? String(achievementsThisWeek.length) : "Oculto"} hint="Esta semana" tone="purple" />
          <MetricCard icon={<Flame className="h-5 w-5" />} label="Racha" value={includeStreak ? `${achievementResult.stats.streak}` : "Oculta"} hint="Días activos" tone="orange" />
        </section>

        <section className="mt-6 rounded-card bg-white p-4 shadow-card">
          <SectionTitle title="Vista previa" subtitle="Así se leerá el reporte compartido" icon={<BarChart3 className="h-5 w-5 text-sky-700" />} />
          <GuardianReportPreview payload={payload} />
        </section>

        <section className="mt-6 rounded-[28px] border border-monkey-green/15 bg-green-50 p-4">
          <div className="flex items-start gap-3">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-[20px] bg-white text-monkey-greenDark shadow-card"><Copy className="h-5 w-5" /></div>
            <div className="min-w-0 flex-1">
              <h2 className="text-base font-black">Link compartible</h2>
              <p className="mt-1 text-xs font-bold leading-relaxed text-monkey-muted">El link usa un código seguro guardado en tu cuenta. El resumen no viaja completo en la URL y podés desactivarlo cuando querás.</p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <button type="button" onClick={generateLink} disabled={shareSaving} className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-monkey-green px-4 text-xs font-black text-white shadow-card transition active:scale-95 disabled:opacity-60">{shareSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}{generatedLink ? "Regenerar" : "Generar"}</button>
                <button type="button" onClick={copyLink} disabled={shareSaving} className="h-11 rounded-full bg-white px-4 text-xs font-black text-monkey-greenDark shadow-card transition active:scale-95 disabled:opacity-60">Copiar</button>
              </div>
              {generatedLink ? (
                <div className="mt-3 rounded-[20px] border border-green-100 bg-white p-3">
                  <div className="mb-2 flex items-center gap-2 text-[11px] font-black text-monkey-greenDark"><Clock3 className="h-3.5 w-3.5" /> Vence el {shareExpirationLabel(payload)}</div>
                  <textarea readOnly value={generatedLink} className="h-24 w-full resize-none rounded-[16px] bg-gray-50 p-3 text-[11px] font-bold leading-relaxed text-monkey-muted outline-none" />
                  {activeShare ? (
                    <button type="button" onClick={revokeActiveLink} disabled={shareSaving} className="mt-2 inline-flex h-10 w-full items-center justify-center gap-2 rounded-full bg-orange-50 px-4 text-xs font-black text-orange-700 transition active:scale-95 disabled:opacity-60">
                      <Ban className="h-4 w-4" />
                      Desactivar este link
                    </button>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>
        </section>
      </section>
    </AppShell>
  );
}

function GuardianPublicView({ payload }: { payload: GuardianSharePayload }) {
  const visibleSections = defaultVisibleSections(payload);
  return (
    <main className="app-screen overflow-y-auto bg-monkey-bg pb-[calc(32px+var(--safe-bottom))]">
      <section className="page-pad pt-7 pb-8">
        <header className="flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-black uppercase tracking-[.12em] text-monkey-greenDark">Monkey Checks</p>
            <h1 className="text-2xl font-black tracking-tight">Progreso compartido</h1>
            <p className="mt-1 text-xs font-bold text-monkey-muted">Para: {payload.guardianLabel}</p>
          </div>
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-white shadow-card"><ShieldCheck className="h-6 w-6 text-monkey-green" /></div>
        </header>

        <section className="mt-5 overflow-hidden rounded-[34px] bg-gradient-to-br from-monkey-green via-monkey-greenDark to-monkey-purple p-5 text-white shadow-soft">
          <div className="flex items-end gap-4">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-white/80">{payload.childName} · {payload.weekLabel}</p>
              <h2 className="mt-2 text-[44px] font-black leading-none">{payload.completion}%</h2>
              <p className="mt-2 text-sm font-bold leading-relaxed text-white/85">{payload.message}</p>
            </div>
            <div className="hidden w-24 shrink-0 sm:block"><MonkeyAvatar size={88} variant="face" /></div>
          </div>
          <div className="mt-5 h-3 overflow-hidden rounded-full bg-white/25"><div className="h-full rounded-full bg-white" style={{ width: `${payload.completion}%` }} /></div>
          <div className="mt-4 flex flex-wrap gap-2 text-xs font-black">
            <span className="rounded-full bg-white/20 px-3 py-1.5">Solo lectura</span>
            {visibleSections.streak ? <span className="rounded-full bg-white/20 px-3 py-1.5">Racha {payload.streak} días</span> : null}
            {visibleSections.achievements ? <span className="rounded-full bg-white/20 px-3 py-1.5">{payload.achievementsThisWeek.length} medallas</span> : null}
          </div>
        </section>

        <section className="mt-5 grid grid-cols-2 gap-3">
          <MetricCard icon={<CheckCircle2 className="h-5 w-5" />} label="Checks" value={`${payload.taskDone}/${payload.taskTotal}`} hint="Tareas actuales" tone="green" />
          {visibleSections.calendar ? <MetricCard icon={<CalendarDays className="h-5 w-5" />} label="Calendario" value={`${payload.calendarDone}/${payload.calendarTotal}`} hint="Actividades" tone="blue" /> : <MetricCard icon={<EyeOff className="h-5 w-5" />} label="Calendario" value="Oculto" hint="Privado" tone="blue" />}
          {visibleSections.achievements ? <MetricCard icon={<Trophy className="h-5 w-5" />} label="Logros" value={String(payload.achievementsThisWeek.length)} hint="Ganados" tone="purple" /> : <MetricCard icon={<EyeOff className="h-5 w-5" />} label="Logros" value="Oculto" hint="Privado" tone="purple" />}
          {visibleSections.bestDay ? <MetricCard icon={<Flame className="h-5 w-5" />} label="Mejor día" value={payload.bestDayLabel} hint={payload.bestDayScore ? `${payload.bestDayScore} avances` : "Pendiente"} tone="orange" /> : <MetricCard icon={<EyeOff className="h-5 w-5" />} label="Mejor día" value="Oculto" hint="Privado" tone="orange" />}
        </section>

        <section className="mt-6 rounded-card bg-white p-4 shadow-card"><GuardianReportPreview payload={payload} /></section>

        {payload.wallet ? (
          <section className="mt-6 rounded-card bg-white p-4 shadow-card">
            <SectionTitle title="Wallet compartido" subtitle="Resumen financiero opcional" icon={<WalletCards className="h-5 w-5 text-monkey-green" />} />
            <WalletSharedSummary wallet={payload.wallet} />
          </section>
        ) : null}

        <section className="mt-6 rounded-[28px] border border-monkey-green/15 bg-green-50 p-4">
          <div className="flex items-start gap-3">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-[20px] bg-white text-monkey-greenDark shadow-card"><PiggyBank className="h-5 w-5" /></div>
            <div className="min-w-0 flex-1">
              <h2 className="text-base font-black">Siguiente enfoque recomendado</h2>
              <p className="mt-1 text-xs font-bold leading-relaxed text-monkey-muted">{payload.focus}</p>
            </div>
          </div>
        </section>

        <p className="mt-5 text-center text-[11px] font-bold leading-relaxed text-monkey-muted">Reporte generado el {new Intl.DateTimeFormat("es-CR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(payload.createdAt))}. Esta vista no permite editar información ni iniciar sesión. Link seguro activo hasta el {shareExpirationLabel(payload)}.</p>
      </section>
    </main>
  );
}

function GuardianReportPreview({ payload }: { payload: GuardianSharePayload }) {
  const visibleSections = defaultVisibleSections(payload);
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-black">Resumen para {payload.guardianLabel}</h2>
        <p className="mt-1 text-xs font-bold leading-relaxed text-monkey-muted">{payload.childName} · {payload.weekLabel}</p>
      </div>
      <div className="grid gap-3">
        {payload.dayReports.map((day) => <DayRow key={day.key} day={day} maxScore={Math.max(1, ...payload.dayReports.map((item) => item.score))} />)}
      </div>
      <div>
        <SectionTitle title="Medallas de la semana" subtitle="Logros visibles para acompañar el avance" icon={<img src={getRewardTrophyIcon()} alt="Trofeo" className="h-8 w-8 object-contain" />} />
        {!visibleSections.achievements ? (
          <HiddenSectionCard title="Medallas ocultas" description="Este reporte mantiene los logros privados por configuración." />
        ) : payload.achievementsThisWeek.length ? (
          <div className="grid gap-3">
            {payload.achievementsThisWeek.map((achievement) => <AchievementSharedRow key={achievement.id} achievement={achievement} />)}
          </div>
        ) : (
          <div className="rounded-[24px] border border-dashed border-gray-200 bg-gray-50 p-4 text-center">
            <h3 className="text-sm font-black">Sin medallas nuevas</h3>
            <p className="mt-1 text-xs font-bold leading-relaxed text-monkey-muted">Todavía no hay logros desbloqueados en este período.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function WalletSharedSummary({ wallet }: { wallet: NonNullable<GuardianSharePayload["wallet"]> }) {
  const entries: { type: WalletTransactionType; amount: number }[] = [
    { type: "income", amount: wallet.income },
    { type: "extra", amount: wallet.extra },
    { type: "expense", amount: wallet.expense },
    { type: "saving", amount: wallet.saving },
  ];
  return (
    <div className="grid grid-cols-2 gap-3">
      {entries.map(({ type, amount }) => (
        <div key={type} className={cn("rounded-[20px] p-3", walletTone[type])}>
          <p className="text-[11px] font-black uppercase tracking-[.08em] opacity-70">{walletTypeLabels[type]}</p>
          <p className="mt-1 text-sm font-black">{money(amount, wallet.currency)}</p>
        </div>
      ))}
    </div>
  );
}


function PrivacyToggle({ label, checked, onClick }: { label: string; checked: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="flex min-h-11 items-center justify-between rounded-[18px] bg-white px-3 text-left text-xs font-black transition active:scale-[.98]">
      <span className="flex items-center gap-2">
        {checked ? <Eye className="h-4 w-4 text-monkey-green" /> : <EyeOff className="h-4 w-4 text-monkey-muted" />}
        {label}
      </span>
      <span className={cn("rounded-full px-2.5 py-1 text-[10px]", checked ? "bg-green-50 text-monkey-greenDark" : "bg-gray-100 text-monkey-muted")}>{checked ? "Visible" : "Oculto"}</span>
    </button>
  );
}

function HiddenSectionCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-[24px] border border-dashed border-gray-200 bg-gray-50 p-4 text-center">
      <EyeOff className="mx-auto h-5 w-5 text-monkey-muted" />
      <h3 className="mt-2 text-sm font-black">{title}</h3>
      <p className="mt-1 text-xs font-bold leading-relaxed text-monkey-muted">{description}</p>
    </div>
  );
}

function GuardianInvalidShareView() {
  return (
    <main className="app-screen grid place-items-center bg-monkey-bg px-6 text-center">
      <section className="w-full max-w-sm rounded-[34px] bg-white p-6 shadow-soft">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-orange-50 text-orange-700"><AlertTriangle className="h-7 w-7" /></div>
        <h1 className="mt-4 text-xl font-black">Link no válido</h1>
        <p className="mt-2 text-sm font-bold leading-relaxed text-monkey-muted">Este reporte no se pudo leer. Puede estar incompleto o haber sido copiado de forma incorrecta.</p>
        <Link href="/login" className="mt-5 inline-flex h-11 items-center justify-center rounded-full bg-monkey-green px-5 text-xs font-black text-white shadow-card">Ir a Monkey Checks</Link>
      </section>
    </main>
  );
}

function GuardianExpiredShareView({ payload }: { payload: GuardianSharePayload }) {
  return (
    <main className="app-screen grid place-items-center bg-monkey-bg px-6 text-center">
      <section className="w-full max-w-sm rounded-[34px] bg-white p-6 shadow-soft">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-orange-50 text-orange-700"><Clock3 className="h-7 w-7" /></div>
        <h1 className="mt-4 text-xl font-black">Reporte vencido</h1>
        <p className="mt-2 text-sm font-bold leading-relaxed text-monkey-muted">El reporte de {payload.childName} venció el {shareExpirationLabel(payload)}. Pedí un link nuevo para ver el progreso actualizado.</p>
        <Link href="/login" className="mt-5 inline-flex h-11 items-center justify-center rounded-full bg-monkey-green px-5 text-xs font-black text-white shadow-card">Ir a Monkey Checks</Link>
      </section>
    </main>
  );
}


function GuardianRevokedShareView() {
  return (
    <main className="app-screen grid place-items-center bg-monkey-bg px-6 text-center">
      <section className="w-full max-w-sm rounded-[34px] bg-white p-6 shadow-soft">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-orange-50 text-orange-700"><Ban className="h-7 w-7" /></div>
        <h1 className="mt-4 text-xl font-black">Link desactivado</h1>
        <p className="mt-2 text-sm font-bold leading-relaxed text-monkey-muted">Este reporte fue revocado por el usuario. Pedí un link nuevo para ver el progreso actualizado.</p>
        <Link href="/login" className="mt-5 inline-flex h-11 items-center justify-center rounded-full bg-monkey-green px-5 text-xs font-black text-white shadow-card">Ir a Monkey Checks</Link>
      </section>
    </main>
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

function DayRow({ day, maxScore }: { day: GuardianDayReport; maxScore: number }) {
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
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-white"><div className="h-full rounded-full bg-monkey-green" style={{ width: `${width}%` }} /></div>
    </article>
  );
}

function AchievementSharedRow({ achievement }: { achievement: GuardianAchievement }) {
  return (
    <article className="flex items-center gap-3 rounded-[22px] bg-purple-50 p-3">
      <div className="grid h-12 w-12 shrink-0 place-items-center rounded-[18px] bg-white shadow-card"><img src={getRewardMedalIcon(achievement.tier)} alt={achievement.title} className="h-9 w-9 object-contain" /></div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-black">{achievement.title}</p>
        <p className="text-[11px] font-bold text-monkey-muted">{achievement.description}</p>
      </div>
      <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-black text-monkey-purple">Nueva</span>
    </article>
  );
}
