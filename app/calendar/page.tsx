"use client";

import { type ChangeEvent, useEffect, useMemo, useState } from "react";
import {
  Bell,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Plus,
  Trash2,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { ConfirmSheet } from "@/components/confirm-sheet";
import { EmptyState } from "@/components/empty-state";
import { Field } from "@/components/field";
import { FormSheet } from "@/components/form-sheet";
import { Toast, ToastState } from "@/components/toast";
import { AssetThumb } from "@/components/asset-thumb";
import { ActivityTypePicker } from "@/components/activity-type-picker";
import { useCalendarEvents } from "@/hooks/use-calendar-events";
import { useReminders } from "@/hooks/use-reminders";
import type { CalendarEvent, CalendarRecurrenceType, Reminder } from "@/types";
import { cn } from "@/lib/utils";
import { CalendarHeader } from "@/components/calendar/calendar-header";
import { CalendarViewToggle, type CalendarViewMode } from "@/components/calendar/calendar-view-toggle";
import { CalendarWeekStrip } from "@/components/calendar/calendar-week-strip";
import { CalendarDaySummary } from "@/components/calendar/calendar-day-summary";
import { CalendarMonthView } from "@/components/calendar/calendar-month-view";
import { CalendarTimeline } from "@/components/calendar/calendar-timeline";
import { useCalendarOverrides } from "@/hooks/use-calendar-overrides";
import { useCalendarCompletions } from "@/hooks/use-calendar-completions";
import { ACTIVITY_TYPES, activityTypePillClass, inferActivityTypeFromEvent } from "@/lib/activity-types";
import { applyCalendarOverridesForDate, calendarOccurrenceBaseId, calendarOccurrenceDate, getCalendarEventDone, isRecurringEvent } from "@/lib/calendar/calendar-utils";
import { useCategoryPreferences } from "@/hooks/use-category-preferences";
import { resolveActivityCategoryMeta } from "@/lib/category-catalog";
import { isChallengeCalendarEvent } from "@/lib/challenges";

const weekLabels = ["LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB", "DOM"];
const dayLetters = ["L", "M", "X", "J", "V", "S", "D"];
const monthNames = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];
const timelineHours = Array.from({ length: 24 }, (_, hour) => `${String(hour).padStart(2, "0")}:00`);

const DEFAULT_DURATION_MINUTES = 60;
const MAX_VISIBLE_EVENTS_PER_HOUR = 2;

type CalendarSheetMode = "closed" | "event" | "settings" | "month" | "recurrence" | "recurringScope";
type RecurringAction = "edit" | "delete";
type RecurringScope = "series" | "occurrence";
type AlertOption = "none" | "exact" | "5" | "15" | "30";
type RecurrenceType = CalendarRecurrenceType;

type MonthCell = {
  key: string;
  day: number | null;
  dateKey: string | null;
};

type CalendarFormErrors = {
  title?: string;
  time?: string;
  endTime?: string;
};

type CategoryMeta = {
  key: string;
  label: string;
  iconKey: string;
  color: CalendarEvent["color"];
  pillClass: string;
};

const alertOptions: { id: AlertOption; label: string; offset: number | null }[] = [
  { id: "none", label: "Sin alerta", offset: null },
  { id: "exact", label: "A la hora exacta", offset: 0 },
  { id: "5", label: "5 min antes", offset: 5 },
  { id: "15", label: "15 min antes", offset: 15 },
  { id: "30", label: "30 min antes", offset: 30 },
];

const recurrenceOptions: { id: RecurrenceType; label: string; helper: string }[] = [
  { id: "none", label: "No se repite", helper: "Solo este día" },
  { id: "daily", label: "Todos los días", helper: "A la misma hora" },
  { id: "custom_days", label: "Días específicos", helper: "Elegí los días" },
];

const recurrenceWeekdays = [
  { jsDay: 1, short: "L", label: "Lunes" },
  { jsDay: 2, short: "M", label: "Martes" },
  { jsDay: 3, short: "X", label: "Miércoles" },
  { jsDay: 4, short: "J", label: "Jueves" },
  { jsDay: 5, short: "V", label: "Viernes" },
  { jsDay: 6, short: "S", label: "Sábado" },
  { jsDay: 0, short: "D", label: "Domingo" },
];

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

function isValidDateKey(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = fromDateKey(value);
  return !Number.isNaN(date.getTime()) && toDateKey(date) === value;
}

function getMonday(date: Date) {
  const copy = new Date(date);
  const day = copy.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  copy.setDate(copy.getDate() + diff);
  return copy;
}

function getWeekDates(date: Date) {
  const monday = getMonday(date);
  return Array.from({ length: 7 }, (_, index) => {
    const next = new Date(monday);
    next.setDate(monday.getDate() + index);
    return next;
  });
}

function addMonths(date: Date, amount: number) {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}

function getMonthCells(date: Date): MonthCell[] {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startOffset = (firstDay.getDay() + 6) % 7;
  const totalCells = Math.ceil((startOffset + daysInMonth) / 7) * 7;

  return Array.from({ length: totalCells }, (_, index) => {
    const day = index - startOffset + 1;
    if (day < 1 || day > daysInMonth) return { key: `empty-${index}`, day: null, dateKey: null };
    return { key: `${year}-${month}-${day}`, day, dateKey: toDateKey(new Date(year, month, day)) };
  });
}

function normalizeEventDate(event: CalendarEvent, fallbackDateKey: string) {
  return event.date || fallbackDateKey;
}

function isValidTime(value: string) {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}

function timeToMinutes(value: string) {
  const [hour = "0", minute = "0"] = value.split(":");
  return Number(hour) * 60 + Number(minute);
}

function minutesToHoursLabel(minutes: number) {
  const hours = minutes / 60;
  if (Number.isInteger(hours)) return `${hours} h`;
  return `${hours.toFixed(1).replace(".0", "")} h`;
}

function formatLongDate(date: Date) {
  return new Intl.DateTimeFormat("es-CR", { weekday: "long", day: "numeric", month: "long" }).format(date);
}

function formatShortDate(date: Date) {
  return new Intl.DateTimeFormat("es-CR", { day: "numeric", month: "short" }).format(date);
}

function dateKeyToJsDay(dateKey: string) {
  return fromDateKey(dateKey).getDay();
}

function compareDateKeys(a: string, b: string) {
  return a.localeCompare(b);
}

function eventOccursOnDate(event: CalendarEvent, dateKey: string) {
  const recurrenceType = event.recurrenceType ?? "none";
  const startDate = event.date;
  if (recurrenceType === "none") return startDate === dateKey;
  if (compareDateKeys(dateKey, startDate) < 0) return false;
  if (event.recurrenceUntil && compareDateKeys(dateKey, event.recurrenceUntil) > 0) return false;
  if (recurrenceType === "daily") return true;
  if (recurrenceType === "custom_days") return (event.recurrenceDays ?? []).includes(dateKeyToJsDay(dateKey));
  return false;
}

function recurrenceSummary(type: RecurrenceType, days: number[], until?: string | null) {
  if (type === "none") return "No se repite";
  const untilLabel = until && isValidDateKey(until) ? ` · hasta ${formatShortDate(fromDateKey(until))}` : "";
  if (type === "daily") return `Todos los días${untilLabel}`;
  const selected = recurrenceWeekdays
    .filter((day) => days.includes(day.jsDay))
    .map((day) => day.short)
    .join(", ");
  return `${selected || "Elegí días"}${untilLabel}`;
}

function stripEmoji(title: string) {
  return title.replace(/^[^\p{L}\p{N}]+\s*/u, "").trim() || title.trim();
}

function categoryFromEvent(event: CalendarEvent): CategoryMeta {
  const activityType = inferActivityTypeFromEvent(event);
  return {
    key: activityType.key,
    label: activityType.label,
    iconKey: event.iconKey ?? activityType.iconKey,
    color: activityType.color,
    pillClass: activityTypePillClass(activityType.color),
  };
}

function createReminderTime(dateKey: string, time: string, alertOption: AlertOption) {
  const selected = alertOptions.find((item) => item.id === alertOption);
  if (!selected || selected.offset === null) return null;
  const date = new Date(`${dateKey}T${time}:00`);
  if (Number.isNaN(date.getTime())) return null;
  date.setMinutes(date.getMinutes() - selected.offset);
  return date.toLocaleTimeString("es-CR", { hour: "2-digit", minute: "2-digit", hour12: false });
}

function inferAlertOption(eventTime: string, reminderTime?: string | null): AlertOption {
  if (!reminderTime || !isValidTime(eventTime) || !isValidTime(reminderTime)) return "none";
  const eventMinutes = timeToMinutes(eventTime);
  const reminderMinutes = timeToMinutes(reminderTime);
  const diff = eventMinutes - reminderMinutes;
  if (diff === 0) return "exact";
  if (diff === 5) return "5";
  if (diff === 15) return "15";
  if (diff === 30) return "30";
  return "exact";
}

function eventStartHour(event: CalendarEvent) {
  return Math.floor(timeToMinutes(event.time) / 60) * 60;
}

function eventEndMinutes(event: CalendarEvent) {
  if (event.endTime && isValidTime(event.endTime)) return timeToMinutes(event.endTime);
  return timeToMinutes(event.time) + DEFAULT_DURATION_MINUTES;
}

function isLongEvent(event: CalendarEvent) {
  return Boolean(event.endTime && isValidTime(event.endTime) && eventEndMinutes(event) > timeToMinutes(event.time) + DEFAULT_DURATION_MINUTES);
}

function eventsForHour(events: CalendarEvent[], hour: string) {
  const hourStart = timeToMinutes(hour);
  return events.filter((event) => eventStartHour(event) === hourStart);
}

function isCoveredByPreviousLongEvent(events: CalendarEvent[], hour: string) {
  const hourStart = timeToMinutes(hour);
  return events.some((event) => {
    const start = timeToMinutes(event.time);
    const end = eventEndMinutes(event);
    return end - start > DEFAULT_DURATION_MINUTES && start < hourStart && end > hourStart;
  });
}

function eventRangeLabel(event: CalendarEvent) {
  if (!event.endTime || !isValidTime(event.endTime)) return event.time;
  const duration = eventEndMinutes(event) - timeToMinutes(event.time);
  if (duration <= 0) return event.time;
  return `${event.time}–${event.endTime} · ${minutesToHoursLabel(duration)}`;
}

function hourLabelFromMinutes(minutes: number) {
  return `${String(Math.floor(minutes / 60)).padStart(2, "0")}:00`;
}

function eventInterval(event: CalendarEvent) {
  const start = timeToMinutes(event.time);
  const end = eventEndMinutes(event);
  return { start, end, startHour: Math.floor(start / 60) * 60 };
}

function proposedInterval(startTime: string, endTimeValue?: string | null) {
  const start = timeToMinutes(startTime);
  const end = endTimeValue && isValidTime(endTimeValue) ? timeToMinutes(endTimeValue) : start + DEFAULT_DURATION_MINUTES;
  return { start, end, startHour: Math.floor(start / 60) * 60 };
}

function findScheduleConflict(events: CalendarEvent[], proposedStart: string, proposedEnd: string | null, editingId?: string): CalendarEvent | null {
  // v2.13.6: una actividad larga funciona como bloque principal, no como bloqueo duro.
  // Permitimos actividades internas (ej. 07:00–17:00 + una actividad a las 09:00)
  // para que el calendario pueda mostrar tareas anidadas dentro del rango.
  return null;
}

function containingLongEventLabel(events: CalendarEvent[], child: CalendarEvent) {
  const childStart = timeToMinutes(child.time);
  const parent = events.find((candidate) => {
    if (candidate.id === child.id) return false;
    if (!isLongEvent(candidate)) return false;
    const interval = eventInterval(candidate);
    return interval.start <= childStart && interval.end > childStart;
  });
  return parent ? `Dentro de ${stripEmoji(parent.title)}` : "Dentro de una actividad larga";
}

function getVisibleTimelineHours(events: CalendarEvent[]) {
  if (events.length === 0) return [];

  const startHours = events.map((event) => Math.floor(timeToMinutes(event.time) / 60));
  const firstHour = Math.max(0, Math.min(23, Math.min(...startHours)));
  const finalHour = Math.max(firstHour, Math.min(23, Math.max(...startHours)));

  return timelineHours.filter((hour) => {
    const value = Number(hour.slice(0, 2));
    return value >= firstHour && value <= finalHour;
  });
}


function RecurrenceControl({
  summary,
  onOpen,
}: {
  summary: string;
  onOpen: () => void;
}) {
  return (
    <div>
      <span className="mb-2 block text-xs font-black uppercase tracking-[.08em] text-monkey-muted">Repetir</span>
      <button
        type="button"
        onClick={onOpen}
        className="flex h-12 w-full min-w-0 items-center justify-between gap-3 rounded-[18px] border border-gray-100 bg-gray-50 px-4 text-left text-sm font-black text-monkey-ink transition active:scale-[.99]"
      >
        <span className="min-w-0 truncate">{summary}</span>
        <ChevronRight className="h-4 w-4 shrink-0 text-monkey-muted" />
      </button>
    </div>
  );
}

function CompactSelect<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { id: T; label: string; icon?: string }[];
  onChange: (value: T) => void;
}) {
  return (
    <label className="block min-w-0">
      <span className="mb-2 block text-xs font-black uppercase tracking-[.08em] text-monkey-muted">{label}</span>
      <div className="relative">
        <select
          value={value}
          onChange={(event: ChangeEvent<HTMLSelectElement>) => onChange(event.target.value as T)}
          className="h-12 w-full appearance-none rounded-[18px] border border-gray-100 bg-gray-50 px-4 pr-10 text-sm font-black text-monkey-ink outline-none transition focus:border-green-200 focus:bg-white"
        >
          {options.map((option) => (
            <option key={option.id} value={option.id}>
              {option.icon ? `${option.icon} ` : ""}{option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-monkey-muted" />
      </div>
    </label>
  );
}


function ActivityTypeSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return <ActivityTypePicker value={value} onChange={onChange} />;
}

export default function CalendarPage() {
  const { events, syncing, syncStatus, lastError, createEvent, updateEvent, deleteEvent } = useCalendarEvents();
  const { overrides, saveOverride } = useCalendarOverrides();
  const { completionMap } = useCalendarCompletions();
  const { activityItems } = useCategoryPreferences();
  const { items: reminders, upsertCalendarReminder, deleteCalendarEventReminders, lastError: reminderSyncError } = useReminders();
  const [viewMode, setViewMode] = useState<CalendarViewMode>("week");
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [sheetMode, setSheetMode] = useState<CalendarSheetMode>("closed");
  const [editing, setEditing] = useState<CalendarEvent | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [time, setTime] = useState("09:00");
  const [endTime, setEndTime] = useState("");
  const [activityTypeKey, setActivityTypeKey] = useState("study");
  const [alertOption, setAlertOption] = useState<AlertOption>("none");
  const [recurrenceType, setRecurrenceType] = useState<RecurrenceType>("none");
  const [recurrenceDays, setRecurrenceDays] = useState<number[]>([]);
  const [recurrenceUntil, setRecurrenceUntil] = useState("");
  const [errors, setErrors] = useState<CalendarFormErrors>({});
  const [toast, setToast] = useState<ToastState>(null);
  const [expandedHourKey, setExpandedHourKey] = useState<string | null>(null);
  const [recurringScope, setRecurringScope] = useState<RecurringScope>("series");
  const [pendingRecurringAction, setPendingRecurringAction] = useState<{ action: RecurringAction; event: CalendarEvent } | null>(null);

  const selectedDateKey = toDateKey(selectedDate);
  const visibleMonth = monthNames[selectedDate.getMonth()];
  const visibleYear = selectedDate.getFullYear();
  const weekDates = useMemo(() => getWeekDates(selectedDate), [selectedDate]);
  const monthCells = useMemo(() => getMonthCells(selectedDate), [selectedDate]);

  const eventsForSelectedDate = useMemo(() => {
    return applyCalendarOverridesForDate(events, overrides, selectedDateKey)
      .sort((a, b) => a.time.localeCompare(b.time));
  }, [events, overrides, selectedDateKey]);

  const visibleTimelineHours = useMemo(() => getVisibleTimelineHours(eventsForSelectedDate), [eventsForSelectedDate]);

  useEffect(() => {
    if (!expandedHourKey) return;
    const timeout = window.setTimeout(() => setExpandedHourKey(null), 5000);
    return () => window.clearTimeout(timeout);
  }, [expandedHourKey]);

  const eventDays = useMemo(() => {
    const days = new Set<string>();
    const candidateKeys = new Set<string>();
    monthCells.forEach((cell) => { if (cell.dateKey) candidateKeys.add(cell.dateKey); });
    weekDates.forEach((date) => candidateKeys.add(toDateKey(date)));
    candidateKeys.forEach((dateKey) => {
      if (events.some((event) => eventOccursOnDate(event, dateKey))) days.add(dateKey);
    });
    return days;
  }, [events, monthCells, weekDates]);

  const upcomingCount = useMemo(() => {
    return events.filter((event) => eventOccursOnDate(event, selectedDateKey) || normalizeEventDate(event, selectedDateKey) >= selectedDateKey).length;
  }, [events, selectedDateKey]);

  function notify(message: string, type: "success" | "error" = "success") {
    setToast({ message, type });
    window.setTimeout(() => setToast(null), 2400);
  }

  function selectDay(date: Date) {
    setSelectedDate(date);
    setViewMode("week");
  }

  function selectDateKey(dateKey: string) {
    setSelectedDate(fromDateKey(dateKey));
    setViewMode("week");
    setSheetMode("closed");
  }

  function moveMonth(amount: number) {
    setSelectedDate((current) => addMonths(current, amount));
  }

  function goToday() {
    setSelectedDate(new Date());
    setViewMode("week");
    setSheetMode("closed");
  }

  function openNew() {
    const now = new Date();
    const defaultTime = `${String(now.getHours()).padStart(2, "0")}:00`;
    setEditing(null);
    setTitle("");
    setTime(defaultTime);
    setEndTime("");
    setActivityTypeKey("study");
    setAlertOption("none");
    setRecurrenceType("none");
    setRecurrenceDays([selectedDate.getDay()]);
    setRecurrenceUntil("");
    setErrors({});
    setSheetMode("event");
  }

  function openEdit(event: CalendarEvent, scope: RecurringScope = "series") {
    setRecurringScope(scope);
    const meta = categoryFromEvent(event);
    setEditing(event);
    setTitle(stripEmoji(event.title));
    setTime(event.time);
    setEndTime(event.endTime ?? "");
    setActivityTypeKey(meta.key);
    const existingReminder = reminders.find((item) => item.calendarEventId === event.id);
    setAlertOption(inferAlertOption(event.time, existingReminder?.time));
    setRecurrenceType(event.recurrenceType ?? "none");
    setRecurrenceDays(event.recurrenceDays?.length ? event.recurrenceDays : [fromDateKey(event.date).getDay()]);
    setRecurrenceUntil(event.recurrenceUntil ?? "");
    setErrors({});
    setSheetMode("event");
  }

  function requestEdit(event: CalendarEvent) {
    if (isChallengeCalendarEvent(event)) {
      notify("Esta actividad pertenece a un reto. Podés completarla en Hoy, pero no borrarla ni editarla desde Calendario.", "error");
      return;
    }
    if (isRecurringEvent(event)) {
      setPendingRecurringAction({ action: "edit", event });
      setSheetMode("recurringScope");
      return;
    }
    openEdit(event, "series");
  }

  async function deleteSingleOccurrence(event: CalendarEvent) {
    const baseId = calendarOccurrenceBaseId(event);
    const occurrenceDate = calendarOccurrenceDate(event, selectedDateKey);
    const result = await saveOverride({
      calendarEventId: baseId,
      occurrenceDate,
      isCancelled: true,
    });
    if (result.ok) notify("Solo se eliminó esta fecha");
    else notify("No se pudo sincronizar la eliminación de esta fecha.", "error");
    setSheetMode("closed");
  }

  async function chooseRecurringScope(scope: RecurringScope) {
    if (!pendingRecurringAction) return;
    const { action, event } = pendingRecurringAction;
    setPendingRecurringAction(null);
    if (action === "edit") {
      openEdit(event, scope);
      return;
    }
    if (scope === "occurrence") {
      await deleteSingleOccurrence(event);
      return;
    }
    setDeleteId(calendarOccurrenceBaseId(event));
    setSheetMode("closed");
  }

  async function submitEvent() {
    const nextErrors: CalendarFormErrors = {};
    const cleanTitle = title.trim();
    const cleanEndTime = endTime.trim();
    if (cleanTitle.length < 3) nextErrors.title = "El título debe tener al menos 3 caracteres.";
    if (!isValidTime(time)) nextErrors.time = "Usá formato HH:MM entre 00:00 y 23:59.";
    if (cleanEndTime && !isValidTime(cleanEndTime)) nextErrors.endTime = "Usá formato HH:MM o dejá el campo vacío.";
    if (cleanEndTime && isValidTime(time) && isValidTime(cleanEndTime) && timeToMinutes(cleanEndTime) <= timeToMinutes(time)) {
      nextErrors.endTime = "La hora final debe ser posterior a la hora de inicio.";
    }
    if (recurrenceType === "custom_days" && recurrenceDays.length === 0) {
      notify("Elegí al menos un día para repetir.", "error");
      return;
    }
    if (recurrenceUntil && !isValidDateKey(recurrenceUntil)) {
      notify("Usá la fecha final con formato YYYY-MM-DD.", "error");
      return;
    }
    if (recurrenceUntil && compareDateKeys(recurrenceUntil, editing ? editing.date : selectedDateKey) < 0) {
      notify("La fecha final debe ser posterior a la fecha inicial.", "error");
      return;
    }

    const conflict = Object.keys(nextErrors).length
      ? null
      : findScheduleConflict(eventsForSelectedDate, time, cleanEndTime || null, editing?.id);

    if (conflict) {
      const conflictRange = eventRangeLabel(conflict);
      const conflictHour = hourLabelFromMinutes(eventInterval(conflict).startHour);
      nextErrors.time = `Este horario está ocupado por “${stripEmoji(conflict.title)}” (${conflictRange}). Elegí otra hora o editá esa actividad.`;
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      if (nextErrors.time || nextErrors.endTime) notify(nextErrors.time || nextErrors.endTime || "Revisá el horario.", "error");
      return;
    }

    const meta = resolveActivityCategoryMeta({ key: activityTypeKey }, activityItems);
    const payload = {
      title: cleanTitle,
      time,
      endTime: cleanEndTime || null,
      color: meta.color,
      iconKey: meta.iconKey,
      activityTypeKey: meta.key,
      date: editing ? editing.date : selectedDateKey,
      recurrenceType,
      recurrenceDays: recurrenceType === "custom_days" ? recurrenceDays : null,
      recurrenceUntil: recurrenceUntil || null,
      recurrenceGroupId: editing?.recurrenceGroupId ?? null,
      done: editing?.done ?? false,
    } satisfies Omit<CalendarEvent, "id">;

    const isRecurringOccurrenceEdit = Boolean(editing && recurringScope === "occurrence" && isRecurringEvent(editing));
    let savedEvent: CalendarEvent;
    if (isRecurringOccurrenceEdit && editing) {
      const baseId = calendarOccurrenceBaseId(editing);
      const occurrenceDate = calendarOccurrenceDate(editing, selectedDateKey);
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
      savedEvent = { ...editing, ...payload, parentEventId: baseId, occurrenceDate, isOccurrenceOverride: true };
      if (!result.ok) notify("El cambio quedó temporal, pero no se pudo sincronizar.", "error");
    } else {
      const targetId = editing ? calendarOccurrenceBaseId(editing) : null;
      savedEvent = editing && targetId ? await updateEvent(targetId, payload) : await createEvent(payload);
    }

    const alertTime = createReminderTime(selectedDateKey, time, alertOption);
    let alertSynced = true;
    if (alertTime) {
      const result = await upsertCalendarReminder(calendarOccurrenceBaseId(savedEvent), {
        title: `Alerta: ${cleanTitle}`,
        time: alertTime,
        repeat: (recurrenceType === "daily" ? "daily" : "custom") as Reminder["repeat"],
        calendarEventId: calendarOccurrenceBaseId(savedEvent),
      });
      alertSynced = result.ok;
    } else if (editing) {
      alertSynced = await deleteCalendarEventReminders(calendarOccurrenceBaseId(editing));
    }

    setSheetMode("closed");
    if (!alertSynced) {
      notify("Actividad guardada, pero la alerta no se pudo sincronizar. Revisá Recordatorios.", "error");
      return;
    }
    notify(editing ? "Actividad actualizada y sincronizada" : alertTime ? "Actividad y alerta creadas" : "Actividad creada");
  }

  return (
    <AppShell>
      <Toast toast={toast} onClose={() => setToast(null)} />
      <section className="page-pad pb-28 pt-8">
        <CalendarHeader
          month={visibleMonth}
          onOpenMonth={() => setSheetMode("month")}
          onOpenSettings={() => setSheetMode("settings")}
          onAdd={openNew}
        />

        <CalendarViewToggle value={viewMode} onChange={setViewMode} />

        {viewMode === "week" ? (
          <>
            <CalendarWeekStrip
              dates={weekDates}
              selectedDateKey={selectedDateKey}
              eventDays={eventDays}
              getDateKey={toDateKey}
              onSelect={selectDay}
            />

            <CalendarDaySummary
              label={formatLongDate(selectedDate)}
              count={eventsForSelectedDate.length}
              syncStatus={syncStatus}
            />

            <CalendarTimeline
              events={eventsForSelectedDate}
              hours={visibleTimelineHours}
              selectedDateKey={selectedDateKey}
              expandedHourKey={expandedHourKey}
              maxVisibleEventsPerHour={MAX_VISIBLE_EVENTS_PER_HOUR}
              categoryFromEvent={categoryFromEvent}
              stripEmoji={stripEmoji}
              isLongEvent={isLongEvent}
              eventRangeLabel={eventRangeLabel}
              eventsForHour={eventsForHour}
              isCoveredByPreviousLongEvent={isCoveredByPreviousLongEvent}
              containingLongEventLabel={(event) => containingLongEventLabel(eventsForSelectedDate, event)}
              isEventDone={(event) => getCalendarEventDone(event, selectedDateKey, completionMap)}
              onEdit={requestEdit}
              onExpandHour={setExpandedHourKey}
            />
          </>
        ) : (
          <CalendarMonthView
            month={visibleMonth}
            year={visibleYear}
            cells={monthCells}
            selectedDateKey={selectedDateKey}
            eventDays={eventDays}
            onMoveMonth={moveMonth}
            onSelectDateKey={selectDateKey}
          />
        )}
      </section>

      <button
        type="button"
        onClick={openNew}
        className="fixed bottom-[104px] right-[calc(50%-195px)] z-30 grid h-16 w-16 place-items-center rounded-full bg-monkey-green text-white shadow-float transition active:scale-95"
        aria-label="Agregar actividad"
      >
        <Plus className="h-8 w-8" />
      </button>

      <FormSheet
        open={sheetMode === "event"}
        title={editing ? "Editar actividad" : "Nueva actividad"}
        subtitle={`Se guardará para ${formatShortDate(selectedDate)}. Definí horario, tipo y alerta.`}
        onClose={() => setSheetMode("closed")}
        onSubmit={submitEvent}
        submitLabel={editing ? "Guardar cambios" : "Crear actividad"}
      >
        <Field label="Nombre" value={title} onChange={(event: ChangeEvent<HTMLInputElement>) => setTitle(event.target.value)} placeholder="Ej: ir al gym" error={errors.title} />

        <div>
          <span className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-[.08em] text-monkey-muted"><Clock3 className="h-4 w-4" /> Horario</span>
          <div className="grid grid-cols-2 gap-2">
            <Field label="Inicio" value={time} onChange={(event: ChangeEvent<HTMLInputElement>) => setTime(event.target.value)} placeholder="09:00" error={errors.time} />
            <Field label="Fin opcional" value={endTime} onChange={(event: ChangeEvent<HTMLInputElement>) => setEndTime(event.target.value)} placeholder="12:00" error={errors.endTime} />
          </div>
          <p className="mt-2 text-xs leading-5 text-monkey-muted">Si dejás el fin vacío, la actividad ocupa solo su hora. Si agregás fin, se muestra como una actividad larga con flag de duración.</p>
        </div>

        <ActivityTypeSelect value={activityTypeKey} onChange={setActivityTypeKey} />

        <CompactSelect
          label="Alerta"
          value={alertOption}
          options={alertOptions.map((item) => ({ id: item.id, label: item.label }))}
          onChange={setAlertOption}
        />

        <RecurrenceControl
          summary={recurrenceSummary(recurrenceType, recurrenceDays, recurrenceUntil || null)}
          onOpen={() => setSheetMode("recurrence")}
        />

        <div className="rounded-[18px] bg-green-50 p-4">
          <p className="text-xs font-black uppercase tracking-[.08em] text-monkey-greenDark">Cómo se verá</p>
          <p className="mt-1 text-xs leading-5 text-monkey-muted">Las actividades de 09:15 aparecen dentro de la fila 09:00. Si activás repetición, aparecerán automáticamente en los días configurados.</p>
        </div>

        {editing ? (
          <button
            type="button"
            onClick={() => {
              if (isRecurringEvent(editing)) {
                setPendingRecurringAction({ action: "delete", event: editing });
                setSheetMode("recurringScope");
                return;
              }
              setDeleteId(calendarOccurrenceBaseId(editing));
            }}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-pill bg-pink-50 text-sm font-black text-monkey-pink"
          >
            <Trash2 className="h-4 w-4" />
            Eliminar actividad
          </button>
        ) : null}
      </FormSheet>

      <FormSheet
        open={sheetMode === "recurrence"}
        title="Repetición"
        subtitle="Definí si esta actividad aparece todos los días o solo en días específicos."
        onClose={() => setSheetMode("event")}
        onSubmit={() => {
          if (recurrenceType === "custom_days" && recurrenceDays.length === 0) {
            notify("Elegí al menos un día para repetir.", "error");
            return;
          }
          if (recurrenceUntil && !isValidDateKey(recurrenceUntil)) {
            notify("Usá la fecha final con formato YYYY-MM-DD.", "error");
            return;
          }
          if (recurrenceUntil && compareDateKeys(recurrenceUntil, editing ? editing.date : selectedDateKey) < 0) {
            notify("La fecha final debe ser posterior a la fecha inicial.", "error");
            return;
          }
          setSheetMode("event");
        }}
        submitLabel="Guardar repetición"
      >
        <div className="grid gap-2">
          {recurrenceOptions.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => {
                setRecurrenceType(option.id);
                if (option.id === "custom_days" && recurrenceDays.length === 0) setRecurrenceDays([selectedDate.getDay()]);
              }}
              className={cn(
                "flex min-h-14 items-center justify-between rounded-[18px] px-4 text-left transition active:scale-[.99]",
                recurrenceType === option.id ? "bg-monkey-green text-white shadow-sm" : "bg-gray-50 text-monkey-ink",
              )}
            >
              <span>
                <strong className="block text-sm font-black">{option.label}</strong>
                <span className={cn("block text-xs font-bold", recurrenceType === option.id ? "text-white/80" : "text-monkey-muted")}>{option.helper}</span>
              </span>
              <span className={cn("grid h-5 w-5 place-items-center rounded-full border-2", recurrenceType === option.id ? "border-white bg-white text-monkey-green" : "border-gray-200")}>
                {recurrenceType === option.id ? "✓" : ""}
              </span>
            </button>
          ))}
        </div>

        {recurrenceType === "custom_days" ? (
          <div>
            <span className="mb-2 block text-xs font-black uppercase tracking-[.08em] text-monkey-muted">Días específicos</span>
            <div className="grid grid-cols-7 gap-2">
              {recurrenceWeekdays.map((day) => {
                const active = recurrenceDays.includes(day.jsDay);
                return (
                  <button
                    key={day.jsDay}
                    type="button"
                    title={day.label}
                    onClick={() => setRecurrenceDays((current) => active ? current.filter((item) => item !== day.jsDay) : [...current, day.jsDay])}
                    className={cn("h-11 rounded-[14px] text-xs font-black transition active:scale-95", active ? "bg-monkey-green text-white shadow-sm" : "bg-gray-100 text-monkey-muted")}
                  >
                    {day.short}
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}

        {recurrenceType !== "none" ? (
          <div>
            <Field
              label="Hasta cuándo (opcional)"
              value={recurrenceUntil}
              onChange={(event: ChangeEvent<HTMLInputElement>) => setRecurrenceUntil(event.target.value)}
              placeholder="2026-08-31"
            />
            <p className="mt-2 text-xs leading-5 text-monkey-muted">Si lo dejás vacío, la app mostrará la repetición de forma continua y calculará las ocurrencias al abrir el calendario.</p>
          </div>
        ) : null}

        <div className="rounded-[18px] bg-green-50 p-4">
          <p className="text-xs font-black uppercase tracking-[.08em] text-monkey-greenDark">Resumen</p>
          <p className="mt-1 text-sm font-bold text-monkey-muted">{recurrenceSummary(recurrenceType, recurrenceDays, recurrenceUntil || null)}</p>
        </div>
      </FormSheet>

      <FormSheet
        open={sheetMode === "recurringScope"}
        title={pendingRecurringAction?.action === "delete" ? "Eliminar repetición" : "Editar repetición"}
        subtitle="Esta actividad se repite. Elegí si el cambio aplica solo a esta fecha o a toda la repetición."
        onClose={() => { setPendingRecurringAction(null); setSheetMode("closed"); }}
        onSubmit={() => chooseRecurringScope("occurrence")}
        submitLabel={pendingRecurringAction?.action === "delete" ? "Solo esta fecha" : "Solo esta fecha"}
      >
        <div className="grid gap-3">
          <button
            type="button"
            onClick={() => chooseRecurringScope("occurrence")}
            className="rounded-[20px] bg-green-50 p-4 text-left transition active:scale-[.99]"
          >
            <strong className="block text-sm font-black text-monkey-greenDark">Solo esta fecha</strong>
            <span className="mt-1 block text-xs leading-5 text-monkey-muted">Cambia o elimina únicamente esta ocurrencia. Las próximas repeticiones se mantienen iguales.</span>
          </button>
          <button
            type="button"
            onClick={() => chooseRecurringScope("series")}
            className="rounded-[20px] bg-gray-50 p-4 text-left transition active:scale-[.99]"
          >
            <strong className="block text-sm font-black text-monkey-ink">Toda la repetición</strong>
            <span className="mt-1 block text-xs leading-5 text-monkey-muted">Aplica el cambio a la actividad base y a todas sus repeticiones futuras.</span>
          </button>
        </div>
      </FormSheet>

      <FormSheet
        open={sheetMode === "settings"}
        title="Alertas y vista"
        subtitle="Configuración simple para mantenerte pendiente sin llenar la pantalla."
        onClose={() => setSheetMode("closed")}
        onSubmit={() => setSheetMode("closed")}
        submitLabel="Listo"
      >
        <div className="grid grid-cols-2 gap-3">
          <button type="button" onClick={() => setViewMode("week")} className={cn("h-12 rounded-pill text-sm font-black", viewMode === "week" ? "bg-monkey-green text-white" : "bg-gray-100 text-monkey-muted")}>Semana</button>
          <button type="button" onClick={() => setViewMode("month")} className={cn("h-12 rounded-pill text-sm font-black", viewMode === "month" ? "bg-monkey-green text-white" : "bg-gray-100 text-monkey-muted")}>Mes</button>
        </div>
        <button type="button" onClick={goToday} className="h-12 w-full rounded-pill bg-green-50 text-sm font-black text-monkey-greenDark">Volver a hoy</button>
        <div className="rounded-[20px] bg-gray-50 p-4">
          <p className="text-sm font-black text-monkey-ink">Resumen</p>
          <p className="mt-2 text-xs leading-5 text-monkey-muted">
            Tenés {eventsForSelectedDate.length} actividades para el día seleccionado y {upcomingCount} actividades próximas registradas. {lastError || reminderSyncError ? lastError || reminderSyncError : syncing ? "Sincronizando con Supabase..." : syncStatus === "saving" ? "Guardando cambios..." : syncStatus === "synced" ? "Sincronizado." : "Calendario listo."}
          </p>
        </div>
        <div className="rounded-[20px] bg-green-50 p-4">
          <p className="text-sm font-black text-monkey-greenDark">Tip de alertas</p>
          <p className="mt-2 text-xs leading-5 text-monkey-muted">Usá alertas de 15 minutos antes para estudiar, clases o proyectos. Para descanso o comida, la hora exacta suele ser suficiente.</p>
        </div>
      </FormSheet>

      <FormSheet
        open={sheetMode === "month"}
        title="Cambiar mes"
        subtitle="Movete entre meses sin perder el día seleccionado."
        onClose={() => setSheetMode("closed")}
        onSubmit={() => setSheetMode("closed")}
        submitLabel="Listo"
      >
        <div className="flex items-center justify-between rounded-[20px] bg-gray-50 p-3">
          <button type="button" onClick={() => moveMonth(-1)} className="grid h-11 w-11 place-items-center rounded-full bg-white shadow-sm"><ChevronLeft className="h-5 w-5" /></button>
          <div className="text-center">
            <p className="text-lg font-black text-monkey-ink">{visibleMonth}</p>
            <p className="text-xs font-bold text-monkey-muted">{visibleYear}</p>
          </div>
          <button type="button" onClick={() => moveMonth(1)} className="grid h-11 w-11 place-items-center rounded-full bg-white shadow-sm"><ChevronRight className="h-5 w-5" /></button>
        </div>
        <button type="button" onClick={goToday} className="h-12 w-full rounded-pill bg-green-50 text-sm font-black text-monkey-greenDark">Ir a hoy</button>
      </FormSheet>

      <ConfirmSheet
        open={!!deleteId}
        title="¿Eliminar actividad?"
        body="La actividad se quitará del calendario y también se eliminará su alerta relacionada."
        onCancel={() => setDeleteId(null)}
        onConfirm={() => {
          if (deleteId) {
            void deleteEvent(deleteId);
            void deleteCalendarEventReminders(deleteId);
          }
          setDeleteId(null);
          setSheetMode("closed");
          notify("Actividad eliminada");
        }}
      />
    </AppShell>
  );
}
