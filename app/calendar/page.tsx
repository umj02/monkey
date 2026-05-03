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
import { useCalendarEvents } from "@/hooks/use-calendar-events";
import { useReminders } from "@/hooks/use-reminders";
import type { CalendarEvent, Reminder } from "@/types";
import { cn } from "@/lib/utils";
import { CalendarHeader } from "@/components/calendar/calendar-header";
import { CalendarViewToggle, type CalendarViewMode } from "@/components/calendar/calendar-view-toggle";
import { CalendarWeekStrip } from "@/components/calendar/calendar-week-strip";
import { CalendarDaySummary } from "@/components/calendar/calendar-day-summary";
import { CalendarMonthView } from "@/components/calendar/calendar-month-view";
import { CalendarTimeline } from "@/components/calendar/calendar-timeline";

const weekLabels = ["LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB", "DOM"];
const dayLetters = ["L", "M", "M", "J", "V", "S", "D"];
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
const timelineHours = [
  "06:00",
  "07:00",
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
  "19:00",
  "20:00",
];

const DEFAULT_DURATION_MINUTES = 60;
const MAX_VISIBLE_EVENTS_PER_HOUR = 2;

type CalendarSheetMode = "closed" | "event" | "settings" | "month";
type CalendarCategory = "exercise" | "study" | "class" | "food" | "project" | "rest" | "other";
type AlertOption = "none" | "exact" | "5" | "15" | "30";

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
  id: CalendarCategory;
  label: string;
  icon: string;
  iconKey: string;
  color: CalendarEvent["color"];
  pillClass: string;
};

const categories: CategoryMeta[] = [
  { id: "exercise", label: "Ejercicio", icon: "😊", iconKey: "calendar-exercise", color: "yellow", pillClass: "bg-[#FDF6BA] text-[#A66A00]" },
  { id: "study", label: "Estudiar", icon: "📝", iconKey: "calendar-study", color: "blue", pillClass: "bg-[#DDF7F7] text-[#187187]" },
  { id: "class", label: "Clases", icon: "📚", iconKey: "calendar-class", color: "green", pillClass: "bg-[#DDF7D8] text-[#2E7D32]" },
  { id: "food", label: "Comida", icon: "🍴", iconKey: "calendar-food", color: "pink", pillClass: "bg-[#FFE1E7] text-[#D9415F]" },
  { id: "project", label: "Proyecto", icon: "💼", iconKey: "calendar-project", color: "purple", pillClass: "bg-[#E8DEFF] text-[#6242B5]" },
  { id: "rest", label: "Descanso", icon: "🧘", iconKey: "calendar-rest", color: "purple", pillClass: "bg-[#EEE7FF] text-[#7252C7]" },
  { id: "other", label: "Otro", icon: "✨", iconKey: "calendar-task", color: "orange", pillClass: "bg-[#FFE9D7] text-[#B76119]" },
];

const alertOptions: { id: AlertOption; label: string; offset: number | null }[] = [
  { id: "none", label: "Sin alerta", offset: null },
  { id: "exact", label: "A la hora exacta", offset: 0 },
  { id: "5", label: "5 min antes", offset: 5 },
  { id: "15", label: "15 min antes", offset: 15 },
  { id: "30", label: "30 min antes", offset: 30 },
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

function stripEmoji(title: string) {
  return title.replace(/^[^\p{L}\p{N}]+\s*/u, "").trim() || title.trim();
}

function categoryFromEvent(event: CalendarEvent): CategoryMeta {
  const lowerTitle = event.title.toLowerCase();
  const byTitle = categories.find((category) =>
    lowerTitle.includes(category.label.toLowerCase()) || lowerTitle.includes(category.id),
  );
  if (byTitle) return byTitle;

  const byColor = categories.find((category) => category.color === event.color);
  if (byColor) return byColor;

  return categoryByHour(event.time);
}

function categoryByHour(time: string): CategoryMeta {
  const minutes = timeToMinutes(time);
  if (minutes < 8 * 60) return categories[0];
  if (minutes < 10 * 60) return categories[1];
  if (minutes < 12 * 60) return categories[2];
  if (minutes < 14 * 60) return categories[3];
  if (minutes < 16 * 60) return categories[4];
  if (minutes < 18 * 60) return categories[5];
  return categories[6];
}

function createReminderTime(dateKey: string, time: string, alertOption: AlertOption) {
  const selected = alertOptions.find((item) => item.id === alertOption);
  if (!selected || selected.offset === null) return null;
  const date = new Date(`${dateKey}T${time}:00`);
  if (Number.isNaN(date.getTime())) return null;
  date.setMinutes(date.getMinutes() - selected.offset);
  return date.toLocaleTimeString("es-CR", { hour: "2-digit", minute: "2-digit", hour12: false });
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

function findScheduleConflict(events: CalendarEvent[], proposedStart: string, proposedEnd: string | null, editingId?: string) {
  const next = proposedInterval(proposedStart, proposedEnd);
  const isLong = next.end - next.start > DEFAULT_DURATION_MINUTES;

  return events.find((event) => {
    if (event.id === editingId) return false;
    const current = eventInterval(event);
    const currentIsLong = current.end - current.start > DEFAULT_DURATION_MINUTES;

    // Permitimos variaciones dentro de la misma hora: 09:00 y 09:15 viven en la fila 09:00.
    if (current.startHour === next.startHour) return false;

    // Una actividad larga existente bloquea horas posteriores cubiertas para que no queden ocultas.
    if (currentIsLong && current.start < next.start && current.end > next.start) return true;

    // Una nueva actividad larga no debe tapar eventos existentes en horas intermedias.
    if (isLong && next.start < current.start && next.end > current.start) return true;

    return false;
  });
}

function getVisibleTimelineHours(events: CalendarEvent[]) {
  const minimumEndHour = 12;
  const maxEventHour = events.reduce((maxHour, event) => {
    const startHour = Math.floor(timeToMinutes(event.time) / 60);
    const endHour = event.endTime && isValidTime(event.endTime) ? Math.ceil(timeToMinutes(event.endTime) / 60) : startHour;
    return Math.max(maxHour, startHour, endHour);
  }, minimumEndHour);
  const finalHour = Math.min(20, Math.max(minimumEndHour, maxEventHour));
  return timelineHours.filter((hour) => {
    const value = Number(hour.slice(0, 2));
    return value <= finalHour;
  });
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
  value: CalendarCategory;
  onChange: (value: CalendarCategory) => void;
}) {
  const [open, setOpen] = useState(false);
  const selected = categories.find((item) => item.id === value) ?? categories[0];

  return (
    <div className="min-w-0">
      <span className="mb-2 block text-xs font-black uppercase tracking-[.08em] text-monkey-muted">Tipo de actividad</span>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex h-14 w-full min-w-0 items-center gap-3 rounded-[18px] border border-gray-100 bg-gray-50 px-4 text-left font-black text-monkey-ink transition active:scale-[.99]"
        aria-expanded={open}
      >
        <AssetThumb icon={selected.iconKey} size={34} className="rounded-[10px]" />
        <span className="min-w-0 flex-1 truncate">{selected.label}</span>
        <ChevronDown className={cn("h-4 w-4 text-monkey-muted transition", open && "rotate-180")} />
      </button>
      {open ? (
        <div className="mt-2 grid grid-cols-2 gap-2 rounded-[20px] bg-gray-50 p-2">
          {categories.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                onChange(item.id);
                setOpen(false);
              }}
              className={cn(
                "flex min-w-0 items-center gap-2 rounded-[16px] px-3 py-2 text-left text-xs font-black transition active:scale-[.98]",
                value === item.id ? "bg-monkey-green text-white shadow-sm" : "bg-white text-monkey-muted",
              )}
            >
              <AssetThumb icon={item.iconKey} size={30} className="rounded-[9px] bg-white/40" />
              <span className="min-w-0 truncate">{item.label}</span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export default function CalendarPage() {
  const { events, syncing, syncStatus, lastError, createEvent, updateEvent, deleteEvent } = useCalendarEvents();
  const { upsertCalendarReminder, deleteCalendarEventReminders } = useReminders();
  const [viewMode, setViewMode] = useState<CalendarViewMode>("week");
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [sheetMode, setSheetMode] = useState<CalendarSheetMode>("closed");
  const [editing, setEditing] = useState<CalendarEvent | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [time, setTime] = useState("09:00");
  const [endTime, setEndTime] = useState("");
  const [category, setCategory] = useState<CalendarCategory>("study");
  const [alertOption, setAlertOption] = useState<AlertOption>("none");
  const [errors, setErrors] = useState<CalendarFormErrors>({});
  const [toast, setToast] = useState<ToastState>(null);
  const [expandedHourKey, setExpandedHourKey] = useState<string | null>(null);

  const selectedDateKey = toDateKey(selectedDate);
  const visibleMonth = monthNames[selectedDate.getMonth()];
  const visibleYear = selectedDate.getFullYear();
  const weekDates = useMemo(() => getWeekDates(selectedDate), [selectedDate]);
  const monthCells = useMemo(() => getMonthCells(selectedDate), [selectedDate]);

  const eventsForSelectedDate = useMemo(() => {
    return events
      .filter((event) => normalizeEventDate(event, selectedDateKey) === selectedDateKey)
      .sort((a, b) => a.time.localeCompare(b.time));
  }, [events, selectedDateKey]);

  const visibleTimelineHours = useMemo(() => getVisibleTimelineHours(eventsForSelectedDate), [eventsForSelectedDate]);

  useEffect(() => {
    if (!expandedHourKey) return;
    const timeout = window.setTimeout(() => setExpandedHourKey(null), 5000);
    return () => window.clearTimeout(timeout);
  }, [expandedHourKey]);

  const eventDays = useMemo(() => {
    const days = new Set<string>();
    events.forEach((event) => days.add(normalizeEventDate(event, selectedDateKey)));
    return days;
  }, [events, selectedDateKey]);

  const upcomingCount = useMemo(() => {
    return events.filter((event) => normalizeEventDate(event, selectedDateKey) >= selectedDateKey).length;
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
    setEditing(null);
    setTitle("");
    setTime("09:00");
    setEndTime("");
    setCategory("study");
    setAlertOption("none");
    setErrors({});
    setSheetMode("event");
  }

  function openEdit(event: CalendarEvent) {
    const meta = categoryFromEvent(event);
    setEditing(event);
    setTitle(stripEmoji(event.title));
    setTime(event.time);
    setEndTime(event.endTime ?? "");
    setCategory(meta.id);
    setAlertOption("none");
    setErrors({});
    setSheetMode("event");
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

    const conflict = Object.keys(nextErrors).length
      ? null
      : findScheduleConflict(eventsForSelectedDate, time, cleanEndTime || null, editing?.id);

    if (conflict) {
      const conflictRange = eventRangeLabel(conflict);
      const conflictHour = hourLabelFromMinutes(eventInterval(conflict).startHour);
      nextErrors.time = `Este horario ya está ocupado por “${stripEmoji(conflict.title)}” (${conflictRange}). Elegí la fila ${conflictHour} u otra hora.`;
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      if (nextErrors.time || nextErrors.endTime) notify(nextErrors.time || nextErrors.endTime || "Revisá el horario.", "error");
      return;
    }

    const meta = categories.find((item) => item.id === category) || categories[6];
    const payload = {
      title: `${meta.icon} ${cleanTitle}`,
      time,
      endTime: cleanEndTime || null,
      color: meta.color,
      date: selectedDateKey,
    } satisfies Omit<CalendarEvent, "id">;

    const savedEvent = editing ? await updateEvent(editing.id, payload) : await createEvent(payload);

    const alertTime = createReminderTime(selectedDateKey, time, alertOption);
    if (alertTime) {
      upsertCalendarReminder(savedEvent.id, {
        title: `Alerta: ${cleanTitle}`,
        time: alertTime,
        repeat: "custom" as Reminder["repeat"],
        calendarEventId: savedEvent.id,
      });
    } else if (editing) {
      deleteCalendarEventReminders(editing.id);
    }

    setSheetMode("closed");
    notify(editing ? "Actividad actualizada" : alertTime ? "Actividad y alerta creadas" : "Actividad creada");
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
              onEdit={openEdit}
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

        <ActivityTypeSelect value={category} onChange={setCategory} />

        <CompactSelect
          label="Alerta"
          value={alertOption}
          options={alertOptions.map((item) => ({ id: item.id, label: item.label }))}
          onChange={setAlertOption}
        />

        <div className="rounded-[18px] bg-green-50 p-4">
          <p className="text-xs font-black uppercase tracking-[.08em] text-monkey-greenDark">Cómo se verá</p>
          <p className="mt-1 text-xs leading-5 text-monkey-muted">Las actividades de 09:15 aparecen dentro de la fila 09:00. Máximo se muestran 2 por hora para mantener el calendario limpio.</p>
        </div>

        {editing ? (
          <button
            type="button"
            onClick={() => setDeleteId(editing.id)}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-pill bg-pink-50 text-sm font-black text-monkey-pink"
          >
            <Trash2 className="h-4 w-4" />
            Eliminar actividad
          </button>
        ) : null}
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
          <p className="mt-2 text-xs leading-5 text-monkey-muted">Tenés {eventsForSelectedDate.length} actividades para el día seleccionado y {upcomingCount} actividades próximas registradas. {lastError ? lastError : syncing ? "Sincronizando con Supabase..." : syncStatus === "saving" ? "Guardando cambios..." : syncStatus === "synced" ? "Sincronizado." : "Calendario listo."}</p>
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
        body="La actividad se quitará del calendario."
        onCancel={() => setDeleteId(null)}
        onConfirm={() => {
          if (deleteId) {
            void deleteEvent(deleteId);
            deleteCalendarEventReminders(deleteId);
          }
          setDeleteId(null);
          setSheetMode("closed");
          notify("Actividad eliminada");
        }}
      />
    </AppShell>
  );
}
