"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowLeft, Banana, CalendarDays, CheckCircle2, Clock3, Flame, History, LockKeyhole, Plus, RefreshCw, Sparkles, Trophy, XCircle } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { AssetThumb } from "@/components/asset-thumb";
import { Field } from "@/components/field";
import { FormSheet } from "@/components/form-sheet";
import { Toast, type ToastState } from "@/components/toast";
import { useCalendarEvents } from "@/hooks/use-calendar-events";
import { useChallenges } from "@/hooks/use-challenges";
import { buildChallengeDates, calculateChallengeProgress, hydrateChallengeTaskStatuses, nextPendingChallengeTask, PERSONAL_CHALLENGE_TEMPLATES, todayDateKey } from "@/lib/challenges";
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
  const [customIconKey, setCustomIconKey] = useState("monito-otro");
  const [creating, setCreating] = useState(false);
  const [claimingId, setClaimingId] = useState<string | null>(null);

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

  const validScheduleTimes = useMemo(() => {
    const unique = new Set<string>();
    for (const raw of scheduleTimes) {
      const time = cleanTime(raw);
      if (isValidTime(time)) unique.add(time);
    }
    return Array.from(unique);
  }, [scheduleTimes]);

  function notify(message: string, type: "success" | "error" = "success") {
    setToast({ message, type });
    window.setTimeout(() => setToast(null), 2600);
  }

  function challengePrimaryAction(challenge: Challenge, progress: ReturnType<typeof calculateChallengeProgress>) {
    if (challenge.claimedAt) return { href: "/analytics", label: "Ver resumen", tone: "muted" as const };
    if (progress.claimableBananas > 0) return { href: null, label: `Cobrar ${progress.claimableBananas} banana${progress.claimableBananas === 1 ? "" : "s"}`, tone: "claim" as const };
    if (progress.availableToday > 0) return { href: "/today", label: "Ver tareas de hoy", tone: "today" as const };
    if (progress.missed > 0) return { href: "/calendar", label: "Ver resumen del reto", tone: "muted" as const };
    return { href: "/calendar", label: "Ver próximo check", tone: "calendar" as const };
  }

  function challengeStateMessage(challenge: Challenge, progress: ReturnType<typeof calculateChallengeProgress>, nextTask: Challenge["tasks"][number] | null) {
    if (challenge.claimedAt) {
      const claimed = bananaByChallengeId.get(challenge.id) ?? progress.earnedBananas;
      return `Reto cerrado. ${claimed} banana${claimed === 1 ? "" : "s"} cobradas${progress.lostBananas > 0 ? ` · ${progress.lostBananas} perdida${progress.lostBananas === 1 ? "" : "s"}` : ""}.`;
    }
    if (progress.claimableBananas > 0 && progress.lostBananas > 0) return `Cierre parcial: cobrás ${progress.claimableBananas} banana${progress.claimableBananas === 1 ? "" : "s"} y ${progress.lostBananas} queda${progress.lostBananas === 1 ? "" : "n"} perdida${progress.lostBananas === 1 ? "" : "s"}.`;
    if (progress.claimableBananas > 0) return "Reto perfecto. Ya podés cobrar todas tus bananas.";
    if (progress.missed > 0) return `${progress.missed} check${progress.missed === 1 ? "" : "s"} no se cumplieron. Aún podés cerrar el reto si no quedan pendientes o futuros.`;
    if (progress.availableToday > 0) return `${progress.availableToday} check${progress.availableToday === 1 ? "" : "s"} disponibles hoy. Cada check suma bananas.`;
    if (nextTask) return `Próximo check: ${formatDate(nextTask.scheduledDate)} · ${nextTask.scheduledTime}. Aún no se puede marcar.`;
    return "Reto sincronizado.";
  }

  function openTemplate(template: typeof PERSONAL_CHALLENGE_TEMPLATES[number]) {
    if (activeChallengeTitles.has(template.title)) {
      notify("Ya tenés ese reto activo. Terminálo o cobrá las bananas antes de repetirlo.", "error");
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
      const perTaskBananas = Math.max(1, Math.floor(rewardBananas / Math.max(1, minimumReward)));
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
          rewardBananas: perTaskBananas,
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
        notify("No se pudo guardar el reto en tu cuenta. Revisá Supabase o la conexión antes de continuar.", "error");
        return;
      }
      setSheetOpen(false);
      notify("Reto creado y guardado en Supabase 🍌");
    } finally {
      setCreating(false);
    }
  }

  async function handleClaim(challenge: Challenge) {
    if (challenge.claimedAt) {
      notify("Este reto ya tenía bananas cobradas.", "error");
      return;
    }
    setClaimingId(challenge.id);
    try {
      const doneIds = challengeDoneIds(challenge, events);
      const progress = calculateChallengeProgress(challenge, doneIds);
      if (!progress.closed) {
        notify(`Todavía faltan ${Math.max(0, progress.total - progress.done - progress.missed)} checks por cerrar antes de cobrar.`, "error");
        return;
      }
      if (progress.earnedBananas <= 0) {
        notify("No hay bananas ganadas para cobrar en este reto.", "error");
        return;
      }
      const syncedChallenge = hydrateChallengeTaskStatuses(challenge, doneIds);
      const updated = await updateChallenge(syncedChallenge);
      if (!updated) {
        notify("No se pudo sincronizar el avance del reto. Actualizá e intentá de nuevo.", "error");
        return;
      }
      const entry = await claimBananas(syncedChallenge);
      if (entry) {
        notify(`Ganaste ${entry.amount} bananas 🍌`);
        void refreshChallenges();
      } else {
        notify("Las bananas ya estaban cobradas o no se pudieron guardar.", "error");
      }
    } finally {
      setClaimingId(null);
    }
  }

  async function handleCancelChallenge(challenge: Challenge) {
    if (challenge.claimedAt) {
      notify("Este reto ya está cerrado y conserva su historial.", "error");
      return;
    }
    const ok = await updateChallenge({ ...challenge, status: "cancelled", updatedAt: new Date().toISOString() });
    if (ok) {
      notify("Reto cancelado. El historial de checks queda guardado.");
      void refreshChallenges();
    } else {
      notify("No se pudo cancelar el reto. Revisá la conexión.", "error");
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
            <span className="rounded-full bg-yellow-50 px-3 py-1 text-xs font-black text-orange-700">v2.28.1.7 QA</span>
          </div>
        </div>

        <div className="mt-5 rounded-[32px] bg-gradient-to-br from-yellow-100 via-white to-green-100 p-5 shadow-card">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[.12em] text-orange-700">Retos personales</p>
              <h1 className="mt-2 text-3xl font-black leading-tight text-monkey-ink">Ganá bananas creando constancia.</h1>
              <p className="mt-2 text-sm font-semibold leading-6 text-monkey-muted">Los retos son tareas especiales: cada check cumplido suma bananas, los checks no realizados se registran y el progreso queda visible en Analytics.</p>
            </div>
            <div className="grid h-16 w-16 shrink-0 place-items-center rounded-[24px] bg-white text-4xl shadow-soft">🍌</div>
          </div>
          <div className="mt-5 grid grid-cols-4 gap-2">
            <div className="rounded-[20px] bg-white/80 p-3 text-center"><p className="text-xl font-black">{totalBananas}</p><p className="text-[10px] font-bold text-monkey-muted">cobradas</p></div>
            <div className="rounded-[20px] bg-white/80 p-3 text-center"><p className="text-xl font-black">{claimableBananas}</p><p className="text-[10px] font-bold text-monkey-muted">por cobrar</p></div>
            <div className="rounded-[20px] bg-white/80 p-3 text-center"><p className="text-xl font-black">{lostBananasTotal}</p><p className="text-[10px] font-bold text-monkey-muted">perdidas</p></div>
            <div className="rounded-[20px] bg-white/80 p-3 text-center"><p className="text-xl font-black">{summary.completed}</p><p className="text-[10px] font-bold text-monkey-muted">cerrados</p></div>
          </div>
          <div className="mt-3 rounded-[20px] bg-white/70 p-3 text-xs font-black text-orange-800">
            {syncing ? "Actualizando retos…" : claimableBananas > 0 ? `${claimableBananas} bananas listas para cobrar · ${summary.pendingTasks} checks pendientes` : `${summary.pendingTasks} pendientes · ${summary.missedTasks} perdidos · ${perfectDaysHint} perfectos`}
          </div>
        </div>

        <section className="mt-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-black uppercase tracking-[.08em] text-monkey-muted">Retos sugeridos</h2>
            <button type="button" onClick={openCustomBuilder} className="flex items-center gap-1 rounded-full bg-monkey-green px-3 py-2 text-xs font-black text-white"><Plus className="h-4 w-4" /> Crear</button>
          </div>
          <div className="grid gap-3">
            {PERSONAL_CHALLENGE_TEMPLATES.map((template) => {
              const alreadyActive = activeChallengeTitles.has(template.title);
              return (
                <button key={template.id} type="button" onClick={() => openTemplate(template)} className={cn("flex items-center gap-3 rounded-[24px] bg-white p-4 text-left shadow-card transition active:scale-[.99]", alreadyActive && "opacity-70")}> 
                  <AssetThumb icon={template.iconKey} className="h-14 w-14 rounded-[20px] bg-green-50" />
                  <span className="min-w-0 flex-1">
                    <strong className="block truncate text-sm font-black text-monkey-ink">{template.title}</strong>
                    <span className="mt-1 block text-xs font-semibold leading-5 text-monkey-muted">{alreadyActive ? "Ya está activo. Terminálo antes de repetir." : template.helper}</span>
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
                  <article key={challenge.id} className="rounded-[28px] bg-white p-4 shadow-card">
                    <div className="flex items-start gap-3">
                      <AssetThumb icon={challenge.iconKey} src={challenge.imagePath ?? undefined} className="h-14 w-14 rounded-[20px] bg-green-50" />
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
                          <div className="rounded-[14px] bg-yellow-50 px-2 py-2 text-orange-700">{progress.claimableBananas} por cobrar</div>
                          <div className="rounded-[14px] bg-gray-100 px-2 py-2 text-monkey-muted">{progress.lostBananas} perdidas</div>
                          <div className="rounded-[14px] bg-blue-50 px-2 py-2 text-blue-700">{progress.upcoming} futuras</div>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-black">
                          <span className="rounded-full bg-green-50 px-2.5 py-1 text-monkey-greenDark"><LockKeyhole className="mr-1 inline h-3 w-3" />Tareas bloqueadas</span>
                          <span className="rounded-full bg-blue-50 px-2.5 py-1 text-blue-700"><CalendarDays className="mr-1 inline h-3 w-3" />Hoy/Calendario</span>
                          {progress.missed > 0 ? <span className="rounded-full bg-gray-100 px-2.5 py-1 text-monkey-muted">No cumplido</span> : null}
                        </div>
                        {action.tone === "claim" ? (
                          <button type="button" disabled={claimingId === challenge.id} onClick={() => handleClaim(challenge)} className="mt-4 h-11 w-full rounded-pill bg-monkey-green text-sm font-black text-white transition active:scale-95 disabled:opacity-70">{claimingId === challenge.id ? "Guardando bananas…" : action.label}</button>
                        ) : action.href ? (
                          <Link href={action.href} className={cn("mt-4 flex h-11 w-full items-center justify-center rounded-pill text-sm font-black transition active:scale-95", action.tone === "today" ? "bg-blue-600 text-white" : action.tone === "calendar" ? "bg-blue-50 text-blue-700" : "bg-gray-100 text-monkey-muted")}>{action.label}</Link>
                        ) : null}
                        {!challenge.claimedAt ? (
                          <button type="button" onClick={() => void handleCancelChallenge(challenge)} className="mt-2 flex h-10 w-full items-center justify-center rounded-pill bg-gray-50 text-xs font-black text-monkey-muted transition active:scale-95"><XCircle className="mr-1 h-4 w-4" /> Cancelar sin borrar historial</button>
                        ) : null}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="rounded-[28px] bg-white p-5 text-center shadow-card">
              <Sparkles className="mx-auto h-8 w-8 text-monkey-yellow" />
              <h3 className="mt-3 text-lg font-black">Sin retos activos</h3>
              <p className="mt-1 text-sm font-semibold leading-6 text-monkey-muted">Aceptá uno pequeño para probar el flujo de bananas sin cambiar tus tareas normales.</p>
            </div>
          )}
        </section>

        {completedChallenges.length ? (
          <section className="mt-7">
            <h2 className="mb-3 text-sm font-black uppercase tracking-[.08em] text-monkey-muted">Logrados</h2>
            <div className="grid gap-2">
              {completedChallenges.slice(0, 5).map((challenge) => (
                <article key={challenge.id} className="flex items-center gap-3 rounded-[22px] bg-white p-3 shadow-sm">
                  <div className="grid h-11 w-11 place-items-center rounded-[16px] bg-yellow-50 text-xl">🏆</div>
                  <div className="min-w-0 flex-1"><p className="truncate text-sm font-black">{challenge.title}</p><p className="text-xs font-bold text-monkey-muted">{bananaByChallengeId.get(challenge.id) ?? challenge.rewardBananas} bananas cobradas</p></div>
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
                  <div className="grid h-11 w-11 place-items-center rounded-[16px] bg-yellow-50 text-xl">🍌</div>
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
              <h3 className="mt-3 text-lg font-black">Aún no hay bananas cobradas</h3>
              <p className="mt-1 text-sm font-semibold leading-6 text-monkey-muted">Completá todos los checks de un reto y cobrá tus primeras bananas.</p>
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

      <FormSheet open={sheetOpen} title={builderMode === "custom" ? "Crear mi propio reto" : "Aceptar reto"} subtitle="Elegí solo los horarios que querés usar. Después se programa como tareas especiales." onClose={() => setSheetOpen(false)} onSubmit={createPersonalChallenge} submitLabel={creating ? "Creando reto…" : "Crear reto"}>
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
            <Field label="Nombre del reto" value={customTitle} onChange={(event) => setCustomTitle(event.target.value)} placeholder="Ej: Leer 20 minutos" />
            <Field label="Descripción" value={customDescription} onChange={(event) => setCustomDescription(event.target.value)} placeholder="Ej: Crear constancia sin presión" />
            <div className="grid grid-cols-2 gap-2">
              <Field label="Bananas" value={customBananas} onChange={(event) => setCustomBananas(event.target.value)} placeholder="5" inputMode="numeric" />
              <Field label="Icono/monito" value={customIconKey} onChange={(event) => setCustomIconKey(event.target.value)} placeholder="monito-otro" />
            </div>
          </div>
        )}

        <Field label="Días de reto" value={days} onChange={(event) => setDays(event.target.value)} placeholder="7" inputMode="numeric" />
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
        <div className="rounded-[20px] bg-yellow-50 p-4 text-sm font-bold leading-6 text-orange-800"><Banana className="mr-1 inline h-4 w-4" /> Cada check cumplido suma bananas. Los checks vencidos se pierden y se reflejan en Analytics.</div>
      </FormSheet>
    </AppShell>
  );
}
