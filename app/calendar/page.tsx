"use client";

import { useMemo, useState } from "react";
import { Plus, SlidersHorizontal, Trash2 } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { ConfirmSheet } from "@/components/confirm-sheet";
import { EmptyState } from "@/components/empty-state";
import { Field } from "@/components/field";
import { FormSheet } from "@/components/form-sheet";
import { Toast, ToastState } from "@/components/toast";
import { useCalendarEvents } from "@/hooks/use-calendar-events";
import type { CalendarEvent } from "@/types";
import { cn } from "@/lib/utils";

const days = [["LUN", "13"], ["MAR", "14"], ["MIÉ", "15"], ["JUE", "16"], ["VIE", "17"], ["SÁB", "18"], ["DOM", "19"]];
const colors: CalendarEvent["color"][] = ["green", "blue", "yellow", "pink", "purple", "orange"];
const eventClass: Record<CalendarEvent["color"], string> = {
  yellow: "bg-yellow-100 text-orange-600",
  blue: "bg-sky-100 text-sky-700",
  green: "bg-green-100 text-green-700",
  pink: "bg-pink-100 text-pink-700",
  purple: "bg-purple-100 text-purple-700",
  orange: "bg-orange-100 text-orange-700"
};

const monthDays = Array.from({ length: 35 }, (_, index) => index + 1);

export default function CalendarPage() {
  const { events, createEvent, updateEvent, deleteEvent } = useCalendarEvents();
  const [viewMode, setViewMode] = useState<"week" | "month">("week");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<CalendarEvent | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [time, setTime] = useState("09:00");
  const [color, setColor] = useState<CalendarEvent["color"]>("green");
  const [errors, setErrors] = useState<{ title?: string; time?: string }>({});
  const [toast, setToast] = useState<ToastState>(null);

  const monthHighlights = useMemo(() => new Set([3, 8, 14, 18, 22, 27]), []);

  function notify(message: string) {
    setToast({ message, type: "success" });
    window.setTimeout(() => setToast(null), 2200);
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
    if (editing) updateEvent(editing.id, { title, time, color });
    else createEvent({ title, time, color });
    setSheetOpen(false);
    notify(editing ? "Evento actualizado" : "Evento creado");
  }

  return (
    <AppShell>
      <Toast toast={toast} onClose={() => setToast(null)} />
      <section className="page-pad pt-8">
        <header className="flex items-center justify-between">
          <button className="text-2xl font-black">Mayo⌄</button>
          <button className="grid h-10 w-10 place-items-center rounded-full bg-white shadow-sm" aria-label="Filtros de calendario">
            <SlidersHorizontal className="h-5 w-5" />
          </button>
        </header>

        <div className="mt-5 grid grid-cols-7 gap-2">
          {days.map(([name, num]) => {
            const active = num === "14";
            return (
              <button key={num} className={active ? "rounded-[18px] bg-monkey-green py-3 text-center text-white shadow-card" : "rounded-[18px] bg-white py-3 text-center shadow-sm"}>
                <p className="text-[10px] font-bold opacity-70">{name}</p>
                <p className="text-base font-black">{num}</p>
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
            {events.length === 0 ? <EmptyState title="Semana libre" body="Agregá eventos para ver tu rutina en orden." /> : null}
            {events.map((event) => (
              <div key={event.id} className="mb-4 grid grid-cols-[54px_1fr_32px] items-center gap-2">
                <span className="text-[11px] font-bold text-monkey-muted">{event.time}</span>
                <button onClick={() => openEdit(event)} className={`${eventClass[event.color]} rounded-[14px] px-4 py-3 text-left text-sm font-bold transition active:scale-[.98]`}>{event.title}</button>
                <button onClick={() => setDeleteId(event.id)} className="grid h-8 w-8 place-items-center rounded-full bg-pink-50 text-monkey-pink" aria-label="Eliminar evento"><Trash2 className="h-4 w-4" /></button>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-6 rounded-card bg-white p-4 shadow-card">
            <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-black text-monkey-muted">
              {["L", "M", "M", "J", "V", "S", "D"].map((item, index) => <span key={`${item}-${index}`}>{item}</span>)}
            </div>
            <div className="mt-3 grid grid-cols-7 gap-2">
              {monthDays.map((day) => {
                const isActive = day === 14;
                const hasEvent = monthHighlights.has(day);
                return (
                  <button key={day} className={cn("relative grid h-11 place-items-center rounded-[14px] text-sm font-black transition active:scale-95", isActive ? "bg-monkey-green text-white shadow-card" : "bg-gray-50 text-monkey-ink")}> 
                    {day <= 31 ? day : ""}
                    {hasEvent && day <= 31 ? <span className={cn("absolute bottom-1 h-1.5 w-1.5 rounded-full", isActive ? "bg-white" : "bg-monkey-green")} /> : null}
                  </button>
                );
              })}
            </div>
            <div className="mt-5 rounded-[18px] bg-green-50 p-4">
              <p className="text-sm font-black text-monkey-greenDark">Resumen del mes</p>
              <p className="mt-1 text-xs leading-5 text-monkey-muted">Tenés {events.length} eventos guardados. Los puntos verdes marcan días con actividad.</p>
            </div>
          </div>
        )}
      </section>

      <button onClick={openNew} className="fixed bottom-[104px] right-[calc(50%-195px)] z-30 grid h-16 w-16 place-items-center rounded-full bg-monkey-green text-white shadow-float transition active:scale-95" aria-label="Agregar evento"><Plus /></button>
      <FormSheet open={sheetOpen} title={editing ? "Editar evento" : "Nuevo evento"} subtitle="Ordená tu calendario con bloques visuales." onClose={() => setSheetOpen(false)} onSubmit={submit} submitLabel={editing ? "Guardar evento" : "Crear evento"}>
        <Field label="Título" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ej: Clase de inglés" error={errors.title} />
        <Field label="Hora" value={time} onChange={(e) => setTime(e.target.value)} placeholder="09:00" error={errors.time} />
        <div><span className="mb-2 block text-xs font-black uppercase tracking-[.08em] text-monkey-muted">Color</span><div className="grid grid-cols-3 gap-2">{colors.map((item) => <button type="button" key={item} onClick={() => setColor(item)} className={`h-10 rounded-pill text-xs font-black ${color === item ? "bg-monkey-green text-white" : "bg-gray-100 text-monkey-muted"}`}>{item}</button>)}</div></div>
      </FormSheet>
      <ConfirmSheet open={!!deleteId} title="¿Eliminar evento?" body="El evento se quitará de esta vista local." onCancel={() => setDeleteId(null)} onConfirm={() => { if (deleteId) deleteEvent(deleteId); setDeleteId(null); notify("Evento eliminado"); }} />
    </AppShell>
  );
}
