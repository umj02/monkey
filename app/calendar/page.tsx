"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Plus, SlidersHorizontal, Trash2 } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { ConfirmSheet } from "@/components/confirm-sheet";
import { EmptyState } from "@/components/empty-state";
import { Field } from "@/components/field";
import { FormSheet } from "@/components/form-sheet";
import { Toast, ToastState } from "@/components/toast";
import { useCalendarEvents } from "@/hooks/use-calendar-events";
import type { CalendarEvent } from "@/types";
import { cn } from "@/lib/utils";

const colors: CalendarEvent["color"][] = ["green", "blue", "yellow", "pink", "purple", "orange"];
const weekLabels = ["LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB", "DOM"];
const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
const eventClass: Record<CalendarEvent["color"], string> = {
  yellow: "bg-yellow-100 text-orange-600",
  blue: "bg-sky-100 text-sky-700",
  green: "bg-green-100 text-green-700",
  pink: "bg-pink-100 text-pink-700",
  purple: "bg-purple-100 text-purple-700",
  orange: "bg-orange-100 text-orange-700"
};

type CalendarSettingsMode = "closed" | "month" | "filters";

type MonthCell = {
  key: string;
  day: number | null;
  dateKey: string | null;
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

function addMonths(date: Date, amount: number) {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
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

export default function CalendarPage() {
  const { events, createEvent, updateEvent, deleteEvent } = useCalendarEvents();
  const [viewMode, setViewMode] = useState<"week" | "month">("week");
  const [selectedDate, setSelectedDate] = useState(() => new Date(2026, 4, 14));
  const [settingsMode, setSettingsMode] = useState<CalendarSettingsMode>("closed");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<CalendarEvent | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [time, setTime] = useState("09:00");
  const [color, setColor] = useState<CalendarEvent["color"]>("green");
  const [errors, setErrors] = useState<{ title?: string; time?: string }>({});
  const [toast, setToast] = useState<ToastState>(null);

  const selectedDateKey = toDateKey(selectedDate);
  const visibleMonth = monthNames[selectedDate.getMonth()];
  const visibleYear = selectedDate.getFullYear();
  const weekDates = useMemo(() => getWeekDates(selectedDate), [selectedDate]);
  const monthCells = useMemo(() => getMonthCells(selectedDate), [selectedDate]);

  const eventsForSelectedDate = useMemo(() => {
    return events.filter((event) => normalizeEventDate(event, "2026-05-14") === selectedDateKey);
  }, [events, selectedDateKey]);

  const eventDays = useMemo(() => {
    const days = new Set<string>();
    events.forEach((event) => days.add(normalizeEventDate(event, "2026-05-14")));
    return days;
  }, [events]);

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
  }

  function moveMonth(amount: number) {
    const nextMonth = addMonths(selectedDate, amount);
    setSelectedDate(nextMonth);
  }

  function goToday() {
    setSelectedDate(new Date(2026, 4, 14));
    setViewMode("week");
    setSettingsMode("closed");
  }

  function openNew() {
    setEditing(null);
    setTitle("");
    setTime("09:00");
    setColor("green");
    setErrors({});
    setSheetOpen(true);
  }

  function openEdit(event: CalendarEvent) {
    setEditing(event);
    setTitle(event.title);
    setTime(event.time);
    setColor(event.color);
    setErrors({});
    setSheetOpen(true);
  }

  function submit() {
    const nextErrors: { title?: string; time?: string } = {};
    if (title.trim().length < 3) nextErrors.title = "El título debe tener al menos 3 caracteres.";
    if (!/^\d{2}:\d{2}$/.test(time)) nextErrors.time = "Usá formato HH:MM.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    const payload = { title, time, color, date: selectedDateKey };
    if (editing) updateEvent(editing.id, payload);
    else createEvent(payload);
    setSheetOpen(false);
    notify(editing ? "Evento actualizado" : "Evento creado");
  }

  return (
    <AppShell>
      <Toast toast={toast} onClose={() => setToast(null)} />
      <section className="page-pad pt-8">
        <header className="flex items-center justify-between">
          <button onClick={() => setSettingsMode("month")} className="flex items-center gap-1 text-2xl font-black tracking-tight" aria-label="Cambiar mes">
            {visibleMonth}<span className="text-base">⌄</span>
          </button>
          <button onClick={() => setSettingsMode("filters")} className="grid h-10 w-10 place-items-center rounded-full bg-white shadow-sm" aria-label="Ajustes de calendario">
            <SlidersHorizontal className="h-5 w-5" />
          </button>
        </header>

        <div className="mt-5 grid grid-cols-7 gap-2">
          {weekDates.map((dayDate, index) => {
            const dateKey = toDateKey(dayDate);
            const active = dateKey === selectedDateKey;
            const hasEvent = eventDays.has(dateKey);
            return (
              <button
                key={dateKey}
                onClick={() => selectDay(dayDate)}
                className={cn(
                  "relative rounded-[18px] py-3 text-center shadow-sm transition active:scale-95",
                  active ? "bg-monkey-green text-white shadow-card" : "bg-white text-monkey-ink"
                )}
              >
                <p className="text-[10px] font-bold opacity-70">{weekLabels[index]}</p>
                <p className="text-base font-black">{dayDate.getDate()}</p>
                {hasEvent ? <span className={cn("absolute bottom-1 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full", active ? "bg-white" : "bg-monkey-green")} /> : null}
              </button>
            );
          })}
        </div>

        <div className="mx-auto mt-4 grid h-10 w-[176px] grid-cols-2 rounded-pill bg-gray-100 p-1 text-sm font-bold">
          <button onClick={() => setViewMode("week")} className={cn("rounded-pill transition", viewMode === "week" ? "bg-monkey-green text-white shadow-sm" : "text-monkey-muted")}>Semana</button>
          <button onClick={() => setViewMode("month")} className={cn("rounded-pill transition", viewMode === "month" ? "bg-monkey-green text-white shadow-sm" : "text-monkey-muted")}>Mes</button>
        </div>

        {viewMode === "week" ? (
          <div className="relative mt-6 min-h-[480px] rounded-card bg-white p-4 shadow-card">
            <div className="mb-4 flex items-center justify-between rounded-[18px] bg-gray-50 px-4 py-3">
              <div>
                <p className="text-xs font-bold text-monkey-muted">Día seleccionado</p>
                <p className="text-sm font-black text-monkey-ink">{selectedDate.getDate()} de {visibleMonth} {visibleYear}</p>
              </div>
              <button onClick={() => setViewMode("month")} className="rounded-pill bg-white px-4 py-2 text-xs font-black text-monkey-greenDark shadow-sm">Ver mes</button>
            </div>
            {eventsForSelectedDate.length === 0 ? <EmptyState title="Día libre" body="Agregá eventos para este día o seleccioná otra fecha." /> : null}
            {eventsForSelectedDate.map((event) => (
              <div key={event.id} className="mb-4 grid grid-cols-[54px_1fr_32px] items-center gap-2">
                <span className="text-[11px] font-bold text-monkey-muted">{event.time}</span>
                <button onClick={() => openEdit(event)} className={`${eventClass[event.color]} rounded-[14px] px-4 py-3 text-left text-sm font-bold transition active:scale-[.98]`}>{event.title}</button>
                <button onClick={() => setDeleteId(event.id)} className="grid h-8 w-8 place-items-center rounded-full bg-pink-50 text-monkey-pink" aria-label="Eliminar evento"><Trash2 className="h-4 w-4" /></button>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-6 rounded-card bg-white p-4 shadow-card">
            <div className="mb-4 flex items-center justify-between">
              <button onClick={() => moveMonth(-1)} className="grid h-10 w-10 place-items-center rounded-full bg-gray-50 text-monkey-ink" aria-label="Mes anterior"><ChevronLeft className="h-5 w-5" /></button>
              <p className="text-sm font-black text-monkey-ink">{visibleMonth} {visibleYear}</p>
              <button onClick={() => moveMonth(1)} className="grid h-10 w-10 place-items-center rounded-full bg-gray-50 text-monkey-ink" aria-label="Mes siguiente"><ChevronRight className="h-5 w-5" /></button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-black text-monkey-muted">
              {["L", "M", "M", "J", "V", "S", "D"].map((item, index) => <span key={`${item}-${index}`}>{item}</span>)}
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
                      isActive ? "bg-monkey-green text-white shadow-card" : "bg-gray-50 text-monkey-ink"
                    )}
                  >
                    {cell.day ?? ""}
                    {hasEvent ? <span className={cn("absolute bottom-1 h-1.5 w-1.5 rounded-full", isActive ? "bg-white" : "bg-monkey-green")} /> : null}
                  </button>
                );
              })}
            </div>
            <div className="mt-5 rounded-[18px] bg-green-50 p-4">
              <p className="text-sm font-black text-monkey-greenDark">Resumen del mes</p>
              <p className="mt-1 text-xs leading-5 text-monkey-muted">Seleccioná cualquier día para ver o agregar eventos. Los puntos verdes marcan actividad.</p>
            </div>
          </div>
        )}
      </section>

      <button onClick={openNew} className="fixed bottom-[104px] right-[calc(50%-195px)] z-30 grid h-16 w-16 place-items-center rounded-full bg-monkey-green text-white shadow-float transition active:scale-95" aria-label="Agregar evento"><Plus /></button>

      <FormSheet open={sheetOpen} title={editing ? "Editar evento" : "Nuevo evento"} subtitle={`Se guardará para el ${selectedDate.getDate()} de ${visibleMonth}.`} onClose={() => setSheetOpen(false)} onSubmit={submit} submitLabel={editing ? "Guardar evento" : "Crear evento"}>
        <Field label="Título" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ej: Clase de inglés" error={errors.title} />
        <Field label="Hora" value={time} onChange={(e) => setTime(e.target.value)} placeholder="09:00" error={errors.time} />
        <div><span className="mb-2 block text-xs font-black uppercase tracking-[.08em] text-monkey-muted">Color</span><div className="grid grid-cols-3 gap-2">{colors.map((item) => <button type="button" key={item} onClick={() => setColor(item)} className={`h-10 rounded-pill text-xs font-black ${color === item ? "bg-monkey-green text-white" : "bg-gray-100 text-monkey-muted"}`}>{item}</button>)}</div></div>
      </FormSheet>

      <FormSheet open={settingsMode !== "closed"} title={settingsMode === "month" ? "Cambiar mes" : "Ajustes de calendario"} subtitle={settingsMode === "month" ? "Movete entre meses sin perder tus eventos." : "Controlá cómo querés ver tu agenda."} onClose={() => setSettingsMode("closed")} onSubmit={() => setSettingsMode("closed")} submitLabel="Listo">
        <div className="flex items-center justify-between rounded-[20px] bg-gray-50 p-3">
          <button type="button" onClick={() => moveMonth(-1)} className="grid h-11 w-11 place-items-center rounded-full bg-white shadow-sm"><ChevronLeft className="h-5 w-5" /></button>
          <div className="text-center">
            <p className="text-lg font-black text-monkey-ink">{visibleMonth}</p>
            <p className="text-xs font-bold text-monkey-muted">{visibleYear}</p>
          </div>
          <button type="button" onClick={() => moveMonth(1)} className="grid h-11 w-11 place-items-center rounded-full bg-white shadow-sm"><ChevronRight className="h-5 w-5" /></button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <button type="button" onClick={() => setViewMode("week")} className={cn("h-12 rounded-pill text-sm font-black", viewMode === "week" ? "bg-monkey-green text-white" : "bg-gray-100 text-monkey-muted")}>Vista semana</button>
          <button type="button" onClick={() => setViewMode("month")} className={cn("h-12 rounded-pill text-sm font-black", viewMode === "month" ? "bg-monkey-green text-white" : "bg-gray-100 text-monkey-muted")}>Vista mes</button>
        </div>
        <button type="button" onClick={goToday} className="h-12 w-full rounded-pill bg-green-50 text-sm font-black text-monkey-greenDark">Volver al día principal</button>
      </FormSheet>

      <ConfirmSheet open={!!deleteId} title="¿Eliminar evento?" body="El evento se quitará de esta vista local." onCancel={() => setDeleteId(null)} onConfirm={() => { if (deleteId) deleteEvent(deleteId); setDeleteId(null); notify("Evento eliminado"); }} />
    </AppShell>
  );
}
