"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowLeft, Banana, CalendarDays, CheckCircle2, Clock3, Flame, History, LockKeyhole, Plus, RefreshCw, Sparkles, Trophy } from "lucide-react";
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

function normalizeTime(value: string) {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(value) ? value : "09:00";
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
  const [days, setDays] = useState("1");
  const [timeA, setTimeA] = useState("09:00");
  const [timeB, setTimeB] = useState("13:00");
  const [timeC, setTimeC] = useState("17:00");
  const [claimingId, setClaimingId] = useState<string | null>(null);

  const selectedTemplate = PERSONAL_CHALLENGE_TEMPLATES.find((item) => item.id === templateId) ?? PERSONAL_CHALLENGE_TEMPLATES[0];
  const totalBananas = bananaLedger.reduce((sum, item) => sum + item.amount, 0);
  const activeChallenges = challenges.filter((challenge) => challenge.status === "active");
  const completedChallenges = challenges.filter((challenge) => challenge.status === "completed");
  const activeChallengeTitles = useMemo(() => new Set(activeChallenges.map((challenge) => challenge.title)), [activeChallenges]);
  const claimableChallenges = useMemo(() => activeChallenges.filter((challenge) => calculateChallengeProgress(challenge, challengeDoneIds(challenge, events)).completed && !challenge.claimedAt), [activeChallenges, events]);
  const claimableBananas = claimableChallenges.reduce((sum, challenge) => sum + challenge.rewardBananas, 0);
  const latestBananas = bananaLedger.slice(0, 5);

  const suggestedTimes = useMemo(() => {
    const base = selectedTemplate?.defaultTimes ?? ["09:00"];
    return [timeA || base[0] || "09:00", timeB || base[1] || "", timeC || base[2] || ""].filter(Boolean).map(normalizeTime);
  }, [selectedTemplate, timeA, timeB, timeC]);

  function notify(message: string, type: "success" | "error" = "success") {
    setToast({ message, type });
    window.setTimeout(() => setToast(null), 2600);
  }

  function openTemplate(template: typeof PERSONAL_CHALLENGE_TEMPLATES[number]) {
    if (activeChallengeTitles.has(template.title)) {
      notify("Ya tenés ese reto activo. Terminálo o cobrá las bananas antes de repetirlo.", "error");
      return;
    }
    setTemplateId(template.id);
    setDays(String(template.defaultDays));
    setTimeA(template.defaultTimes[0] ?? "09:00");
    setTimeB(template.defaultTimes[1] ?? "");
    setTimeC(template.defaultTimes[2] ?? "");
    setSheetOpen(true);
  }

  async function createPersonalChallenge() {
    const template = selectedTemplate;
    if (!template) return;
    if (activeChallengeTitles.has(template.title)) {
      notify("Ese reto ya está activo. Evitamos duplicarlo para que la medición quede limpia.", "error");
      return;
    }
    const cleanDays = Math.min(31, Math.max(1, Number(days) || template.defaultDays));
    const startDate = todayDateKey();
    const dates = buildChallengeDates(startDate, cleanDays);
    const times = Array.from(new Set((suggestedTimes.length ? suggestedTimes : template.defaultTimes).map(normalizeTime))).slice(0, 3);
    if (!times.length) {
      notify("Agregá al menos una hora válida para programar el reto.", "error");
      return;
    }
    const rewardBananas = Math.max(template.rewardBananas, Math.round(dates.length * times.length));
    const perTaskBananas = Math.max(1, Math.floor(rewardBananas / Math.max(1, dates.length * times.length)));

    const draft = createChallengeDraft({
      origin: "personal",
      title: template.title,
      description: template.description,
      iconKey: template.iconKey,
      imagePath: null,
      activityTypeKey: template.activityTypeKey,
      frequency: cleanDays === 1 ? "daily" : cleanDays > 7 ? "monthly" : "weekly",
      startDate,
      endDate: dates[dates.length - 1],
      rewardBananas,
      requiresGuardianVerification: false,
      tasks: dates.flatMap((date) => times.map((time, index) => ({
        id: `${template.id}-${date}-${time.replace(":", "")}-${index}`,
        calendarEventId: null,
        title: template.title,
        iconKey: template.iconKey,
        activityTypeKey: template.activityTypeKey,
        scheduledDate: date,
        scheduledTime: time,
        rewardBananas: perTaskBananas,
      }))),
    });

    const tasksWithEvents = [];
    for (const task of draft.tasks) {
      const event = await createEvent({
        date: task.scheduledDate,
        time: task.scheduledTime,
        endTime: null,
        title: `Reto: ${task.title}`,
        color: template.color,
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
      if (!progress.completed) {
        notify(`Todavía faltan ${Math.max(0, progress.total - progress.done)} checks para cobrar las bananas.`, "error");
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

  return (
    <AppShell>
      <Toast toast={toast} onClose={() => setToast(null)} />
      <section className="page-pad pb-32 pt-8">
        <div className="flex items-center justify-between gap-3">
          <Link href="/settings" className="grid h-10 w-10 place-items-center rounded-full bg-white shadow-sm"><ArrowLeft className="h-5 w-5" /></Link>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => void refreshChallenges()} className="grid h-10 w-10 place-items-center rounded-full bg-white shadow-sm transition active:scale-95" aria-label="Actualizar retos"><RefreshCw className={cn("h-4 w-4 text-monkey-muted", syncing && "animate-spin")} /></button>
            <span className="rounded-full bg-yellow-50 px-3 py-1 text-xs font-black text-orange-700">v2.28.1.2 QA</span>
          </div>
        </div>

        <div className="mt-5 rounded-[32px] bg-gradient-to-br from-yellow-100 via-white to-green-100 p-5 shadow-card">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[.12em] text-orange-700">Retos personales</p>
              <h1 className="mt-2 text-3xl font-black leading-tight text-monkey-ink">Ganá bananas creando constancia.</h1>
              <p className="mt-2 text-sm font-semibold leading-6 text-monkey-muted">Los retos son tareas especiales: se programan en Hoy/Calendario, quedan bloqueadas y suman bananas cuando completás todo el reto.</p>
            </div>
            <div className="grid h-16 w-16 shrink-0 place-items-center rounded-[24px] bg-white text-4xl shadow-soft">🍌</div>
          </div>
          <div className="mt-5 grid grid-cols-3 gap-2">
            <div className="rounded-[20px] bg-white/80 p-3 text-center"><p className="text-xl font-black">{totalBananas}</p><p className="text-[11px] font-bold text-monkey-muted">ganadas</p></div>
            <div className="rounded-[20px] bg-white/80 p-3 text-center"><p className="text-xl font-black">{claimableBananas}</p><p className="text-[11px] font-bold text-monkey-muted">por cobrar</p></div>
            <div className="rounded-[20px] bg-white/80 p-3 text-center"><p className="text-xl font-black">{summary.completed}</p><p className="text-[11px] font-bold text-monkey-muted">logrados</p></div>
          </div>
          <div className="mt-3 rounded-[20px] bg-white/70 p-3 text-xs font-black text-orange-800">
            {syncing ? "Actualizando retos…" : claimableBananas > 0 ? `${claimableBananas} bananas listas para cobrar · ${summary.pendingTasks} checks pendientes` : `${summary.pendingTasks} checks pendientes · completá un reto para liberar bananas`}
          </div>
        </div>

        <section className="mt-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-black uppercase tracking-[.08em] text-monkey-muted">Retos sugeridos</h2>
            <button type="button" onClick={() => setSheetOpen(true)} className="flex items-center gap-1 rounded-full bg-monkey-green px-3 py-2 text-xs font-black text-white"><Plus className="h-4 w-4" /> Crear</button>
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
                          <span className="rounded-full bg-yellow-50 px-2.5 py-1 text-xs font-black text-orange-700">{challenge.rewardBananas} 🍌</span>
                        </div>
                        <div className="mt-4 h-3 overflow-hidden rounded-full bg-gray-100"><div className="h-full rounded-full bg-monkey-green" style={{ width: `${progress.percent}%` }} /></div>
                        <div className="mt-2 flex items-center justify-between text-xs font-black text-monkey-muted"><span>{progress.done}/{progress.total} checks</span><span>{progress.percent}%</span></div>
                        {nextTask ? (
                          <div className="mt-3 rounded-[18px] bg-gray-50 p-3 text-xs font-bold text-monkey-muted">
                            Próximo check: <span className="font-black text-monkey-ink">{formatDate(nextTask.scheduledDate)} · {nextTask.scheduledTime}</span>
                          </div>
                        ) : (
                          <div className="mt-3 rounded-[18px] bg-green-50 p-3 text-xs font-black text-monkey-greenDark">Listo para cobrar bananas.</div>
                        )}
                        <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-black">
                          <span className="rounded-full bg-green-50 px-2.5 py-1 text-monkey-greenDark"><LockKeyhole className="mr-1 inline h-3 w-3" />Tareas bloqueadas</span>
                          <span className="rounded-full bg-blue-50 px-2.5 py-1 text-blue-700"><CalendarDays className="mr-1 inline h-3 w-3" />Hoy/Calendario</span>
                        </div>
                        <button type="button" disabled={claimingId === challenge.id} onClick={() => handleClaim(challenge)} className={cn("mt-4 h-11 w-full rounded-pill text-sm font-black transition active:scale-95 disabled:opacity-70", progress.completed ? "bg-monkey-green text-white" : "bg-gray-100 text-monkey-muted")}>{claimingId === challenge.id ? "Guardando bananas…" : progress.completed ? "Cobrar bananas" : "Completa el reto para cobrar"}</button>
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
                  <div className="min-w-0 flex-1"><p className="truncate text-sm font-black">{challenge.title}</p><p className="text-xs font-bold text-monkey-muted">{challenge.rewardBananas} bananas cobradas</p></div>
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
        </section>
      </section>

      <FormSheet open={sheetOpen} title="Aceptar reto" subtitle="Elegí duración y horarios. Después se programa automáticamente como tareas especiales." onClose={() => setSheetOpen(false)} onSubmit={createPersonalChallenge} submitLabel="Crear reto">
        <div className="grid gap-2">
          {PERSONAL_CHALLENGE_TEMPLATES.map((template) => (
            <button key={template.id} type="button" onClick={() => openTemplate(template)} className={cn("flex items-center gap-3 rounded-[18px] p-3 text-left transition active:scale-[.99]", templateId === template.id ? "bg-green-50 ring-2 ring-monkey-green" : "bg-gray-50")}> 
              <AssetThumb icon={template.iconKey} className="h-11 w-11 rounded-[16px] bg-white" />
              <span className="min-w-0 flex-1"><strong className="block truncate text-sm font-black">{template.title}</strong><span className="block text-xs font-bold text-monkey-muted">{template.rewardBananas} bananas sugeridas</span></span>
            </button>
          ))}
        </div>
        <Field label="Días de reto" value={days} onChange={(event) => setDays(event.target.value)} placeholder="7" />
        <div>
          <span className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-[.08em] text-monkey-muted"><Clock3 className="h-4 w-4" /> Horarios</span>
          <div className="grid gap-2 sm:grid-cols-3">
            <Field label="Hora 1" value={timeA} onChange={(event) => setTimeA(event.target.value)} placeholder="09:00" />
            <Field label="Hora 2" value={timeB} onChange={(event) => setTimeB(event.target.value)} placeholder="13:00" />
            <Field label="Hora 3" value={timeC} onChange={(event) => setTimeC(event.target.value)} placeholder="17:00" />
          </div>
          <p className="mt-2 text-xs leading-5 text-monkey-muted">Dejá vacías las horas que no querés usar. Las tareas del reto quedan bloqueadas para mantener la medición limpia.</p>
        </div>
        <div className="rounded-[20px] bg-yellow-50 p-4 text-sm font-bold leading-6 text-orange-800"><Banana className="mr-1 inline h-4 w-4" /> Al completar todos los checks, podrás cobrar bananas en tu Wallet de logros.</div>
      </FormSheet>
    </AppShell>
  );
}
