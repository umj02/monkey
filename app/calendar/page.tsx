"use client";

import { AppShell } from "@/components/app-shell";
import { createId, useLocalStorageState } from "@/lib/local-storage";
import { calendarSeed } from "@/lib/mock-data";
import type { CalendarEvent } from "@/types";
import { Plus, SlidersHorizontal, Trash2 } from "lucide-react";

const days = [["LUN", "13"], ["MAR", "14"], ["MIÉ", "15"], ["JUE", "16"], ["VIE", "17"], ["SÁB", "18"], ["DOM", "19"]];
const eventClass: Record<CalendarEvent["color"], string> = {
  yellow: "bg-yellow-100 text-orange-600",
  blue: "bg-sky-100 text-sky-700",
  green: "bg-green-100 text-green-700",
  pink: "bg-pink-100 text-pink-700",
  purple: "bg-purple-100 text-purple-700",
  orange: "bg-orange-100 text-orange-700"
};

export default function CalendarPage() {
  const [events, setEvents] = useLocalStorageState<CalendarEvent[]>("monkey.calendar.v22", calendarSeed as CalendarEvent[]);

  function addEvent() {
    const title = window.prompt("Nombre del evento", "✨ Nuevo evento")?.trim();
    if (!title) return;
    const time = window.prompt("Hora", "09:00")?.trim() || "09:00";
    const newEvent: CalendarEvent = { id: createId("event"), title, time, color: "green" };
    setEvents((list) => [...list, newEvent].sort((a, b) => a.time.localeCompare(b.time)));
  }

  function editEvent(event: CalendarEvent) {
    const title = window.prompt("Editar evento", event.title)?.trim();
    if (!title) return;
    const time = window.prompt("Hora", event.time)?.trim() || event.time;
    setEvents((list) => list.map((item) => item.id === event.id ? { ...item, title, time } : item).sort((a, b) => a.time.localeCompare(b.time)));
  }

  function deleteEvent(id: string) {
    if (!window.confirm("¿Eliminar evento?")) return;
    setEvents((list) => list.filter((item) => item.id !== id));
  }

  return (
    <AppShell>
      <section className="page-pad pt-8">
        <header className="flex items-center justify-between">
          <button className="text-2xl font-black">Mayo⌄</button>
          <button className="grid h-10 w-10 place-items-center rounded-full bg-white shadow-sm"><SlidersHorizontal className="h-5 w-5" /></button>
        </header>
        <div className="mt-5 grid grid-cols-7 gap-2">
          {days.map(([name, num]) => {
            const active = num === "14";
            return <button key={num} className={active ? "rounded-[18px] bg-monkey-green py-3 text-center text-white shadow-card" : "rounded-[18px] bg-white py-3 text-center shadow-sm"}><p className="text-[10px] font-bold opacity-70">{name}</p><p className="text-base font-black">{num}</p></button>;
          })}
        </div>
        <div className="mx-auto mt-4 grid h-10 w-[176px] grid-cols-2 rounded-pill bg-gray-100 p-1 text-sm font-bold">
          <button className="rounded-pill bg-monkey-green text-white">Semana</button><button className="text-monkey-muted">Mes</button>
        </div>
        <div className="relative mt-6 min-h-[480px] rounded-card bg-white p-4 shadow-card">
          {events.length === 0 ? <p className="py-10 text-center text-sm font-semibold text-monkey-muted">No hay eventos. Tocá + para agregar.</p> : null}
          {events.map((event) => (
            <div key={event.id} className="group mb-4 grid grid-cols-[54px_1fr_32px] items-center gap-2">
              <span className="text-[11px] font-bold text-monkey-muted">{event.time}</span>
              <button onClick={() => editEvent(event)} className={`${eventClass[event.color]} rounded-[14px] px-4 py-3 text-left text-sm font-bold`}>{event.title}</button>
              <button onClick={() => deleteEvent(event.id)} className="grid h-8 w-8 place-items-center rounded-full bg-pink-50 text-monkey-pink opacity-0 transition group-hover:opacity-100" aria-label="Eliminar evento"><Trash2 className="h-4 w-4" /></button>
            </div>
          ))}
        </div>
      </section>
      <button onClick={addEvent} className="fixed bottom-[104px] right-[calc(50%-195px)] z-30 grid h-16 w-16 place-items-center rounded-full bg-monkey-green text-white shadow-float transition active:scale-95" aria-label="Agregar evento"><Plus /></button>
    </AppShell>
  );
}
