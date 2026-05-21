"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { BarChart3, Bell, BellOff, BookOpen, CalendarDays, Check, Plus, RefreshCw } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { MonkeyAvatar } from "@/components/monkey-avatar";
import { ProgressCard } from "@/components/progress-card";
import { TimeBlockCard } from "@/components/time-block-card";
import { TaskDetailSheet } from "@/components/task-detail-sheet";
import { FormSheet } from "@/components/form-sheet";
import { Field } from "@/components/field";
import { Toast, ToastState } from "@/components/toast";
import { EmptyState } from "@/components/empty-state";
import { ActivityTypePicker } from "@/components/activity-type-picker";
import { AssetThumb } from "@/components/asset-thumb";
import { inferActivityTypeFromEvent } from "@/lib/activity-types";
import { useTasks } from "@/hooks/use-tasks";
import { useCalendarEvents } from "@/hooks/use-calendar-events";
import { useCalendarCompletions } from "@/hooks/use-calendar-completions";
import { useCalendarOverrides } from "@/hooks/use-calendar-overrides";
import { useReminders } from "@/hooks/use-reminders";
import { useCategoryPreferences } from "@/hooks/use-category-preferences";
import { resolveActivityCategoryMeta } from "@/lib/category-catalog";
import { isChallengeCalendarEvent } from "@/lib/challenges";
import { cn } from "@/lib/utils";
import { applyCalendarOverridesForDate, calendarOccurrenceBaseId, calendarOccurrenceDate, getCalendarEventDone, isRecurringEvent } from "@/lib/calendar/calendar-utils";
import type { CalendarEvent, Reminder, Task, TaskColor, TimeBlock } from "@/types";

const blockColors: TaskColor[] = ["green", "blue", "orange", "purple", "pink", "yellow"];
const colorLabels: Record<TaskColor, string> = { green: "Verde", blue: "Azul", orange: "Naranja", purple: "Morado", pink: "Rosa", yellow: "Amarillo" };

const calendarStyleMap: Record<CalendarEvent["color"], { card: string; icon: string }> = {
  yellow: { card: "bg-[#FFF7C2] text-[#996D00] border-yellow-100", icon: "calendar-exercise" },
  blue: { card: "bg-[#DDF7F7] text-[#187187] border-cyan-100", icon: "calendar-study" },
  green: { card: "bg-[#E0F8DC] text-[#277A35] border-green-100", icon: "calendar-class" },
  pink: { card: "bg-[#FFE1E7] text-[#C9415D] border-pink-100", icon: "calendar-food" },
  purple: { card: "bg-[#E8DEFF] text-[#6242B5] border-purple-100", icon: "calendar-project" },
  orange: { card: "bg-[#FFE9D7] text-[#B76119] border-orange-100", icon: "calendar-task" },
};

function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function fromDateKey(dateKey: string) {
  const [year = "2026", month = "05", day = "14"] = dateKey.split("-");
  return new Date(Number(year), Number(month) - 1, Number(day));
}

function compareDateKeys(a: string, b: string) {
  return a.localeCompare(b);
}

function dateKeyToJsDay(dateKey: string) {
  return fromDateKey(dateKey).getDay();
}

function eventOccursOnDate(event: CalendarEvent, dateKey: string) {
  const recurrenceType = event.recurrenceType ?? "none";
  if (recurrenceType === "none") return event.date === dateKey;
  if (compareDateKeys(dateKey, event.date) < 0) return false;
  if (event.recurrenceUntil && compareDateKeys(dateKey, event.recurrenceUntil) > 0) return false;
  if (recurrenceType === "daily") return true;
  if (recurrenceType === "custom_days") return (event.recurrenceDays ?? []).includes(dateKeyToJsDay(dateKey));
  return false;
}

function stripEmoji(title: string) {
  return title.replace(/^[^\p{L}\p{N}]+\s*/u, "").trim() || title.trim();
}

function formatTodayDate() {
  const value = new Intl.DateTimeFormat("es-CR", {
    weekday: "long",
    day: "numeric",
    month: "long"
  }).format(new Date());
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function reminderTime(reminderAt?: string | null) {
  if (!reminderAt) return "Sin recordatorio";
  const date = new Date(reminderAt);
  if (Number.isNaN(date.getTime())) return "Recordatorio activo";
  return date.toLocaleTimeString("es-CR", { hour: "2-digit", minute: "2-digit" }).replace(" a. m.", "").replace(" p. m.", "");
}

function eventRangeLabel(event: CalendarEvent) {
  if (!event.endTime) return event.time;
  return `${event.time}–${event.endTime}`;
}


function timeToMinutes(value: string) {
  const [hour = "0", minute = "0"] = value.split(":");
  return Number(hour) * 60 + Number(minute);
}

function eventEndMinutes(event: CalendarEvent) {
  if (event.endTime && /^([01]\d|2[0-3]):[0-5]\d$/.test(event.endTime)) return timeToMinutes(event.endTime);
  return timeToMinutes(event.time) + 60;
}

function isLongEvent(event: CalendarEvent) {
  return Boolean(event.endTime && eventEndMinutes(event) > timeToMinutes(event.time) + 60);
}

function containingLongEvent(events: CalendarEvent[], child: CalendarEvent) {
  const childStart = timeToMinutes(child.time);
  return events.find((event) => {
    if (event.id === child.id) return false;
    if (!isLongEvent(event)) return false;
    const start = timeToMinutes(event.time);
    const end = eventEndMinutes(event);
    return start <= childStart && end > childStart;
  }) ?? null;
}

function calendarIcon(event: CalendarEvent) {
  return inferActivityTypeFromEvent(event).iconKey ?? event.iconKey ?? calendarStyleMap[event.color]?.icon ?? "monkey-estudiar";
}

function todayOccurrenceKey(event: CalendarEvent, dateKey: string) {
  return `${calendarOccurrenceBaseId(event)}::${calendarOccurrenceDate(event, dateKey)}`;
}

function CalendarTodayCard({
  event,
  done,
  sourceLabel,
  contextLabel,
  hasReminder,
  isCompleting,
  onToggle,
  onEdit,
  onToggleReminder,
}: {
  event: CalendarEvent;
  done: boolean;
  sourceLabel: string;
  contextLabel?: string | null;
  hasReminder: boolean;
  isCompleting?: boolean;
  onToggle: (event: CalendarEvent) => void;
  onEdit: (event: CalendarEvent) => void;
  onToggleReminder: (event: CalendarEvent) => void;
}) {
  const style = calendarStyleMap[event.color] ?? calendarStyleMap.blue;
  return (
    <article
      className={cn("animate-slideUp rounded-card border p-4 text-left shadow-sm transition active:scale-[.995]", style.card, isCompleting && "pointer-events-none animate-completeOut")}
      onClick={() => onEdit(event)}
      role="button"
      tabIndex={0}
      onKeyDown={(keyboardEvent) => {
        if (keyboardEvent.key === "Enter" || keyboardEvent.key === " ") onEdit(event);
      }}
    >
      <div className="grid min-w-0 grid-cols-[54px_minmax(0,1fr)] gap-1">
        <div className="pt-1 text-[13px] font-black">{event.time}</div>
        <div className="min-w-0">
          <div className="flex max-w-full min-w-0 items-center text-left text-[15px] font-black text-monkey-ink">
            <AssetThumb icon={calendarIcon(event)} size={28} className="mr-2 shrink-0 rounded-[10px] bg-white/60 p-1" />
            <span className={cn("min-w-0 truncate", done && "text-gray-400 line-through")}>{stripEmoji(event.title)}</span>
          </div>
          <div className="mt-1 flex min-w-0 flex-wrap items-center gap-1.5">
            <span className="rounded-full bg-white/70 px-2 py-1 text-[9px] font-black uppercase tracking-[.08em] text-monkey-muted">{sourceLabel}</span>
            {contextLabel ? <span className="min-w-0 truncate rounded-full bg-white/70 px-2 py-1 text-[9px] font-black text-monkey-muted">{contextLabel}</span> : null}
          </div>
          <div className="mt-2 flex min-h-10 w-full min-w-0 items-center gap-2 overflow-hidden rounded-[14px] bg-white/75 px-3 text-left text-[13px] text-monkey-ink">
            <span className={cn("min-w-0 flex-1 truncate", done && "text-gray-400 line-through")}>{stripEmoji(event.title)}</span>
            <span className="shrink-0 rounded-pill bg-green-50 px-2 py-1 text-[10px] font-black text-monkey-green">{eventRangeLabel(event)}</span>
            <button
              type="button"
              onClick={(clickEvent) => {
                clickEvent.stopPropagation();
                onToggleReminder(event);
              }}
              className={cn(
                "grid h-7 w-7 shrink-0 place-items-center rounded-full transition active:scale-95",
                hasReminder ? "bg-green-50 text-monkey-green" : "bg-gray-100 text-gray-400",
              )}
              aria-label={hasReminder ? "Apagar alarma" : "Activar alarma"}
            >
              {hasReminder ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
            </button>
            <button
              type="button"
              onClick={(clickEvent) => {
                clickEvent.stopPropagation();
                onToggle(event);
              }}
              className={cn(
                "grid h-6 w-6 shrink-0 place-items-center rounded-full border-2 transition active:scale-95",
                done ? "animate-checkPulse border-monkey-green bg-monkey-green text-white" : "border-gray-300 bg-white",
              )}
              aria-label={done ? "Marcar pendiente" : "Marcar completada"}
            >
              {done ? <Check className="h-3.5 w-3.5" /> : null}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

export default function TodayPage() {
  const { blocks, percent, syncing: tasksSyncing, toggleTask, editTask, updateTaskReminder, deleteTask, refreshTasks } = useTasks();
  const { events: calendarEvents, createEvent, updateEvent, refreshEvents, syncing: calendarSyncing, syncStatus: calendarSyncStatus, lastError: calendarError } = useCalendarEvents();
  const { completionMap, syncStatus: completionSyncStatus, lastError: completionError, setCompletion } = useCalendarCompletions();
  const { overrides, saveOverride } = useCalendarOverrides();
  const { activityItems } = useCategoryPreferences();
  const { items: reminders, upsertCalendarReminder, deleteCalendarEventReminders } = useReminders();
  const [selectedBlock, setSelectedBlock] = useState<TimeBlock | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingCalendarEvent, setEditingCalendarEvent] = useState<CalendarEvent | null>(null);
  const [taskTitle, setTaskTitle] = useState("");
  const [blockTitle, setBlockTitle] = useState("Nuevo bloque");
  const [time, setTime] = useState("09:00");
  const [color, setColor] = useState<TaskColor>("green");
  const [activityTypeKey, setActivityTypeKey] = useState("study");
  const [alarmOn, setAlarmOn] = useState(false);
  const [recurringEditScope, setRecurringEditScope] = useState<"series" | "occurrence">("series");
  const [pendingRecurringEvent, setPendingRecurringEvent] = useState<CalendarEvent | null>(null);
  const [errors, setErrors] = useState<{ title?: string; time?: string }>({});
  const [toast, setToast] = useState<ToastState>(null);
  const [completingCalendarKeys, setCompletingCalendarKeys] = useState<Set<string>>(() => new Set());
  const [undoCompleted, setUndoCompleted] = useState<{ key: string; event: CalendarEvent } | null>(null);
  const todayLabel = useMemo(() => formatTodayDate(), []);
  const todayDateKey = useMemo(() => toDateKey(new Date()), []);

  const visibleBlocks = useMemo(() => blocks.filter((block) => !block.date || block.date === todayDateKey), [blocks, todayDateKey]);

  const calendarTodayEvents = useMemo(() => {
    return applyCalendarOverridesForDate(calendarEvents, overrides, todayDateKey)
      .sort((a, b) => a.time.localeCompare(b.time));
  }, [calendarEvents, overrides, todayDateKey]);

  const reminderEventIds = useMemo(() => {
    return new Set(reminders.filter((item) => item.enabled && item.calendarEventId).map((item) => item.calendarEventId as string));
  }, [reminders]);

  const combinedPercent = useMemo(() => {
    const taskList = visibleBlocks.flatMap((block) => block.tasks);
    const total = taskList.length + calendarTodayEvents.length;
    if (total === 0) return percent;
    const done = taskList.filter((task) => task.done).length + calendarTodayEvents.filter((event) => getCalendarEventDone(event, todayDateKey, completionMap)).length;
    return Math.round((done / total) * 100);
  }, [visibleBlocks, calendarTodayEvents, completionMap, todayDateKey, percent]);

  const agendaItems = useMemo(() => {
    const calendarItems = calendarTodayEvents
      .filter((event) => {
        const key = todayOccurrenceKey(event, todayDateKey);
        const done = getCalendarEventDone(event, todayDateKey, completionMap);
        return !done || completingCalendarKeys.has(key);
      })
      .map((event) => ({ id: `calendar-${todayOccurrenceKey(event, todayDateKey)}`, type: "calendar" as const, time: event.time, event }));

    return [
      ...visibleBlocks.map((block) => ({ id: `task-${block.id}`, type: "task" as const, time: block.time, block })),
      ...calendarItems,
    ].sort((a, b) => a.time.localeCompare(b.time));
  }, [visibleBlocks, calendarTodayEvents, completionMap, completingCalendarKeys, todayDateKey]);

  function showToast(message: string, type: "success" | "error" = "success") {
    setToast({ message, type });
    window.setTimeout(() => setToast(null), 2200);
  }

  function resetForm() {
    setTaskTitle("");
    setBlockTitle("Nuevo bloque");
    setTime("09:00");
    setColor("green");
    setActivityTypeKey("study");
    setAlarmOn(false);
    setEditingCalendarEvent(null);
    setErrors({});
  }

  async function submitTask() {
    const nextErrors: { title?: string; time?: string } = {};
    const cleanTitle = taskTitle.trim();
    if (cleanTitle.length < 3) nextErrors.title = "Escribí al menos 3 caracteres.";
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) nextErrors.time = "Usá formato HH:MM, por ejemplo 09:00.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    const meta = resolveActivityCategoryMeta({ key: activityTypeKey }, activityItems);
    const payload: Omit<CalendarEvent, "id"> = {
      title: cleanTitle,
      date: editingCalendarEvent?.date ?? todayDateKey,
      time,
      endTime: editingCalendarEvent?.endTime ?? null,
      color: meta.color,
      iconKey: meta.iconKey,
      activityTypeKey: meta.key,
      recurrenceType: editingCalendarEvent?.recurrenceType ?? "none",
      recurrenceDays: editingCalendarEvent?.recurrenceDays ?? null,
      recurrenceUntil: editingCalendarEvent?.recurrenceUntil ?? null,
      recurrenceGroupId: editingCalendarEvent?.recurrenceGroupId ?? null,
      done: editingCalendarEvent?.done ?? false,
    };

    const wasEditing = Boolean(editingCalendarEvent);
    let savedEvent: CalendarEvent;
    if (editingCalendarEvent && recurringEditScope === "occurrence" && isRecurringEvent(editingCalendarEvent)) {
      const baseId = calendarOccurrenceBaseId(editingCalendarEvent);
      const occurrenceDate = calendarOccurrenceDate(editingCalendarEvent, todayDateKey);
      const result = await saveOverride({
        calendarEventId: baseId,
        occurrenceDate,
        title: payload.title,
        time: payload.time,
        endTime: payload.endTime ?? null,
        color: payload.color,
        iconKey: payload.iconKey ?? null,
        activityTypeKey: payload.activityTypeKey ?? null,
        isCancelled: false,
      });
      savedEvent = { ...editingCalendarEvent, ...payload, parentEventId: baseId, occurrenceDate, isOccurrenceOverride: true };
      if (!result.ok) showToast("El cambio quedó temporal, pero no se pudo sincronizar.", "error");
    } else {
      const targetId = editingCalendarEvent ? calendarOccurrenceBaseId(editingCalendarEvent) : null;
      savedEvent = editingCalendarEvent && targetId
        ? await updateEvent(targetId, payload)
        : await createEvent(payload);
    }

    let alarmSynced = true;
    if (alarmOn) {
      const result = await upsertCalendarReminder(calendarOccurrenceBaseId(savedEvent), {
        title: `Alerta: ${cleanTitle}`,
        time,
        repeat: (savedEvent.recurrenceType === "daily" ? "daily" : "custom") as Reminder["repeat"],
        calendarEventId: calendarOccurrenceBaseId(savedEvent),
      });
      alarmSynced = result.ok;
    } else if (editingCalendarEvent) {
      alarmSynced = await deleteCalendarEventReminders(calendarOccurrenceBaseId(editingCalendarEvent));
    }

    setFormOpen(false);
    resetForm();
    if (!alarmSynced) {
      showToast("Tarea guardada, pero la alarma no se pudo sincronizar.", "error");
      return;
    }
    showToast(wasEditing ? "Tarea actualizada en Hoy y Calendario" : "Tarea creada y agregada al calendario de hoy");
  }

  function openNewTask() {
    resetForm();
    const now = new Date();
    setTime(`${String(now.getHours()).padStart(2, "0")}:00`);
    setFormOpen(true);
  }

  function requestCalendarEventEditor(event: CalendarEvent) {
    if (isChallengeCalendarEvent(event)) {
      showToast("Las tareas de reto están bloqueadas para cuidar la medición.", "error");
      return;
    }
    if (isRecurringEvent(event)) {
      setPendingRecurringEvent(event);
      return;
    }
    openCalendarEventEditor(event, "series");
  }

  function openCalendarEventEditor(event: CalendarEvent, scope: "series" | "occurrence" = "series") {
    setRecurringEditScope(scope);
    setEditingCalendarEvent(event);
    setTaskTitle(stripEmoji(event.title));
    setTime(event.time);
    setColor(event.color as TaskColor);
    setActivityTypeKey(inferActivityTypeFromEvent(event).key);
    setAlarmOn(reminderEventIds.has(calendarOccurrenceBaseId(event)));
    setErrors({});
    setFormOpen(true);
  }

  async function toggleCalendarReminder(event: CalendarEvent) {
    const baseId = calendarOccurrenceBaseId(event);
    const hasReminder = reminderEventIds.has(baseId);
    if (hasReminder) {
      const ok = await deleteCalendarEventReminders(baseId);
      showToast(ok ? "Alarma apagada" : "No se pudo apagar la alarma", ok ? "success" : "error");
      return;
    }
    const result = await upsertCalendarReminder(baseId, {
      title: `Alerta: ${stripEmoji(event.title)}`,
      time: event.time,
      repeat: (event.recurrenceType === "daily" ? "daily" : "custom") as Reminder["repeat"],
      calendarEventId: baseId,
    });
    showToast(result.ok ? "Alarma activada" : "No se pudo activar la alarma", result.ok ? "success" : "error");
  }


  function handleEditTask(blockId: string, taskId: string, title: string) {
    if (title.trim().length < 3) return;
    editTask(blockId, taskId, title);
    showToast("Tarea actualizada");
  }

  function handleReminderChange(blockId: string, taskId: string, reminderAt: string | null) {
    updateTaskReminder(blockId, taskId, reminderAt);
    showToast(reminderAt ? "Recordatorio activado" : "Recordatorio apagado");
  }

  function handleDeleteTask(blockId: string, taskId: string) {
    deleteTask(blockId, taskId);
    setSelectedBlock(null);
    setSelectedTask(null);
    showToast("Tarea eliminada");
  }

  function toggleCalendarEvent(event: CalendarEvent) {
    const currentDone = getCalendarEventDone(event, todayDateKey, completionMap);
    const nextDone = !currentDone;
    const occurrenceKey = todayOccurrenceKey(event, todayDateKey);

    if (nextDone) {
      setCompletingCalendarKeys((current) => new Set(current).add(occurrenceKey));
      setUndoCompleted({ key: occurrenceKey, event });
      window.setTimeout(() => {
        setCompletingCalendarKeys((current) => {
          const next = new Set(current);
          next.delete(occurrenceKey);
          return next;
        });
      }, 640);
      window.setTimeout(() => {
        setUndoCompleted((current) => (current?.key === occurrenceKey ? null : current));
      }, 5200);
    } else {
      setUndoCompleted((current) => (current?.key === occurrenceKey ? null : current));
      setCompletingCalendarKeys((current) => {
        const next = new Set(current);
        next.delete(occurrenceKey);
        return next;
      });
    }

    if (isChallengeCalendarEvent(event) && nextDone) {
      showToast("Reto cumplido por hoy. Revisá tus bananas en Retos 🍌");
    }

    if (isRecurringEvent(event)) {
      void setCompletion(calendarOccurrenceBaseId(event), calendarOccurrenceDate(event, todayDateKey), nextDone);
    } else {
      const { id: _id, ...input } = event;
      void updateEvent(event.id, { ...input, done: nextDone });
    }
    showToast(nextDone ? "Actividad completada" : "Actividad pendiente");
  }

  function undoLastCompletion() {
    if (!undoCompleted) return;
    const event = undoCompleted.event;
    if (isRecurringEvent(event)) {
      void setCompletion(calendarOccurrenceBaseId(event), calendarOccurrenceDate(event, todayDateKey), false);
    } else {
      const { id: _id, ...input } = event;
      void updateEvent(event.id, { ...input, done: false });
    }
    setCompletingCalendarKeys((current) => {
      const next = new Set(current);
      next.delete(undoCompleted.key);
      return next;
    });
    setUndoCompleted(null);
    showToast("Actividad recuperada");
  }

  async function refreshToday() {
    await Promise.all([refreshTasks(), refreshEvents()]);
    showToast("Hoy actualizado");
  }

  const freshSelectedBlock = selectedBlock ? blocks.find((block) => block.id === selectedBlock.id) ?? null : null;
  const freshSelectedTask = freshSelectedBlock && selectedTask ? freshSelectedBlock.tasks.find((task) => task.id === selectedTask.id) ?? null : null;

  return (
    <AppShell>
      <Toast toast={toast} onClose={() => setToast(null)} />
      <section className="page-pad pt-8">
        <header className="flex items-center justify-between">
          <div><p className="text-sm font-medium text-monkey-muted">¡Hola! 👋</p><h1 className="text-[22px] font-black tracking-tight">Hoy es un gran día</h1></div>
          <button className="grid h-12 w-12 place-items-center rounded-full bg-white shadow-card"><MonkeyAvatar size={34} variant="face" /></button>
        </header>
        <div className="mt-5"><ProgressCard percent={combinedPercent} /></div>
        <div className="mt-5 flex min-h-11 items-center justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-left text-lg font-black tracking-tight">{todayLabel}</h2>
            <p className="mt-0.5 text-[11px] font-bold text-monkey-muted">
              {tasksSyncing || calendarSyncing || completionSyncStatus === "loading" ? "Actualizando…" : calendarError || completionError ? "Revisá la sincronización" : calendarSyncStatus === "saving" || completionSyncStatus === "saving" ? "Guardando…" : "Sincronizado"}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Link href="/analytics" className="grid h-11 w-11 place-items-center rounded-full bg-white shadow-card transition active:scale-95" aria-label="Ver analítica"><BarChart3 className="h-4 w-4 text-monkey-purple" /></Link>
            <Link href="/welcome?review=1" className="grid h-11 w-11 place-items-center rounded-full bg-white shadow-card transition active:scale-95" aria-label="Guía de uso de Monkey Checks"><BookOpen className="h-4 w-4 text-monkey-green" /></Link>
            <button type="button" onClick={refreshToday} className="grid h-11 w-11 place-items-center rounded-full bg-white shadow-card transition active:scale-95" aria-label="Actualizar Hoy"><RefreshCw className="h-4 w-4 text-monkey-muted" /></button>
            <Link href="/calendar" className="grid h-12 w-12 place-items-center rounded-full bg-white shadow-card transition active:scale-95" aria-label="Ir al calendario"><CalendarDays className="h-5 w-5 text-monkey-muted" /></Link>
          </div>
        </div>
        <div className="mt-3 space-y-3">
          {agendaItems.length === 0 ? <EmptyState title="Tu día está limpio" body="Agregá tu primera tarea o actividad para empezar con buen ritmo." /> : null}
          {agendaItems.map((item) => item.type === "task" ? (
            <TimeBlockCard key={item.id} block={item.block} onToggle={toggleTask} onOpen={(openedBlock) => { setSelectedBlock(openedBlock); setSelectedTask(openedBlock.tasks[0] ?? null); }} onTaskOpen={(openedBlock, openedTask) => { setSelectedBlock(openedBlock); setSelectedTask(openedTask); }} />
          ) : (
            <CalendarTodayCard
              key={item.id}
              event={item.event}
              done={getCalendarEventDone(item.event, todayDateKey, completionMap)}
              sourceLabel={isRecurringEvent(item.event) ? "Recurrente" : "Calendario"}
              contextLabel={containingLongEvent(calendarTodayEvents, item.event) ? `Dentro de ${stripEmoji(containingLongEvent(calendarTodayEvents, item.event)!.title)}` : null}
              hasReminder={reminderEventIds.has(calendarOccurrenceBaseId(item.event))}
              isCompleting={completingCalendarKeys.has(todayOccurrenceKey(item.event, todayDateKey))}
              onToggle={toggleCalendarEvent}
              onEdit={requestCalendarEventEditor}
              onToggleReminder={toggleCalendarReminder}
            />
          ))}
        </div>
      </section>
      <button onClick={openNewTask} className="fixed bottom-[104px] right-[calc(50%-195px)] z-30 grid h-16 w-16 place-items-center rounded-full bg-monkey-green text-white shadow-float transition active:scale-95" aria-label="Agregar tarea"><Plus className="h-8 w-8" /></button>
      {undoCompleted ? (
        <div className="fixed bottom-[88px] left-1/2 z-40 flex -translate-x-1/2 items-center gap-2 rounded-full border border-black/5 bg-white/95 px-3 py-2 text-xs font-black text-monkey-ink shadow-soft backdrop-blur-xl animate-pop">
          <span className="grid h-6 w-6 place-items-center rounded-full bg-green-50 text-monkey-green">✓</span>
          <span>Completada</span>
          <button type="button" onClick={undoLastCompletion} className="rounded-full bg-gray-100 px-3 py-1 text-monkey-greenDark transition active:scale-95">Deshacer</button>
        </div>
      ) : null}
      <FormSheet open={formOpen} title={editingCalendarEvent ? "Editar tarea" : "Nueva tarea"} subtitle={editingCalendarEvent ? "Los cambios se actualizan también en Calendario." : "Creá una tarea rápida para hoy. También aparecerá en Calendario."} onClose={() => { setFormOpen(false); resetForm(); }} onSubmit={submitTask} submitLabel={editingCalendarEvent ? "Guardar cambios" : "Crear tarea"}>
        <Field label="Tarea" value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} placeholder="Ej: Repasar matemáticas" error={errors.title} />
        <Field label="Hora" value={time} onChange={(e) => setTime(e.target.value)} placeholder="09:00" error={errors.time} />
        <div>
          <span className="mb-2 block text-xs font-black uppercase tracking-[.08em] text-monkey-muted">Alarma</span>
          <button
            type="button"
            onClick={() => setAlarmOn((value) => !value)}
            className={cn(
              "flex h-12 w-full items-center justify-between rounded-[18px] border px-4 text-sm font-black transition active:scale-[.99]",
              alarmOn ? "border-green-200 bg-green-50 text-monkey-green" : "border-gray-100 bg-gray-50 text-monkey-muted",
            )}
          >
            <span>{alarmOn ? "Alarma activa a la hora indicada" : "Sin alarma"}</span>
            {alarmOn ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
          </button>
        </div>
        
        <ActivityTypePicker label="Tipo de actividad" value={activityTypeKey} onChange={setActivityTypeKey} />
      </FormSheet>
      <FormSheet
        open={!!pendingRecurringEvent}
        title="Editar repetición"
        subtitle="Esta actividad se repite. Elegí si querés cambiar solo esta fecha o toda la repetición."
        onClose={() => setPendingRecurringEvent(null)}
        onSubmit={() => {
          if (pendingRecurringEvent) openCalendarEventEditor(pendingRecurringEvent, "occurrence");
          setPendingRecurringEvent(null);
        }}
        submitLabel="Solo esta fecha"
      >
        <div className="grid gap-3">
          <button
            type="button"
            onClick={() => {
              if (pendingRecurringEvent) openCalendarEventEditor(pendingRecurringEvent, "occurrence");
              setPendingRecurringEvent(null);
            }}
            className="rounded-[20px] bg-green-50 p-4 text-left transition active:scale-[.99]"
          >
            <strong className="block text-sm font-black text-monkey-greenDark">Solo esta fecha</strong>
            <span className="mt-1 block text-xs leading-5 text-monkey-muted">Ajusta únicamente la ocurrencia de hoy. Las próximas repeticiones siguen iguales.</span>
          </button>
          <button
            type="button"
            onClick={() => {
              if (pendingRecurringEvent) openCalendarEventEditor(pendingRecurringEvent, "series");
              setPendingRecurringEvent(null);
            }}
            className="rounded-[20px] bg-gray-50 p-4 text-left transition active:scale-[.99]"
          >
            <strong className="block text-sm font-black text-monkey-ink">Toda la repetición</strong>
            <span className="mt-1 block text-xs leading-5 text-monkey-muted">Actualiza la actividad base y todas las repeticiones futuras.</span>
          </button>
        </div>
      </FormSheet>
      <TaskDetailSheet open={!!freshSelectedBlock} block={freshSelectedBlock} task={freshSelectedTask} onClose={() => setSelectedBlock(null)} onToggle={toggleTask} onEdit={handleEditTask} onReminderChange={handleReminderChange} onDelete={handleDeleteTask} />
    </AppShell>
  );
}
