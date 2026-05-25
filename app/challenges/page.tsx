"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Banana, CalendarDays, CheckCircle2, Clock3, Flame, History, LockKeyhole, Plus, RefreshCw, Sparkles, Trophy, XCircle } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { AssetThumb } from "@/components/asset-thumb";
import { Field } from "@/components/field";
import { FormSheet } from "@/components/form-sheet";
import { Toast, type ToastState } from "@/components/toast";
import { useCalendarEvents } from "@/hooks/use-calendar-events";
import { useChallenges } from "@/hooks/use-challenges";
import { buildChallengeDates, calculateChallengeProgress, hydrateChallengeTaskStatuses, nextPendingChallengeTask, PERSONAL_CHALLENGE_TEMPLATES, todayDateKey } from "@/lib/challenges";
import { challengeAssets } from "@/lib/asset-library";
import { createChallengeDraft } from "@/lib/services/challenge-service";
import { cn } from "@/lib/utils";
import type { CalendarEvent, Challenge } from "@/types";

function formatDate(dateKey: string) {
  return new Intl.DateTimeFormat("es-CR", { day: "numeric", month: "short" }).format(new Date(`${dateKey}T00:00:00`));
}

function isValidTime(value: string) {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(value.trim());
}

function cleanTime(value: string) {
  return value.trim();
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 32) || "reto";
}

const REWARD_BANANA_SINGLE = "/assets/rewards/banana-gold.png";
const REWARD_BANANA_BUNCH = "/assets/rewards/banana-bunch-gold.png";
const REWARD_TROPHY_GOLD = "/assets/rewards/trophy-gold.png";
const REWARD_TROPHY_SILVER = "/assets/rewards/trophy-silver.png";
const REWARD_TROPHY_BRONZE = "/assets/rewards/trophy-bronze.png";
const REWARDS_INTRO_DISABLED_KEY = "monkey-rewards-intro-disabled";
const REWARD_ICON_OPTIONS = challengeAssets;

function rewardShares(totalBananas: number, totalChecks: number) {
  const count = Math.max(1, totalChecks);
  const total = Math.max(count, Math.round(totalBananas || count));
  const base = Math.floor(total / count);
  const remainder = total % count;
  return Array.from({ length: count }, (_, index) => base + (index < remainder ? 1 : 0));
}

function rewardShareLabel(shares: number[]) {
  if (!shares.length) return "0 bananas";
  const min = Math.min(...shares);
  const max = Math.max(...shares);
  return min === max ? `${min} banana${min === 1 ? "" : "s"} por check` : `${min}–${max} bananas por check`;
}

function trophyForProgress(progress: ReturnType<typeof calculateChallengeProgress>, claimedAmount = 0) {
  if (progress.completed || claimedAmount >= progress.totalBananas) return REWARD_TROPHY_GOLD;
  if (progress.earnedBananas > 0 || claimedAmount > 0) return REWARD_TROPHY_SILVER;
  return REWARD_TROPHY_BRONZE;
}

function challengeDoneIds(challenge: Challenge, events: CalendarEvent[]) {
  const ids = new Set<string>();
  for (const task of challenge.tasks) {
    const event = events.find((item) => item.id === task.calendarEventId || item.challengeTaskId === task.id);
    if (event?.done) ids.add(task.calendarEventId ?? task.id);
  }
  return ids;
}

export default function ChallengesPage() {
  const { events, createEvent } = useCalendarEvents();
  const { challenges, bananaLedger, summary, syncing, saveChallenge, updateChallenge, claimBananas, refreshChallenges } = useChallenges();
  const [toast, setToast] = useState<ToastState>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [templateId, setTemplateId] = useState(PERSONAL_CHALLENGE_TEMPLATES[0]?.id ?? "agua-3");
  const [builderMode, setBuilderMode] = useState<"suggested" | "custom">("suggested");
  const [days, setDays] = useState("1");
  const [scheduleTimes, setScheduleTimes] = useState<string[]>([PERSONAL_CHALLENGE_TEMPLATES[0]?.defaultTimes[0] ?? "09:00"]);
  const [customTitle, setCustomTitle] = useState("Mi reto personal");
  const [customDescription, setCustomDescription] = useState("Un reto creado por mí para mantener constancia.");
  const [customBananas, setCustomBananas] = useState("5");
  const [customIconKey, setCustomIconKey] = useState("challenge-otro");
  const [creating, setCreating] = useState(false);
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [rewardsIntroEnabled, setRewardsIntroEnabled] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setRewardsIntroEnabled(window.localStorage.getItem(REWARDS_INTRO_DISABLED_KEY) !== "true");
  }, []);

  function toggleRewardsIntro(enabled: boolean) {
    setRewardsIntroEnabled(enabled);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(REWARDS_INTRO_DISABLED_KEY, enabled ? "false" : "true");
    }
  }

  const selectedTemplate = PERSONAL_CHALLENGE_TEMPLATES.find((item) => item.id === templateId) ?? PERSONAL_CHALLENGE_TEMPLATES[0];
  const totalBananas = bananaLedger.reduce((sum, item) => sum + item.amount, 0);
  const activeChallenges = challenges.filter((challenge) => challenge.status === "active" || challenge.status === "expired");
  const completedChallenges = challenges.filter((challenge) => challenge.status === "completed");
  const activeChallengeTitles = useMemo(() => new Set(challenges.filter((challenge) => challenge.status === "active").map((challenge) => challenge.title)), [challenges]);
  const claimableChallenges = useMemo(() => activeChallenges.filter((challenge) => calculateChallengeProgress(challenge, challengeDoneIds(challenge, events)).claimableBananas > 0), [activeChallenges, events]);
  const claimableBananas = claimableChallenges.reduce((sum, challenge) => sum + calculateChallengeProgress(challenge, challengeDoneIds(challenge, events)).claimableBananas, 0);
  const latestBananas = bananaLedger.slice(0, 5);
  const bananaByChallengeId = useMemo(() => new Map(bananaLedger.filter((entry) => entry.sourceType === "challenge").map((entry) => [entry.sourceId, entry.amount])), [bananaLedger]);
  const trackedProgress = useMemo(() => challenges.map((challenge) => ({ challenge, progress: calculateChallengeProgress(challenge, challengeDoneIds(challenge, events)) })), [challenges, events]);
  const lostBananasTotal = trackedProgress.reduce((sum, item) => sum + item.progress.lostBananas, 0);
  const perfectDaysHint = trackedProgress.filter((item) => item.progress.total > 0 && item.progress.completed).length;
  const recentLosses = trackedProgress.filter((item) => item.progress.lostBananas > 0).slice(0, 4);
  const rewardMilestones = useMemo(() => {
    const closed = challenges.filter((challenge) => challenge.status === "completed" || Boolean(challenge.claimedAt)).length;
    const perfect = trackedProgress.filter(({ challenge, progress }) => (challenge.status === "completed" || Boolean(challenge.claimedAt)) && progress.lostBananas === 0 && progress.done > 0).length;
    const partial = trackedProgress.filter(({ challenge, progress }) => (challenge.status === "completed" || Boolean(challenge.claimedAt)) && progress.lostBananas > 0).length;
    return [
      { label: "Primera banana", value: totalBananas >= 1, helper: `${Math.min(totalBananas, 1)}/1`, trophy: REWARD_TROPHY_BRONZE },
      { label: "Primer reto", value: closed >= 1, helper: `${Math.min(closed, 1)}/1`, trophy: REWARD_TROPHY_BRONZE },
      { label: "Reto perfecto", value: perfect >= 1, helper: `${Math.min(perfect, 1)}/1`, trophy: REWARD_TROPHY_GOLD },
      { label: "10 bananas", value: totalBananas >= 10, helper: `${Math.min(totalBananas, 10)}/10`, trophy: REWARD_TROPHY_SILVER },
      { label: "Cierre honesto", value: partial >= 1, helper: `${Math.min(partial, 1)}/1`, trophy: REWARD_TROPHY_SILVER },
    ];
  }, [challenges, totalBananas, trackedProgress]);

  const validScheduleTimes = useMemo(() => {
    const unique = new Set<string>();
    for (const raw of scheduleTimes) {
      const time = cleanTime(raw);
      if (isValidTime(time)) unique.add(time);
    }
    return Array.from(unique);
  }, [scheduleTimes]);

  const builderPreview = useMemo(() => {
    const cleanDays = Math.min(31, Math.max(1, Number(days) || selectedTemplate?.defaultDays || 1));
    const dates = buildChallengeDates(todayDateKey(), cleanDays);
    const times = validScheduleTimes;
    const checks = dates.length * times.length;
    const rawReward = builderMode === "custom" ? Number(customBananas) : selectedTemplate?.rewardBananas;
    const totalBananas = checks ? Math.max(checks, Math.round(rawReward || checks)) : 0;
    const shares = rewardShares(totalBananas, checks || 1).slice(0, checks || 0);
    return {
      title: builderMode === "custom" ? (customTitle.trim() || "Mi reto personal") : selectedTemplate?.title ?? "Reto",
      startDate: dates[0] ?? todayDateKey(),
      endDate: dates[dates.length - 1] ?? todayDateKey(),
      checks,
      times,
      totalBananas,
      shareLabel: rewardShareLabel(shares),
    };
  }, [builderMode, customBananas, customTitle, days, selectedTemplate, validScheduleTimes]);

  function notify(message: string, type: "success" | "error" = "success") {
    setToast({ message, type });
    window.setTimeout(() => setToast(null), 2600);
  }

  function challengePrimaryAction(challenge: Challenge, progress: ReturnType<typeof calculateChallengeProgress>) {
    if (challenge.status === "cancelled") return { href: "/analytics", label: "Reto cancelado", tone: "muted" as const };
    if (challenge.claimedAt) return { href: "/analytics", label: "Ya cobrado", tone: "muted" as const };
    if (progress.claimableBananas > 0) return { href: null, label: `Cobrar ${progress.claimableBananas} banana${progress.claimableBananas === 1 ? "" : "s"}`, tone: "claim" as const };
    if (progress.availableToday > 0) return { href: "/today", label: "Ver tareas de hoy", tone: "today" as const };
    if (progress.missed > 0) return { href: "/calendar", label: "Ver resumen del reto", tone: "muted" as const };
    return { href: "/calendar", label: "Ver próximo check", tone: "calendar" as const };
  }

  function challengeStateMessage(challenge: Challenge, progress: ReturnType<typeof calculateChallengeProgress>, nextTask: Challenge["tasks"][number] | null) {
    if (challenge.status === "cancelled") return "Reto pausado. Tus avances quedan guardados.";
    if (challenge.claimedAt) {
      const claimed = bananaByChallengeId.get(challenge.id) ?? progress.earnedBananas;
      return `${claimed} banana${claimed === 1 ? "" : "s"} reclamadas${progress.lostBananas > 0 ? ` · ${progress.lostBananas} no ganada${progress.lostBananas === 1 ? "" : "s"}` : ""}.`;
    }
    if (progress.claimableBananas > 0 && progress.lostBananas > 0) return `Avance listo: podés reclamar ${progress.claimableBananas} banana${progress.claimableBananas === 1 ? "" : "s"}. ${progress.lostBananas} quedó${progress.lostBananas === 1 ? "" : "s"} sin ganar.`;
    if (progress.claimableBananas > 0) return "¡Reto completo! Ya podés reclamar tus bananas.";
    if (progress.missed > 0) return `${progress.missed} check${progress.missed === 1 ? "" : "s"} quedó${progress.missed === 1 ? "" : "n"} sin completar. Podés seguir con lo que queda.`;
    if (progress.availableToday > 0) return `${progress.availableToday} check${progress.availableToday === 1 ? "" : "s"} para hoy. Cada check suma bananas.`;
    if (nextTask) return `Próximo check: ${formatDate(nextTask.scheduledDate)} · ${nextTask.scheduledTime}.`;
    return "Todo listo.";
  }

  function openTemplate(template: typeof PERSONAL_CHALLENGE_TEMPLATES[number]) {
    if (activeChallengeTitles.has(template.title)) {
      notify("Ya tenés ese reto activo. Completalo o reclamá tus bananas antes de repetirlo.", "error");
      return;
    }
    setBuilderMode("suggested");
    setTemplateId(template.id);
    setDays(String(template.defaultDays));
    setScheduleTimes([template.defaultTimes[0] ?? "09:00"]);
    setSheetOpen(true);
  }

  function openCustomBuilder() {
    setBuilderMode("custom");
    setDays("1");
    setScheduleTimes(["09:00"]);
    setSheetOpen(true);
  }

  function updateScheduleTime(index: number, value: string) {
    setScheduleTimes((current) => current.map((item, itemIndex) => (itemIndex === index ? value : item)));
  }

  function addScheduleTime() {
    setScheduleTimes((current) => current.length >= 3 ? current : [...current, ""]);
  }

  function removeScheduleTime(index: number) {
    setScheduleTimes((current) => current.length <= 1 ? current : current.filter((_, itemIndex) => itemIndex !== index));
  }

  async function createPersonalChallenge() {
    if (creating) return;
    const template = selectedTemplate;
    if (!template) return;

    const isCustom = builderMode === "custom";
    const title = (isCustom ? customTitle : template.title).trim();
    const description = (isCustom ? customDescription : template.description).trim();
    const iconKey = (isCustom ? customIconKey : template.iconKey).trim() || "monito-otro";
    const activityTypeKey = isCustom ? "otro" : template.activityTypeKey;
    const color = isCustom ? "green" as const : template.color;
    const cleanDays = Math.min(31, Math.max(1, Number(days) || template.defaultDays));
    const times = validScheduleTimes;

    if (title.length < 3) {
      notify("Escribí un nombre de reto más claro.", "error");
      return;
    }
    if (activeChallengeTitles.has(title)) {
      notify("Ese reto ya está activo. Evitamos duplicarlo para que la medición quede limpia.", "error");
      return;
    }
    if (!times.length) {
      notify("Agregá al menos una hora válida en formato 09:00.", "error");
      return;
    }
    if (new Set(scheduleTimes.map((item) => item.trim()).filter(Boolean)).size !== scheduleTimes.map((item) => item.trim()).filter(Boolean).length) {
      notify("Hay horarios repetidos. Dejá cada hora una sola vez.", "error");
      return;
    }

    setCreating(true);
    try {
      const startDate = todayDateKey();
      const dates = buildChallengeDates(startDate, cleanDays);
      const rawReward = isCustom ? Number(customBananas) : template.rewardBananas;
      const minimumReward = dates.length * times.length;
      const rewardBananas = Math.max(1, Math.max(Math.round(rawReward || minimumReward), minimumReward));
      const shares = rewardShares(rewardBananas, minimumReward);
      let rewardIndex = 0;
      const challengeSlug = isCustom ? `custom-${slugify(title)}` : template.id;
      const taskSeed = Date.now().toString(36);

      const draft = createChallengeDraft({
        origin: "personal",
        title,
        description,
        iconKey,
        imagePath: null,
        activityTypeKey,
        frequency: cleanDays === 1 ? "daily" : cleanDays > 7 ? "monthly" : "weekly",
        startDate,
        endDate: dates[dates.length - 1],
        rewardBananas,
        requiresGuardianVerification: false,
        tasks: dates.flatMap((date) => times.map((time) => ({
          id: `${challengeSlug}-${taskSeed}-${date}-${time.replace(":", "")}`,
          calendarEventId: null,
          title,
          iconKey,
          activityTypeKey,
          scheduledDate: date,
          scheduledTime: time,
          rewardBananas: shares[rewardIndex++] ?? 1,
        }))),
      });

      const tasksWithEvents = [];
      const createdTaskKeys = new Set<string>();
      for (const task of draft.tasks) {
        const dedupKey = `${draft.id}-${task.scheduledDate}-${task.scheduledTime}`;
        if (createdTaskKeys.has(dedupKey)) continue;
        createdTaskKeys.add(dedupKey);

        const existingEvent = events.find((event) => (
          event.source === "personal_challenge" &&
          event.challengeId === draft.id &&
          (event.challengeTaskId === task.id || (event.date === task.scheduledDate && event.time === task.scheduledTime))
        ));

        if (existingEvent) {
          tasksWithEvents.push({ ...task, calendarEventId: existingEvent.id });
          continue;
        }

        const event = await createEvent({
          date: task.scheduledDate,
          time: task.scheduledTime,
          endTime: null,
          title: `Reto: ${task.title}`,
          color,
          iconKey: task.iconKey,
          activityTypeKey: task.activityTypeKey,
          recurrenceType: "none",
          recurrenceDays: null,
          recurrenceUntil: null,
          recurrenceGroupId: null,
          done: false,
          source: "personal_challenge",
          challengeId: draft.id,
          challengeTaskId: task.id,
          isLocked: true,
          verificationStatus: "none",
          rewardBananas: task.rewardBananas,
        });
        tasksWithEvents.push({ ...task, calendarEventId: event.id });
      }

      const saved = await saveChallenge({ ...draft, tasks: tasksWithEvents });
      if (!saved) {
        notify("No pudimos guardar tu reto. Revisá tu conexión e intentá de nuevo.", "error");
        return;
      }
      setSheetOpen(false);
      notify("Reto creado. Ya aparece en Hoy y Calendario 🍌");
    } finally {
      setCreating(false);
    }
  }

  async function handleClaim(challenge: Challenge) {
    if (challenge.claimedAt) {
      notify("Este reto ya tenía bananas reclamadas.", "error");
      return;
    }
    setClaimingId(challenge.id);
    try {
      const doneIds = challengeDoneIds(challenge, events);
      const progress = calculateChallengeProgress(challenge, doneIds);
      if (!progress.closed) {
        notify(`Aún faltan ${Math.max(0, progress.total - progress.done - progress.missed)} checks antes de reclamar bananas.`, "error");
        return;
      }
      if (progress.earnedBananas <= 0) {
        notify("No hay bananas listas en este reto.", "error");
        return;
      }
      const syncedChallenge = hydrateChallengeTaskStatuses(challenge, doneIds);
      const updated = await updateChallenge(syncedChallenge);
      if (!updated) {
        notify("No pudimos actualizar tu avance. Intentá de nuevo.", "error");
        return;
      }
      const entry = await claimBananas(syncedChallenge);
      if (entry) {
        notify(`Reclamaste ${entry.amount} bananas 🍌`);
        void refreshChallenges();
      } else {
        notify("Estas bananas ya estaban reclamadas o no pudimos guardarlas.", "error");
      }
    } finally {
      setClaimingId(null);
    }
  }

  async function handleCancelChallenge(challenge: Challenge) {
    if (challenge.claimedAt) {
      notify("Este reto ya está cerrado y conserva tus avances.", "error");
      return;
    }
    const ok = await updateChallenge({ ...challenge, status: "cancelled", updatedAt: new Date().toISOString() });
    if (ok) {
      notify("Reto pausado. Tus avances quedan guardados.");
      void refreshChallenges();
    } else {
      notify("No pudimos pausar el reto. Revisá tu conexión.", "error");
    }
  }

  return (
    <AppShell>
      <Toast toast={toast} onClose={() => setToast(null)} />
      <section className="page-pad pb-32 pt-8">
        <div className="flex items-center justify-between gap-3">
          <Link href="/settings" className="grid h-10 w-10 place-items-center rounded-full bg-white shadow-sm"><ArrowLeft className="h-5 w-5" /></Link>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => void refreshChallenges()} className="grid h-10 w-10 place-items-center rounded-full bg-white shadow-sm transition active:scale-95" aria-label="Actualizar retos"><RefreshCw className={cn("h-4 w-4 text-monkey-muted", syncing && "animate-spin")} /></button>
            <span className="rounded-full bg-yellow-50 px-3 py-1 text-xs font-black text-orange-700">Retos</span>
          </div>
        </div>

        <div className="mt-5 rounded-[32px] bg-gradient-to-br from-yellow-100 via-white to-green-100 p-5 shadow-card">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[.12em] text-orange-700">Retos personales</p>
              <h1 className="mt-2 text-3xl font-black leading-tight text-monkey-ink">Sumá bananas con mini retos.</h1>
              <p className="mt-2 text-sm font-semibold leading-6 text-monkey-muted">Elegí un reto, completá checks y reclamá tus bananas cuando avances. Tus tareas normales siguen igual.</p>
            </div>
            <div className="grid h-16 w-16 shrink-0 place-items-center rounded-[24px] bg-white shadow-soft">
              <img src={REWARD_BANANA_BUNCH} alt="Bananas de oro" className="h-14 w-14 object-contain animate-floaty" />
            </div>
          </div>
          <div className="mt-5 grid grid-cols-4 gap-2">
            <div className="rounded-[20px] bg-white/80 p-3 text-center"><p className="text-xl font-black">{totalBananas}</p><p className="text-[10px] font-bold text-monkey-muted">reclamadas</p></div>
            <div className="rounded-[20px] bg-white/80 p-3 text-center"><p className="text-xl font-black">{claimableBananas}</p><p className="text-[10px] font-bold text-monkey-muted">listas</p></div>
            <div className="rounded-[20px] bg-white/80 p-3 text-center"><p className="text-xl font-black">{lostBananasTotal}</p><p className="text-[10px] font-bold text-monkey-muted">no ganadas</p></div>
            <div className="rounded-[20px] bg-white/80 p-3 text-center"><p className="text-xl font-black">{summary.completed}</p><p className="text-[10px] font-bold text-monkey-muted">completados</p></div>
          </div>
          <div className="mt-3 rounded-[20px] bg-white/70 p-3 text-xs font-black text-orange-800">
            {syncing ? "Actualizando tus retos…" : claimableBananas > 0 ? `${claimableBananas} bananas listas para cobrar · ${summary.pendingTasks} checks por hacer` : `${summary.pendingTasks} por hacer · ${summary.missedTasks} no completados · ${perfectDaysHint} perfectos`}
          </div>
          <div className="mt-3 flex items-center justify-between gap-3 rounded-[20px] bg-white/80 p-3">
            <div>
              <p className="text-xs font-black text-monkey-ink">Recordatorio divertido</p>
              <p className="text-[11px] font-bold leading-4 text-monkey-muted">Mostrame el saltito de bananas una vez al día en Hoy.</p>
            </div>
            <button type="button" onClick={() => toggleRewardsIntro(!rewardsIntroEnabled)} className={cn("relative h-8 w-14 rounded-full transition", rewardsIntroEnabled ? "bg-monkey-green" : "bg-gray-300")} aria-label="Activar o apagar aviso diario de bananas">
              <span className={cn("absolute top-1 h-6 w-6 rounded-full bg-white shadow-sm transition", rewardsIntroEnabled ? "left-7" : "left-1")} />
            </button>
          </div>
        </div>

        <section className="mt-5 rounded-[28px] border border-yellow-200 bg-yellow-50 p-4 shadow-card">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[.1em] text-orange-700">Medallas de retos</p>
              <h2 className="text-base font-black text-monkey-ink">Tu camino banana</h2>
              <p className="text-xs font-bold leading-5 text-monkey-muted">Las bananas muestran avance; las medallas celebran tus logros.</p>
            </div>
            <img src={REWARD_TROPHY_GOLD} alt="Trofeo banana" className="h-14 w-14 object-contain" />
          </div>
          <div className="mt-4 grid gap-2">
            {rewardMilestones.map((milestone) => (
              <div key={milestone.label} className={cn("flex items-center gap-3 rounded-[20px] bg-white p-3 shadow-sm", milestone.value && "ring-2 ring-monkey-yellow/60")}> 
                <img src={milestone.trophy} alt="Trofeo" className="h-11 w-11 object-contain" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-black text-monkey-ink">{milestone.label}</p>
                  <p className="text-[11px] font-bold text-monkey-muted">{milestone.value ? "Ganada" : "En progreso"}</p>
                </div>
                <span className={cn("rounded-full px-3 py-1 text-xs font-black", milestone.value ? "bg-green-50 text-monkey-greenDark" : "bg-gray-100 text-monkey-muted")}>{milestone.helper}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-black uppercase tracking-[.08em] text-monkey-muted">Retos sugeridos</h2>
            <button type="button" onClick={openCustomBuilder} className="flex items-center gap-1 rounded-full bg-monkey-green px-3 py-2 text-xs font-black text-white"><Plus className="h-4 w-4" /> Crear</button>
          </div>
          <div className="grid gap-3">
            {PERSONAL_CHALLENGE_TEMPLATES.map((template) => {
              const alreadyActive = activeChallengeTitles.has(template.title);
              return (
                <button key={template.id} type="button" onClick={() => openTemplate(template)} className={cn("flex items-center gap-3 rounded-[24px] bg-white p-4 text-left shadow-card transition hover:-translate-y-0.5 hover:shadow-float active:scale-[.99]", alreadyActive && "opacity-70")}> 
                  <AssetThumb icon={template.iconKey} className="h-14 w-14 rounded-[20px] bg-green-50" />
                  <span className="min-w-0 flex-1">
                    <strong className="block truncate text-sm font-black text-monkey-ink">{template.title}</strong>
                    <span className="mt-1 block text-xs font-semibold leading-5 text-monkey-muted">{alreadyActive ? "Ya está activo. Completalo antes de repetir." : template.helper}</span>
                  </span>
                  <span className={cn("rounded-full px-3 py-1 text-xs font-black", alreadyActive ? "bg-gray-100 text-monkey-muted" : "bg-yellow-50 text-orange-700")}>{alreadyActive ? "Activo" : `+${template.rewardBananas} 🍌`}</span>
                </button>
              );
            })}
          </div>
        </section>

        <section className="mt-7">
          <h2 className="mb-3 text-sm font-black uppercase tracking-[.08em] text-monkey-muted">En progreso</h2>
          {activeChallenges.length ? (
            <div className="grid gap-3">
              {activeChallenges.map((challenge) => {
                const doneIds = challengeDoneIds(challenge, events);
                const progress = calculateChallengeProgress(challenge, doneIds);
                const nextTask = nextPendingChallengeTask(challenge, doneIds);
                const action = challengePrimaryAction(challenge, progress);
                return (
                  <article key={challenge.id} className="rounded-[28px] bg-white p-4 shadow-card transition hover:-translate-y-0.5 hover:shadow-float">
                    <div className="flex items-start gap-3">
                      <div className="relative shrink-0">
                        <AssetThumb icon={challenge.iconKey} src={challenge.imagePath ?? undefined} className="h-14 w-14 rounded-[20px] bg-green-50" />
                        <img src={trophyForProgress(progress, bananaByChallengeId.get(challenge.id) ?? 0)} alt="Estado del reto" className="absolute -bottom-2 -right-2 h-7 w-7 rounded-full bg-white object-contain p-0.5 shadow-soft" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="text-base font-black text-monkey-ink">{challenge.title}</h3>
                            <p className="mt-1 text-xs font-bold text-monkey-muted">{formatDate(challenge.startDate)} – {formatDate(challenge.endDate)}</p>
                          </div>
                          <span className="rounded-full bg-yellow-50 px-2.5 py-1 text-xs font-black text-orange-700">{progress.totalBananas} posibles 🍌</span>
                        </div>
                        <div className="mt-4 h-3 overflow-hidden rounded-full bg-gray-100"><div className="h-full rounded-full bg-monkey-green" style={{ width: `${progress.percent}%` }} /></div>
                        <div className="mt-2 flex items-center justify-between text-xs font-black text-monkey-muted"><span>{progress.done}/{progress.total} checks</span><span>{progress.percent}%</span></div>
                        <div className={cn("mt-3 rounded-[18px] p-3 text-xs font-black", progress.completed ? "bg-green-50 text-monkey-greenDark" : progress.missed > 0 ? "bg-gray-100 text-monkey-muted" : progress.availableToday > 0 ? "bg-blue-50 text-blue-700" : "bg-gray-50 text-monkey-muted")}>{challengeStateMessage(challenge, progress, nextTask)}</div>
                        <div className="mt-3 grid grid-cols-2 gap-2 text-center text-[10px] font-black">
                          <div className="rounded-[14px] bg-green-50 px-2 py-2 text-monkey-greenDark">{progress.earnedBananas} ganadas</div>
                          <div className="rounded-[14px] bg-yellow-50 px-2 py-2 text-orange-700">{progress.claimableBananas} listas</div>
                          <div className="rounded-[14px] bg-gray-100 px-2 py-2 text-monkey-muted">{progress.lostBananas} no ganadas</div>
                          <div className="rounded-[14px] bg-blue-50 px-2 py-2 text-blue-700">{progress.upcoming} futuras</div>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-black">
                          <span className="rounded-full bg-green-50 px-2.5 py-1 text-monkey-greenDark"><LockKeyhole className="mr-1 inline h-3 w-3" />Reto especial</span>
                          <span className="rounded-full bg-blue-50 px-2.5 py-1 text-blue-700"><CalendarDays className="mr-1 inline h-3 w-3" />En tu día</span>
                          {progress.missed > 0 ? <span className="rounded-full bg-gray-100 px-2.5 py-1 text-monkey-muted">Quedó pendiente</span> : null}
                        </div>
                        {action.tone === "claim" ? (
                          <button type="button" disabled={claimingId === challenge.id} onClick={() => handleClaim(challenge)} className="mt-4 h-11 w-full rounded-pill bg-monkey-green text-sm font-black text-white transition active:scale-95 disabled:opacity-70">{claimingId === challenge.id ? "Reclamando bananas…" : action.label}</button>
                        ) : action.href ? (
                          <Link href={action.href} className={cn("mt-4 flex h-11 w-full items-center justify-center rounded-pill text-sm font-black transition active:scale-95", action.tone === "today" ? "bg-blue-600 text-white" : action.tone === "calendar" ? "bg-blue-50 text-blue-700" : "bg-gray-100 text-monkey-muted")}>{action.label}</Link>
                        ) : null}
                        {progress.closed || challenge.claimedAt || challenge.status === "cancelled" ? null : (
                          <button type="button" onClick={() => void handleCancelChallenge(challenge)} className="mt-2 flex h-10 w-full items-center justify-center rounded-pill bg-gray-50 text-xs font-black text-monkey-muted transition active:scale-95"><XCircle className="mr-1 h-4 w-4" /> Pausar reto</button>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="rounded-[28px] bg-white p-5 text-center shadow-card">
              <Sparkles className="mx-auto h-8 w-8 text-monkey-yellow" />
              <h3 className="mt-3 text-lg font-black">Sin retos activos por ahora</h3>
              <p className="mt-1 text-sm font-semibold leading-6 text-monkey-muted">Elegí uno pequeño y empezá a sumar bananas a tu ritmo.</p>
            </div>
          )}
        </section>

        {completedChallenges.length ? (
          <section className="mt-7">
            <h2 className="mb-3 text-sm font-black uppercase tracking-[.08em] text-monkey-muted">Completados</h2>
            <div className="grid gap-2">
              {completedChallenges.slice(0, 5).map((challenge) => (
                <article key={challenge.id} className="flex items-center gap-3 rounded-[22px] bg-white p-3 shadow-sm">
                  <div className="grid h-11 w-11 place-items-center rounded-[16px] bg-yellow-50"><img src={REWARD_TROPHY_GOLD} alt="Trofeo de oro" className="h-10 w-10 object-contain" /></div>
                  <div className="min-w-0 flex-1"><p className="truncate text-sm font-black">{challenge.title}</p><p className="text-xs font-bold text-monkey-muted">{bananaByChallengeId.get(challenge.id) ?? challenge.rewardBananas} bananas reclamadas</p></div>
                  <CheckCircle2 className="h-5 w-5 text-monkey-green" />
                </article>
              ))}
            </div>
          </section>
        ) : null}

        <section className="mt-7">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-black uppercase tracking-[.08em] text-monkey-muted">Historial de bananas</h2>
            <History className="h-4 w-4 text-monkey-muted" />
          </div>
          {latestBananas.length ? (
            <div className="grid gap-2">
              {latestBananas.map((entry) => (
                <article key={entry.id} className="flex items-center gap-3 rounded-[22px] bg-white p-3 shadow-sm">
                  <div className="grid h-11 w-11 place-items-center rounded-[16px] bg-yellow-50"><img src={REWARD_BANANA_SINGLE} alt="Banana de oro" className="h-9 w-9 object-contain" /></div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-black">{entry.reason}</p>
                    <p className="text-xs font-bold text-monkey-muted">{new Date(entry.createdAt).toLocaleDateString("es-CR", { day: "numeric", month: "short" })}</p>
                  </div>
                  <strong className="rounded-full bg-yellow-50 px-3 py-1 text-xs font-black text-orange-700">+{entry.amount}</strong>
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-[28px] bg-white p-5 text-center shadow-card">
              <Banana className="mx-auto h-8 w-8 text-orange-600" />
              <h3 className="mt-3 text-lg font-black">Aún no reclamaste bananas</h3>
              <p className="mt-1 text-sm font-semibold leading-6 text-monkey-muted">Completá checks de un reto y reclamá tus primeras bananas.</p>
            </div>
          )}
          {recentLosses.length ? (
            <div className="mt-3 grid gap-2">
              {recentLosses.map(({ challenge, progress }) => (
                <article key={`loss-${challenge.id}`} className="flex items-center gap-3 rounded-[22px] bg-gray-50 p-3 shadow-sm">
                  <div className="grid h-11 w-11 place-items-center rounded-[16px] bg-white text-xl">🍂</div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-black">{challenge.title}</p>
                    <p className="text-xs font-bold text-monkey-muted">{progress.missed} check{progress.missed === 1 ? "" : "s"} no cumplido{progress.missed === 1 ? "" : "s"}</p>
                  </div>
                  <strong className="rounded-full bg-gray-100 px-3 py-1 text-xs font-black text-monkey-muted">-{progress.lostBananas} 🍌</strong>
                </article>
              ))}
            </div>
          ) : null}
        </section>
      </section>

      <FormSheet open={sheetOpen} title={builderMode === "custom" ? "Crear mi propio reto" : "Aceptar reto"} subtitle="Creá un reto simple, elegí horarios y mirá cuántas bananas podés ganar." onClose={() => setSheetOpen(false)} onSubmit={createPersonalChallenge} submitLabel={creating ? "Creando reto…" : "Crear reto"}>
        <div className="grid grid-cols-2 gap-2 rounded-[20px] bg-gray-100 p-1">
          <button type="button" onClick={() => setBuilderMode("suggested")} className={cn("rounded-[16px] px-3 py-3 text-xs font-black transition", builderMode === "suggested" ? "bg-white text-monkey-ink shadow-sm" : "text-monkey-muted")}>Sugeridos</button>
          <button type="button" onClick={() => setBuilderMode("custom")} className={cn("rounded-[16px] px-3 py-3 text-xs font-black transition", builderMode === "custom" ? "bg-white text-monkey-ink shadow-sm" : "text-monkey-muted")}>Personalizado</button>
        </div>

        {builderMode === "suggested" ? (
          <div className="grid gap-2">
            {PERSONAL_CHALLENGE_TEMPLATES.map((template) => (
              <button key={template.id} type="button" onClick={() => openTemplate(template)} className={cn("flex items-center gap-3 rounded-[18px] p-3 text-left transition active:scale-[.99]", templateId === template.id ? "bg-green-50 ring-2 ring-monkey-green" : "bg-gray-50")}> 
                <AssetThumb icon={template.iconKey} className="h-11 w-11 rounded-[16px] bg-white" />
                <span className="min-w-0 flex-1"><strong className="block truncate text-sm font-black">{template.title}</strong><span className="block text-xs font-bold text-monkey-muted">{template.rewardBananas} bananas sugeridas</span></span>
              </button>
            ))}
          </div>
        ) : (
          <div className="grid gap-3">
            <div>
              <p className="mb-1 text-[11px] font-bold text-monkey-muted">Poné un nombre corto y fácil de reconocer.</p>
              <Field label="Nombre del reto" value={customTitle} onChange={(event) => setCustomTitle(event.target.value)} placeholder="Ej: Leer 20 minutos" />
            </div>
            <div>
              <p className="mb-1 text-[11px] font-bold text-monkey-muted">Una frase breve para recordar por qué lo querés lograr.</p>
              <Field label="Descripción" value={customDescription} onChange={(event) => setCustomDescription(event.target.value)} placeholder="Ej: Crear constancia sin presión" />
            </div>
            <div>
              <p className="mb-1 text-[11px] font-bold text-monkey-muted">Elegí cuántas bananas se reparten entre los checks.</p>
              <Field label="Bananas" value={customBananas} onChange={(event) => setCustomBananas(event.target.value)} placeholder="5" inputMode="numeric" />
            </div>
            <div>
              <p className="mb-2 text-xs font-black uppercase tracking-[.08em] text-monkey-muted">Icono / monito</p>
              <p className="mb-2 text-[11px] font-bold text-monkey-muted">Elegí cómo se verá tu reto en Hoy y Calendario.</p>
              <div className="grid max-h-[12.5rem] grid-cols-4 gap-2 overflow-y-auto rounded-[22px] border border-blue-100 bg-gray-50 p-2">
                {REWARD_ICON_OPTIONS.map((asset) => (
                  <button key={asset.key} type="button" onClick={() => setCustomIconKey(asset.key)} className={cn("grid min-h-[5.35rem] gap-1 rounded-[18px] border border-blue-100 bg-white p-2 text-center text-[9px] font-black text-monkey-muted shadow-sm transition active:scale-95", customIconKey === asset.key && "border-blue-500 ring-2 ring-blue-500 text-blue-700")}> 
                    <AssetThumb icon={asset.key} className="mx-auto h-10 w-10 rounded-[14px] bg-blue-50" />
                    <span className="line-clamp-2 leading-tight">{asset.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <div>
          <p className="mb-1 text-[11px] font-bold text-monkey-muted">Cuántos días querés mantener este reto activo.</p>
          <Field label="Días de reto" value={days} onChange={(event) => setDays(event.target.value)} placeholder="7" inputMode="numeric" />
        </div>
        <div>
          <span className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-[.08em] text-monkey-muted"><Clock3 className="h-4 w-4" /> Horarios</span>
          <div className="grid gap-2">
            {scheduleTimes.map((time, index) => (
              <div key={index} className="grid grid-cols-[1fr_auto] gap-2">
                <Field label={`Hora ${index + 1}`} value={time} onChange={(event) => updateScheduleTime(index, event.target.value)} placeholder="09:00" />
                {scheduleTimes.length > 1 ? (
                  <button type="button" onClick={() => removeScheduleTime(index)} className="mt-7 h-[52px] rounded-[18px] bg-gray-100 px-4 text-xs font-black text-monkey-muted">Quitar</button>
                ) : null}
              </div>
            ))}
          </div>
          {scheduleTimes.length < 3 ? (
            <button type="button" onClick={addScheduleTime} className="mt-3 rounded-full bg-green-50 px-4 py-2 text-xs font-black text-monkey-greenDark">+ Agregar horario</button>
          ) : null}
          <p className="mt-2 text-xs leading-5 text-monkey-muted">Solo se crearán tareas para los horarios que agregués aquí. No se usan horas ocultas ni valores por defecto adicionales.</p>
        </div>
        <div className="rounded-[22px] border border-yellow-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <img src={REWARD_BANANA_SINGLE} alt="Banana de oro" className="h-11 w-11 object-contain" />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-black uppercase tracking-[.08em] text-orange-700">Preview del reto</p>
              <h3 className="truncate text-sm font-black text-monkey-ink">{builderPreview.title}</h3>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 text-center text-xs font-black">
            <div className="rounded-[16px] bg-gray-50 p-3"><p className="text-base text-monkey-ink">{builderPreview.checks}</p><p className="text-[10px] text-monkey-muted">checks</p></div>
            <div className="rounded-[16px] bg-yellow-50 p-3"><p className="text-base text-orange-700">{builderPreview.totalBananas}</p><p className="text-[10px] text-monkey-muted">bananas posibles</p></div>
          </div>
          <div className="mt-3 rounded-[18px] bg-gray-50 p-3 text-xs font-bold leading-5 text-monkey-muted"><p>Se crearán {builderPreview.checks} check{builderPreview.checks === 1 ? "" : "s"} del {formatDate(builderPreview.startDate)} al {formatDate(builderPreview.endDate)}.</p><p>{builderPreview.times.length ? `Horarios: ${builderPreview.times.join(" · ")}` : "Agregá al menos una hora."}</p><p>{builderPreview.shareLabel} · total posible: {builderPreview.totalBananas} banana{builderPreview.totalBananas === 1 ? "" : "s"}.</p></div>
        </div>
        <div className="rounded-[20px] bg-yellow-50 p-4 text-sm font-bold leading-6 text-orange-800"><Banana className="mr-1 inline h-4 w-4" /> Cada check suma bananas. Si un check se pasa, simplemente queda como no ganado.</div>
      </FormSheet>
    </AppShell>
  );
}
