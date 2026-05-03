"use client";

import { type ChangeEvent, useMemo, useState } from "react";
import {
  Bell,
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ListFilter,
  Plus,
  Trash2,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { ConfirmSheet } from "@/components/confirm-sheet";
import { EmptyState } from "@/components/empty-state";
import { Field } from "@/components/field";
import { FormSheet } from "@/components/form-sheet";
import { Toast, ToastState } from "@/components/toast";
import { useCalendarEvents } from "@/hooks/use-calendar-events";
import { useReminders } from "@/hooks/use-reminders";
import type { CalendarEvent, Reminder } from "@/types";
import { cn } from "@/lib/utils";

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
const timelineHours = ["06:00", "08:00", "10:00", "12:00", "14:00", "16:00", "18:00", "20:00"];

type CalendarViewMode = "week" | "month";
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
};

type CategoryMeta = {
  id: CalendarCategory;
  label: string;
  icon: string;
  color: CalendarEvent["color"];
  pillClass: string;
};

const categories: CategoryMeta[] = [
  { id: "exercise", label: "Ejercicio", icon: "😊", color: "yellow", pillClass: "bg-[#FDF6BA] text-[#A66A00]" },
  { id: "study", label: "Estudiar", icon: "📝", color: "blue", pillClass: "bg-[#DDF7F7] text-[#187187]" },
  { id: "class", label: "Clases", icon: "📚", color: "green", pillClass: "bg-[#DDF7D8] text-[#2E7D32]" },
  { id: "food", label: "Comida", icon: "🍴", color: "pink", pillClass: "bg-[#FFE1E7] text-[#D9415F]" },
  { id: "project", label: "Proyecto", icon: "💼", color: "purple", pillClass: "bg-[#E8DEFF] text-[#6242B5]" },
  { id: "rest", label: "Descanso", icon: "🧘", color: "purple", pillClass: "bg-[#EEE7FF] text-[#7252C7]" },
  { id: "other", label: "Otro", icon: "✨", color: "orange", pillClass: "bg-[#FFE9D7] text-[#B76119]" },
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

function eventsForTimelineSlot(events: CalendarEvent[], hour: string, index: number) {
  const start = timeToMinutes(hour);
  const nextHour = timelineHours[index + 1];
  const end = nextHour ? timeToMinutes(nextHour) : 24 * 60;

  return events.filter((event) => {
    const eventMinutes = timeToMinutes(event.time);
    if (index === 0 && eventMinutes < start) return true;
    return eventMinutes >= start && eventMinutes < end;
  });
}

function formatTimelineRange(hour: string, index: number) {
  const nextHour = timelineHours[index + 1];
  if (!nextHour) return `${hour}+`;
  return `${hour} - ${nextHour}`;
}

export default function CalendarPage() {
  const { events, createEvent, updateEvent, deleteEvent } = useCalendarEvents();
  const { createReminder } = useReminders();
  const [viewMode, setViewMode] = useState<CalendarViewMode>("week");
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [sheetMode, setSheetMode] = useState<CalendarSheetMode>("closed");
  const [editing, setEditing] = useState<CalendarEvent | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [time, setTime] = useState("09:00");
  const [category, setCategory] = useState<CalendarCategory>("study");
  const [alertOption, setAlertOption] = useState<AlertOption>("none");
  const [errors, setErrors] = useState<CalendarFormErrors>({});
  const [toast, setToast] = useState<ToastState>(null);

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

  const eventDays = useMemo(() => {
    const days = new Set<string>();
    events.forEach((event) => days.add(normalizeEventDate(event, selectedDateKey)));
    return days;
  }, [events, selectedDateKey]);

  const upcomingCount = useMemo(() => {
    return events.filter((event) => normalizeEventDate(event, selectedDateKey) >= selectedDateKey).length;
  }, [events, selectedDateKey]);

  function notify(message: string) {
    setToast({ message, type: "success" });
    window.setTimeout(() => setToast(null), 2200);
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
    setCategory(meta.id);
    setAlertOption("none");
    setErrors({});
    setSheetMode("event");
  }

  function submitEvent() {
    const nextErrors: CalendarFormErrors = {};
    const cleanTitle = title.trim();
    if (cleanTitle.length < 3) nextErrors.title = "El título debe tener al menos 3 caracteres.";
    if (!isValidTime(time)) nextErrors.time = "Usá formato HH:MM entre 00:00 y 23:59.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    const meta = categories.find((item) => item.id === category) || categories[6];
    const payload = {
      title: `${meta.icon} ${cleanTitle}`,
      time,
      color: meta.color,
      date: selectedDateKey,
    } satisfies Omit<CalendarEvent, "id">;

    if (editing) updateEvent(editing.id, payload);
    else createEvent(payload);

    const alertTime = createReminderTime(selectedDateKey, time, alertOption);
    if (alertTime) {
      createReminder({
        title: `Alerta: ${cleanTitle}`,
        time: alertTime,
        repeat: "custom" as Reminder["repeat"],
      });
    }

    setSheetMode("closed");
    notify(editing ? "Actividad actualizada" : alertTime ? "Actividad y alerta creadas" : "Actividad creada");
  }

  return (
    <AppShell>
      <Toast toast={toast} onClose={() => setToast(null)} />
      <section className="page-pad pb-28 pt-8">
        <header className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setSheetMode("month")}
            className="flex items-center gap-2 text-[26px] font-black tracking-[-0.04em] text-monkey-ink transition active:scale-95"
            aria-label="Cambiar mes"
          >
            {visibleMonth}
            <ChevronDown className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSheetMode("settings")}
              className="grid h-10 w-10 place-items-center rounded-full bg-white text-monkey-ink shadow-sm transition active:scale-95"
              aria-label="Configurar calendario y alertas"
            >
              <ListFilter className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={openNew}
              className="grid h-10 w-10 place-items-center rounded-full bg-white text-monkey-ink shadow-sm transition active:scale-95"
              aria-label="Agregar actividad"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>
        </header>

        <div className="mt-5 rounded-[22px] border border-green-100 bg-white p-2 shadow-sm">
          <div className="grid h-10 grid-cols-2 rounded-[18px] bg-gray-100 p-1 text-xs font-black">
            <button
              type="button"
              onClick={() => setViewMode("week")}
              className={cn("rounded-[16px] transition active:scale-95", viewMode === "week" ? "bg-monkey-green text-white shadow-sm" : "text-monkey-muted")}
            >
              Semana
            </button>
            <button
              type="button"
              onClick={() => setViewMode("month")}
              className={cn("rounded-[16px] transition active:scale-95", viewMode === "month" ? "bg-monkey-green text-white shadow-sm" : "text-monkey-muted")}
            >
              Mes
            </button>
          </div>
        </div>

        {viewMode === "week" ? (
          <>
            <div className="mt-4 grid grid-cols-7 gap-2">
              {weekDates.map((dayDate, index) => {
                const dateKey = toDateKey(dayDate);
                const active = dateKey === selectedDateKey;
                const hasEvent = eventDays.has(dateKey);
                return (
                  <button
                    key={dateKey}
                    type="button"
                    onClick={() => selectDay(dayDate)}
                    className={cn(
                      "relative min-w-0 rounded-[18px] py-3 text-center transition active:scale-95",
                      active ? "bg-monkey-green text-white shadow-card" : "bg-white text-monkey-ink shadow-sm",
                    )}
                  >
                    <p className="text-[10px] font-black opacity-70">{weekLabels[index]}</p>
                    <p className="mt-1 text-base font-black leading-none">{dayDate.getDate()}</p>
                    {hasEvent ? <span className={cn("absolute bottom-1 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full", active ? "bg-white" : "bg-monkey-green")} /> : null}
                  </button>
                );
              })}
            </div>

            <div className="mt-5 flex items-center justify-between rounded-[20px] bg-white px-4 py-3 shadow-sm">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[.08em] text-monkey-muted">Día seleccionado</p>
                <p className="mt-1 text-sm font-black capitalize text-monkey-ink">{formatLongDate(selectedDate)}</p>
              </div>
              <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-black text-monkey-greenDark">
                {eventsForSelectedDate.length} act.
              </span>
            </div>

            {eventsForSelectedDate.length === 0 ? (
              <div className="mt-5">
                <div className="rounded-[26px] bg-white p-6 shadow-card">
                  <EmptyState title="Día libre" body="Agregá una actividad con el botón verde o elegí otro día." />
                </div>
              </div>
            ) : (
              <div className="mt-4 rounded-[26px] bg-white p-4 shadow-card">
                <div className="grid grid-cols-[56px_1fr] gap-3">
                  <div className="space-y-4 pt-1">
                    {timelineHours.map((hour, index) => {
                      const slotEvents = eventsForTimelineSlot(eventsForSelectedDate, hour, index);
                      const slotHeight = slotEvents.length ? Math.max(64, slotEvents.length * 64) : 56;
                      return (
                        <div key={hour} className="flex items-start" style={{ minHeight: slotHeight }}>
                          <p className="text-[12px] font-black text-monkey-muted">{hour}</p>
                        </div>
                      );
                    })}
                  </div>

                  <div className="space-y-4">
                    {timelineHours.map((hour, index) => {
                      const slotEvents = eventsForTimelineSlot(eventsForSelectedDate, hour, index);
                      const slotHeight = slotEvents.length ? Math.max(64, slotEvents.length * 64) : 56;
                      return (
                        <div key={hour} className="relative border-b border-gray-100 last:border-b-0" style={{ minHeight: slotHeight }}>
                          <span className="pointer-events-none absolute left-0 right-0 top-0 h-px bg-gray-100" />
                          {slotEvents.length ? (
                            <div className="space-y-2 pb-2 pt-1">
                              {slotEvents.map((event) => {
                                const meta = categoryFromEvent(event);
                                return (
                                  <div key={event.id} className="grid grid-cols-[1fr_34px] items-center gap-2">
                                    <button
                                      type="button"
                                      onClick={() => openEdit(event)}
                                      className={cn("flex min-h-[52px] min-w-0 items-center gap-3 rounded-[14px] px-4 py-3 text-left text-sm font-black transition active:scale-[.98]", meta.pillClass)}
                                    >
                                      <span className="text-lg leading-none">{meta.icon}</span>
                                      <span className="min-w-0 flex-1 truncate">{stripEmoji(event.title)}</span>
                                      <span className="shrink-0 text-[11px] font-black opacity-70">{event.time}</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setDeleteId(event.id)}
                                      className="grid h-9 w-9 place-items-center rounded-full bg-pink-50 text-monkey-pink"
                                      aria-label="Eliminar actividad"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </button>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <p className="pt-1 text-[10px] font-bold text-transparent" aria-hidden="true">
                              {formatTimelineRange(hour, index)}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="mt-5 rounded-[26px] bg-white p-4 shadow-card">
            <div className="mb-4 flex items-center justify-between">
              <button type="button" onClick={() => moveMonth(-1)} className="grid h-10 w-10 place-items-center rounded-full bg-gray-50 text-monkey-ink transition active:scale-95" aria-label="Mes anterior">
                <ChevronLeft className="h-5 w-5" />
              </button>
              <div className="text-center">
                <p className="text-sm font-black text-monkey-ink">{visibleMonth} {visibleYear}</p>
                <p className="text-[11px] font-bold text-monkey-muted">Tocá un día para ver su agenda</p>
              </div>
              <button type="button" onClick={() => moveMonth(1)} className="grid h-10 w-10 place-items-center rounded-full bg-gray-50 text-monkey-ink transition active:scale-95" aria-label="Mes siguiente">
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-black text-monkey-muted">
              {dayLetters.map((item, index) => <span key={`${item}-${index}`}>{item}</span>)}
            </div>

            <div className="mt-3 grid grid-cols-7 gap-2">
              {monthCells.map((cell) => {
                const isActive = cell.dateKey === selectedDateKey;
                const hasEvent = cell.dateKey ? eventDays.has(cell.dateKey) : false;
                return (
                  <button
                    key={cell.key}
                    type="button"
                    disabled={!cell.dateKey}
                    onClick={() => { if (cell.dateKey) selectDateKey(cell.dateKey); }}
                    className={cn(
                      "relative grid h-11 place-items-center rounded-[14px] text-sm font-black transition active:scale-95 disabled:pointer-events-none disabled:opacity-0",
                      isActive ? "bg-monkey-green text-white shadow-card" : "bg-gray-50 text-monkey-ink",
                    )}
                    aria-label={cell.dateKey ? `Ver actividades del ${cell.day}` : undefined}
                  >
                    {cell.day ?? ""}
                    {hasEvent ? <span className={cn("absolute bottom-1 h-1.5 w-1.5 rounded-full", isActive ? "bg-white" : "bg-monkey-green")} /> : null}
                  </button>
                );
              })}
            </div>

            <div className="mt-5 rounded-[18px] bg-green-50 p-4">
              <div className="flex items-start gap-3">
                <CalendarDays className="mt-0.5 h-5 w-5 text-monkey-greenDark" />
                <div>
                  <p className="text-sm font-black text-monkey-greenDark">Navegación rápida</p>
                  <p className="mt-1 text-xs leading-5 text-monkey-muted">Al seleccionar un día en el mes, volvés automáticamente a la vista semanal con sus actividades.</p>
                </div>
              </div>
            </div>
          </div>
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
        subtitle={`Se guardará para ${formatShortDate(selectedDate)}. Podés agregar una alerta simple.`}
        onClose={() => setSheetMode("closed")}
        onSubmit={submitEvent}
        submitLabel={editing ? "Guardar cambios" : "Crear actividad"}
      >
        <Field label="Nombre" value={title} onChange={(event: ChangeEvent<HTMLInputElement>) => setTitle(event.target.value)} placeholder="Ej: estudiar matemática" error={errors.title} />
        <Field label="Hora" value={time} onChange={(event: ChangeEvent<HTMLInputElement>) => setTime(event.target.value)} placeholder="09:00" error={errors.time} />

        <div>
          <span className="mb-2 block text-xs font-black uppercase tracking-[.08em] text-monkey-muted">Tipo de actividad</span>
          <div className="grid grid-cols-2 gap-2">
            {categories.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setCategory(item.id)}
                className={cn(
                  "flex h-12 min-w-0 items-center gap-2 rounded-[16px] px-3 text-left text-xs font-black transition active:scale-95",
                  category === item.id ? "bg-monkey-green text-white shadow-sm" : item.pillClass,
                )}
              >
                <span className="text-base">{item.icon}</span>
                <span className="truncate">{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <span className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-[.08em] text-monkey-muted"><Bell className="h-4 w-4" /> Alerta</span>
          <div className="grid grid-cols-2 gap-2">
            {alertOptions.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setAlertOption(item.id)}
                className={cn(
                  "min-h-11 rounded-[16px] px-3 text-xs font-black transition active:scale-95",
                  alertOption === item.id ? "bg-monkey-green text-white shadow-sm" : "bg-gray-100 text-monkey-muted",
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs leading-5 text-monkey-muted">La alerta se guarda como recordatorio y aparecerá en la sección Recordatorios.</p>
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
          <p className="mt-2 text-xs leading-5 text-monkey-muted">Tenés {eventsForSelectedDate.length} actividades para el día seleccionado y {upcomingCount} actividades próximas registradas.</p>
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
          if (deleteId) deleteEvent(deleteId);
          setDeleteId(null);
          notify("Actividad eliminada");
        }}
      />
    </AppShell>
  );
}
