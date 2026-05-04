"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Bell, BellOff, CalendarDays, Check, Plus, RefreshCw } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { MonkeyAvatar } from "@/components/monkey-avatar";
import { ProgressCard } from "@/components/progress-card";
import { TimeBlockCard } from "@/components/time-block-card";
import { TaskDetailSheet } from "@/components/task-detail-sheet";
import { FormSheet } from "@/components/form-sheet";
import { Field } from "@/components/field";
import { Toast, ToastState } from "@/components/toast";
import { EmptyState } from "@/components/empty-state";
import { AssetPicker } from "@/components/asset-picker";
import { AssetThumb } from "@/components/asset-thumb";
import { activityAssetGallery } from "@/lib/asset-library";
import { useTasks } from "@/hooks/use-tasks";
import { useCalendarEvents } from "@/hooks/use-calendar-events";
import { useCalendarCompletions } from "@/hooks/use-calendar-completions";
import { cn } from "@/lib/utils";
import { getCalendarEventDone, isRecurringEvent } from "@/lib/calendar/calendar-utils";
import type { CalendarEvent, Task, TaskColor, TimeBlock } from "@/types";

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
  const lower = event.title.toLowerCase();
  if (lower.includes("comida") || lower.includes("almuerzo") || lower.includes("fruta")) return "calendar-food";
  if (lower.includes("clase")) return "calendar-class";
  if (lower.includes("gym") || lower.includes("ejercicio")) return "calendar-exercise";
  if (lower.includes("descanso")) return "calendar-rest";
  if (lower.includes("proyecto")) return "calendar-project";
  return calendarStyleMap[event.color]?.icon ?? "calendar-task";
}

function CalendarTodayCard({
  event,
  done,
  sourceLabel,
  contextLabel,
  onToggle,
}: {
  event: CalendarEvent;
  done: boolean;
  sourceLabel: string;
  contextLabel?: string | null;
  onToggle: (event: CalendarEvent) => void;
}) {
  const style = calendarStyleMap[event.color] ?? calendarStyleMap.blue;
  return (
    <article className={cn("animate-slideUp rounded-card border p-4 shadow-sm", style.card)}>
      <div className="grid min-w-0 grid-cols-[54px_minmax(0,1fr)] gap-1">
        <div className="pt-1 text-[13px] font-black">{event.time}</div>
        <div className="min-w-0">
          <div className="flex max-w-full min-w-0 items-center text-left text-[15px] font-black text-monkey-ink">
            <AssetThumb icon={calendarIcon(event)} size={28} className="mr-2 shrink-0 rounded-[10px] bg-white/60 p-1" />
            <span className="min-w-0 truncate">{stripEmoji(event.title)}</span>
          </div>
          <div className="mt-1 flex min-w-0 flex-wrap items-center gap-1.5">
            <span className="rounded-full bg-white/70 px-2 py-1 text-[9px] font-black uppercase tracking-[.08em] text-monkey-muted">{sourceLabel}</span>
            {contextLabel ? <span className="min-w-0 truncate rounded-full bg-white/70 px-2 py-1 text-[9px] font-black text-monkey-muted">{contextLabel}</span> : null}
          </div>
          <div className="mt-2">
            <button
              type="button"
              onClick={() => onToggle(event)}
              className="flex min-h-10 w-full min-w-0 items-center gap-2 overflow-hidden rounded-[14px] bg-white/75 px-3 text-left text-[13px] text-monkey-ink transition active:scale-[.98]"
            >
              <span className={cn("min-w-0 flex-1 truncate", done && "text-gray-400 line-through")}>{stripEmoji(event.title)}</span>
              <span className="shrink-0 rounded-pill bg-green-50 px-2 py-1 text-[10px] font-black text-monkey-green">{eventRangeLabel(event)}</span>
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-gray-100 text-gray-400" title="Actividad del calendario">
                {event.endTime ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
              </span>
              <span
                className={cn(
                  "grid h-6 w-6 shrink-0 place-items-center rounded-full border-2 transition",
                  done ? "animate-checkPulse border-monkey-green bg-monkey-green text-white" : "border-gray-300 bg-white",
                )}
              >
                {done ? <Check className="h-3.5 w-3.5" /> : null}
              </span>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

export default function TodayPage() {
  const { blocks, percent, syncing: tasksSyncing, toggleTask, createTask, editTask, updateTaskReminder, deleteTask, refreshTasks } = useTasks();
  const { events: calendarEvents, updateEvent, refreshEvents, syncing: calendarSyncing, syncStatus: calendarSyncStatus, lastError: calendarError } = useCalendarEvents();
  const { completionMap, syncStatus: completionSyncStatus, lastError: completionError, setCompletion } = useCalendarCompletions();
  const [selectedBlock, setSelectedBlock] = useState<TimeBlock | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  const [blockTitle, setBlockTitle] = useState("Nuevo bloque");
  const [time, setTime] = useState("09:00");
  const [color, setColor] = useState<TaskColor>("green");
  const [icon, setIcon] = useState("activity-study");
  const [errors, setErrors] = useState<{ title?: string; time?: string }>({});
  const [toast, setToast] = useState<ToastState>(null);
  const todayLabel = useMemo(() => formatTodayDate(), []);
  const todayDateKey = useMemo(() => toDateKey(new Date()), []);

  const visibleBlocks = useMemo(() => blocks.filter((block) => !block.date || block.date === todayDateKey), [blocks, todayDateKey]);

  const calendarTodayEvents = useMemo(() => {
    return calendarEvents
      .filter((event) => eventOccursOnDate(event, todayDateKey))
      .sort((a, b) => a.time.localeCompare(b.time));
  }, [calendarEvents, todayDateKey]);

  const combinedPercent = useMemo(() => {
    const taskList = visibleBlocks.flatMap((block) => block.tasks);
    const total = taskList.length + calendarTodayEvents.length;
    if (total === 0) return percent;
    const done = taskList.filter((task) => task.done).length + calendarTodayEvents.filter((event) => getCalendarEventDone(event, todayDateKey, completionMap)).length;
    return Math.round((done / total) * 100);
  }, [visibleBlocks, calendarTodayEvents, completionMap, todayDateKey, percent]);

  const agendaItems = useMemo(() => {
    return [
      ...visibleBlocks.map((block) => ({ id: `task-${block.id}`, type: "task" as const, time: block.time, block })),
      ...calendarTodayEvents.map((event) => ({ id: `calendar-${event.id}`, type: "calendar" as const, time: event.time, event })),
    ].sort((a, b) => a.time.localeCompare(b.time));
  }, [visibleBlocks, calendarTodayEvents]);

  function showToast(message: string, type: "success" | "error" = "success") {
    setToast({ message, type });
    window.setTimeout(() => setToast(null), 2200);
  }

  function resetForm() {
    setTaskTitle("");
    setBlockTitle("Nuevo bloque");
    setTime("09:00");
    setColor("green");
    setIcon("activity-study");
    setErrors({});
  }

  function submitTask() {
    const nextErrors: { title?: string; time?: string } = {};
    if (taskTitle.trim().length < 3) nextErrors.title = "Escribí al menos 3 caracteres.";
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) nextErrors.time = "Usá formato HH:MM, por ejemplo 09:00.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    createTask({ title: taskTitle, time, blockTitle, color, icon, date: todayDateKey });
    setFormOpen(false);
    resetForm();
    showToast("Tarea creada con éxito");
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
    if (isRecurringEvent(event)) {
      void setCompletion(event.id, todayDateKey, nextDone);
    } else {
      const { id: _id, ...input } = event;
      void updateEvent(event.id, { ...input, done: nextDone });
    }
    showToast(nextDone ? "Actividad completada" : "Actividad pendiente");
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
              onToggle={toggleCalendarEvent}
            />
          ))}
        </div>
      </section>
      <button onClick={() => setFormOpen(true)} className="fixed bottom-[104px] right-[calc(50%-195px)] z-30 grid h-16 w-16 place-items-center rounded-full bg-monkey-green text-white shadow-float transition active:scale-95" aria-label="Agregar tarea"><Plus className="h-8 w-8" /></button>
      <FormSheet open={formOpen} title="Nueva tarea" subtitle="Creá una tarea rápida y asignala a un bloque de hora." onClose={() => { setFormOpen(false); resetForm(); }} onSubmit={submitTask} submitLabel="Crear tarea">
        <Field label="Tarea" value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} placeholder="Ej: Repasar matemáticas" error={errors.title} />
        <Field label="Hora" value={time} onChange={(e) => setTime(e.target.value)} placeholder="09:00" error={errors.time} />
        <Field label="Nombre del bloque" value={blockTitle} onChange={(e) => setBlockTitle(e.target.value)} placeholder="Estudiar" />
        <div><span className="mb-2 block text-xs font-black uppercase tracking-[.08em] text-monkey-muted">Color</span><div className="grid min-w-0 grid-cols-2 gap-2 sm:grid-cols-3">{blockColors.map((item) => <button key={item} type="button" onClick={() => setColor(item)} className={`h-10 min-w-0 rounded-pill px-2 text-xs font-black ${color === item ? "bg-monkey-green text-white" : "bg-gray-100 text-monkey-muted"}`}><span className="block truncate">{colorLabels[item]}</span></button>)}</div></div>
        <AssetPicker label="Ícono de actividad" assets={activityAssetGallery} value={icon} onChange={setIcon} />
      </FormSheet>
      <TaskDetailSheet open={!!freshSelectedBlock} block={freshSelectedBlock} task={freshSelectedTask} onClose={() => setSelectedBlock(null)} onToggle={toggleTask} onEdit={handleEditTask} onReminderChange={handleReminderChange} onDelete={handleDeleteTask} />
    </AppShell>
  );
}
