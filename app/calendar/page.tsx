"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Plus, SlidersHorizontal, Trash2, X } from "lucide-react";
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
const weekNames = ["LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB", "DOM"];
const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
const weekdayShort = ["L", "M", "M", "J", "V", "S", "D"];
const eventClass: Record<CalendarEvent["color"], string> = {
  yellow: "bg-yellow-100 text-orange-600",
  blue: "bg-sky-100 text-sky-700",
  green: "bg-green-100 text-green-700",
  pink: "bg-pink-100 text-pink-700",
  purple: "bg-purple-100 text-purple-700",
  orange: "bg-orange-100 text-orange-700"
};

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function toDateKey(year: number, monthIndex: number, day: number) {
  return `${year}-${pad(monthIndex + 1)}-${pad(day)}`;
}

function getDaysInMonth(year: number, monthIndex: number) {
  return new Date(year, monthIndex + 1, 0).getDate();
}

function getWeekDays(year: number, monthIndex: number, selectedDay: number) {
  const current = new Date(year, monthIndex, selectedDay);
  const mondayIndex = (current.getDay() + 6) % 7;
  const start = new Date(current);
  start.setDate(current.getDate() - mondayIndex);
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return {
      label: weekNames[index],
      day: date.getDate(),
      monthIndex: date.getMonth(),
      year: date.getFullYear(),
      dateKey: toDateKey(date.getFullYear(), date.getMonth(), date.getDate())
    };
  });
}

function getMonthGrid(year: number, monthIndex: number) {
  const firstDay = new Date(year, monthIndex, 1);
  const mondayOffset = (firstDay.getDay() + 6) % 7;
  const totalDays = getDaysInMonth(year, monthIndex);
  return Array.from({ length: 42 }, (_, index) => {
    const dayNumber = index - mondayOffset + 1;
    const inMonth = dayNumber >= 1 && dayNumber <= totalDays;
    return { day: inMonth ? dayNumber : null };
  });
}

export default function CalendarPage() {
  const { events, createEvent, updateEvent, deleteEvent } = useCalendarEvents();
  const [viewMode, setViewMode] = useState<"week" | "month">("week");
  const [year, setYear] = useState(2026);
  const [monthIndex, setMonthIndex] = useState(4);
  const [selectedDay, setSelectedDay] = useState(14);
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [showCalendarSettings, setShowCalendarSettings] = useState(false);
  const [showAllMonthEvents, setShowAllMonthEvents] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<CalendarEvent | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [time, setTime] = useState("09:00");
  const [color, setColor] = useState<CalendarEvent["color"]>("green");
  const [errors, setErrors] = useState<{ title?: string; time?: string }>({});
  const [toast, setToast] = useState<ToastState>(null);

  const selectedDateKey = toDateKey(year, monthIndex, selectedDay);
  const weekDays = useMemo(() => getWeekDays(year, monthIndex, selectedDay), [year, monthIndex, selectedDay]);
  const monthGrid = useMemo(() => getMonthGrid(year, monthIndex), [year, monthIndex]);
  const monthEventDays = useMemo(() => {
    const set = new Set<number>();
    events.forEach((event) => {
      const [eventYear, eventMonth, eventDay] = event.date.split("-").map(Number);
      if (eventYear === year && eventMonth === monthIndex + 1) set.add(eventDay);
    });
    return set;
  }, [events, monthIndex, year]);

  const visibleEvents = useMemo(() => {
    if (showAllMonthEvents) return events.filter((event) => event.date.startsWith(`${year}-${pad(monthIndex + 1)}-`));
    return events.filter((event) => event.date === selectedDateKey);
  }, [events, monthIndex, selectedDateKey, showAllMonthEvents, year]);

  function notify(message: string) {
    setToast({ message, type: "success" });
    window.setTimeout(() => setToast(null), 2200);
  }

  function changeMonth(direction: -1 | 1) {
    const next = new Date(year, monthIndex + direction, 1);
    const nextYear = next.getFullYear();
    const nextMonth = next.getMonth();
    const maxDay = getDaysInMonth(nextYear, nextMonth);
    setYear(nextYear);
    setMonthIndex(nextMonth);
    setSelectedDay((day) => Math.min(day, maxDay));
  }

  function selectMonth(nextMonth: number) {
    const maxDay = getDaysInMonth(year, nextMonth);
    setMonthIndex(nextMonth);
    setSelectedDay((day) => Math.min(day, maxDay));
    setShowMonthPicker(false);
    notify(`Calendario actualizado a ${monthNames[nextMonth]}`);
  }

  function selectDay(day: number, nextMonthIndex = monthIndex, nextYear = year) {
    setYear(nextYear);
    setMonthIndex(nextMonthIndex);
    setSelectedDay(day);
    setShowAllMonthEvents(false);
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
    if (editing) updateEvent(editing.id, { date: editing.date, title, time, color });
    else createEvent({ date: selectedDateKey, title, time, color });
    setSheetOpen(false);
    notify(editing ? "Evento actualizado" : "Evento creado");
  }

  return (
    <AppShell>
      <Toast toast={toast} onClose={() => setToast(null)} />
      <section className="page-pad pt-8">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button onClick={() => changeMonth(-1)} className="grid h-9 w-9 place-items-center rounded-full bg-white shadow-sm" aria-label="Mes anterior"><ChevronLeft className="h-4 w-4" /></button>
            <button onClick={() => setShowMonthPicker(true)} className="rounded-pill px-1 text-2xl font-black transition active:scale-95" aria-label="Cambiar mes">{monthNames[monthIndex]}⌄</button>
            <button onClick={() => changeMonth(1)} className="grid h-9 w-9 place-items-center rounded-full bg-white shadow-sm" aria-label="Mes siguiente"><ChevronRight className="h-4 w-4" /></button>
          </div>
          <button onClick={() => setShowCalendarSettings(true)} className="grid h-10 w-10 place-items-center rounded-full bg-white shadow-sm transition active:scale-95" aria-label="Ajustes de calendario">
            <SlidersHorizontal className="h-5 w-5" />
          </button>
        </header>

        <div className="mt-5 grid grid-cols-7 gap-2">
          {weekDays.map((day) => {
            const active = day.dateKey === selectedDateKey;
            const muted = day.monthIndex !== monthIndex;
            return (
              <button key={day.dateKey} onClick={() => selectDay(day.day, day.monthIndex, day.year)} className={cn("rounded-[18px] py-3 text-center shadow-sm transition active:scale-95", active ? "bg-monkey-green text-white shadow-card" : "bg-white text-monkey-ink", muted && !active ? "opacity-50" : "")}> 
                <p className="text-[10px] font-bold opacity-70">{day.label}</p>
                <p className="text-base font-black">{day.day}</p>
              </button>
            );
          })}
        </div>

        <div className="mx-auto mt-4 grid h-10 w-[176px] grid-cols-2 rounded-pill bg-gray-100 p-1 text-sm font-bold">
          <button onClick={() => setViewMode("week")} className={cn("rounded-pill transition", viewMode === "week" ? "bg-monkey-green text-white shadow-sm" : "text-monkey-muted")}>Semana</button>
          <button onClick={() => setViewMode("month")} className={cn("rounded-pill transition", viewMode === "month" ? "bg-monkey-green text-white shadow-sm" : "text-monkey-muted")}>Mes</button>
        </div>

        <p className="mt-4 text-center text-xs font-bold text-monkey-muted">
          {showAllMonthEvents ? `Mostrando eventos de ${monthNames[monthIndex]}` : `Día seleccionado: ${selectedDay} de ${monthNames[monthIndex]}`}
        </p>

        {viewMode === "week" ? (
          <div className="relative mt-4 min-h-[480px] rounded-card bg-white p-4 shadow-card">
            {visibleEvents.length === 0 ? <EmptyState title="Día libre" body="Agregá eventos para ver tu rutina en orden." /> : null}
            {visibleEvents.map((event) => (
              <div key={event.id} className="mb-4 grid grid-cols-[54px_1fr_32px] items-center gap-2">
                <span className="text-[11px] font-bold text-monkey-muted">{event.time}</span>
                <button onClick={() => openEdit(event)} className={`${eventClass[event.color]} rounded-[14px] px-4 py-3 text-left text-sm font-bold transition active:scale-[.98]`}>{event.title}</button>
                <button onClick={() => setDeleteId(event.id)} className="grid h-8 w-8 place-items-center rounded-full bg-pink-50 text-monkey-pink" aria-label="Eliminar evento"><Trash2 className="h-4 w-4" /></button>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-4 rounded-card bg-white p-4 shadow-card">
            <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-black text-monkey-muted">
              {weekdayShort.map((item, index) => <span key={`${item}-${index}`}>{item}</span>)}
            </div>
            <div className="mt-3 grid grid-cols-7 gap-2">
              {monthGrid.map((cell, index) => {
                if (!cell.day) return <span key={`blank-${index}`} className="h-11" />;
                const isActive = cell.day === selectedDay;
                const hasEvent = monthEventDays.has(cell.day);
                return (
                  <button key={cell.day} onClick={() => selectDay(cell.day)} className={cn("relative grid h-11 place-items-center rounded-[14px] text-sm font-black transition active:scale-95", isActive ? "bg-monkey-green text-white shadow-card" : "bg-gray-50 text-monkey-ink")}> 
                    {cell.day}
                    {hasEvent ? <span className={cn("absolute bottom-1 h-1.5 w-1.5 rounded-full", isActive ? "bg-white" : "bg-monkey-green")} /> : null}
                  </button>
                );
              })}
            </div>
            <div className="mt-5 rounded-[18px] bg-green-50 p-4">
              <p className="text-sm font-black text-monkey-greenDark">Resumen del mes</p>
              <p className="mt-1 text-xs leading-5 text-monkey-muted">Los puntos verdes marcan días con eventos. Tocá un día para seleccionarlo y luego agregá una actividad.</p>
            </div>
          </div>
        )}
      </section>

      <button onClick={openNew} className="fixed bottom-[104px] right-[calc(50%-195px)] z-30 grid h-16 w-16 place-items-center rounded-full bg-monkey-green text-white shadow-float transition active:scale-95" aria-label="Agregar evento"><Plus /></button>

      {showMonthPicker ? (
        <div className="fixed inset-0 z-50 mx-auto grid max-w-[430px] place-items-end bg-black/50 px-5 pb-6 pt-16">
          <section className="w-full animate-slideUp rounded-[28px] bg-white p-5 shadow-soft">
            <div className="flex items-start justify-between gap-4">
              <div><h2 className="text-xl font-black tracking-tight text-monkey-ink">Cambiar mes</h2><p className="mt-1 text-sm leading-5 text-monkey-muted">Elegí el mes que querés revisar.</p></div>
              <button type="button" onClick={() => setShowMonthPicker(false)} className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gray-100" aria-label="Cerrar"><X className="h-5 w-5" /></button>
            </div>
            <div className="mt-5 grid grid-cols-3 gap-2">
              {monthNames.map((month, index) => <button key={month} onClick={() => selectMonth(index)} className={cn("h-11 rounded-pill text-sm font-black transition active:scale-95", index === monthIndex ? "bg-monkey-green text-white shadow-sm" : "bg-gray-100 text-monkey-muted")}>{month.slice(0, 3)}</button>)}
            </div>
          </section>
        </div>
      ) : null}

      {showCalendarSettings ? (
        <div className="fixed inset-0 z-50 mx-auto grid max-w-[430px] place-items-end bg-black/50 px-5 pb-6 pt-16">
          <section className="w-full animate-slideUp rounded-[28px] bg-white p-5 shadow-soft">
            <div className="flex items-start justify-between gap-4">
              <div><h2 className="text-xl font-black tracking-tight text-monkey-ink">Ajustes de calendario</h2><p className="mt-1 text-sm leading-5 text-monkey-muted">Control rápido para navegar y filtrar tus actividades.</p></div>
              <button type="button" onClick={() => setShowCalendarSettings(false)} className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gray-100" aria-label="Cerrar"><X className="h-5 w-5" /></button>
            </div>
            <div className="mt-5 space-y-3">
              <button onClick={() => { setShowAllMonthEvents((value) => !value); notify(showAllMonthEvents ? "Mostrando día seleccionado" : "Mostrando todo el mes"); }} className="flex h-14 w-full items-center justify-between rounded-[18px] bg-gray-50 px-4 text-left text-sm font-black transition active:scale-[.98]"><span>{showAllMonthEvents ? "Ver solo día seleccionado" : "Ver todos los eventos del mes"}</span><span className="text-monkey-greenDark">›</span></button>
              <button onClick={() => { setViewMode("month"); setShowCalendarSettings(false); }} className="flex h-14 w-full items-center justify-between rounded-[18px] bg-gray-50 px-4 text-left text-sm font-black transition active:scale-[.98]"><span>Abrir vista mensual</span><span className="text-monkey-greenDark">›</span></button>
              <button onClick={() => { setYear(2026); setMonthIndex(4); setSelectedDay(14); setShowAllMonthEvents(false); setShowCalendarSettings(false); notify("Volviste al día base"); }} className="flex h-14 w-full items-center justify-between rounded-[18px] bg-green-50 px-4 text-left text-sm font-black text-monkey-greenDark transition active:scale-[.98]"><span>Volver a hoy</span><span>✓</span></button>
            </div>
          </section>
        </div>
      ) : null}

      <FormSheet open={sheetOpen} title={editing ? "Editar evento" : "Nuevo evento"} subtitle={editing ? "Ajustá el bloque seleccionado." : `Se agregará al ${selectedDay} de ${monthNames[monthIndex]}.`} onClose={() => setSheetOpen(false)} onSubmit={submit} submitLabel={editing ? "Guardar evento" : "Crear evento"}>
        <Field label="Título" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ej: Clase de inglés" error={errors.title} />
        <Field label="Hora" value={time} onChange={(e) => setTime(e.target.value)} placeholder="09:00" error={errors.time} />
        <div><span className="mb-2 block text-xs font-black uppercase tracking-[.08em] text-monkey-muted">Color</span><div className="grid grid-cols-3 gap-2">{colors.map((item) => <button type="button" key={item} onClick={() => setColor(item)} className={`h-10 rounded-pill text-xs font-black ${color === item ? "bg-monkey-green text-white" : "bg-gray-100 text-monkey-muted"}`}>{item}</button>)}</div></div>
      </FormSheet>
      <ConfirmSheet open={!!deleteId} title="¿Eliminar evento?" body="El evento se quitará de esta vista local." onCancel={() => setDeleteId(null)} onConfirm={() => { if (deleteId) deleteEvent(deleteId); setDeleteId(null); notify("Evento eliminado"); }} />
    </AppShell>
  );
}
