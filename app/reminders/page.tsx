"use client";

import { AppShell } from "@/components/app-shell";
import { MonkeyAvatar } from "@/components/monkey-avatar";
import { createId, useLocalStorageState } from "@/lib/local-storage";
import { remindersSeed } from "@/lib/mock-data";
import type { Reminder } from "@/types";
import { Trash2 } from "lucide-react";

const icons = ["💧", "📒", "🧘", "🌙", "✨"];
const colors = ["bg-sky-100", "bg-yellow-100", "bg-pink-100", "bg-purple-100", "bg-green-100"];

export default function RemindersPage() {
  const [items, setItems] = useLocalStorageState<Reminder[]>("monkey.reminders.v22", remindersSeed);

  function addReminder() {
    const title = window.prompt("Nuevo recordatorio", "Beber agua")?.trim();
    if (!title) return;
    const time = window.prompt("Hora", "08:00")?.trim() || "08:00";
    const newReminder: Reminder = { id: createId("reminder"), title, time, repeat: "daily", enabled: true };
    setItems((list) => [...list, newReminder]);
  }

  function editReminder(item: Reminder) {
    const title = window.prompt("Editar recordatorio", item.title)?.trim();
    if (!title) return;
    const time = window.prompt("Hora", item.time)?.trim() || item.time;
    setItems((list) => list.map((x) => x.id === item.id ? { ...x, title, time } : x));
  }

  function removeReminder(id: string) {
    if (!window.confirm("¿Eliminar recordatorio?")) return;
    setItems((list) => list.filter((x) => x.id !== id));
  }

  return (
    <AppShell>
      <section className="page-pad pt-8">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-black">Recordatorios</h1>
          <MonkeyAvatar size={38} variant="face" />
        </header>
        <div className="mt-6 space-y-3">
          {items.map((item, index) => (
            <div key={item.id} className="group flex h-[68px] w-full items-center gap-3 rounded-card bg-white px-4 text-left shadow-card transition active:scale-[.98]">
              <button onClick={() => editReminder(item)} className="flex flex-1 items-center gap-3 text-left">
                <span className={`${colors[index % colors.length]} grid h-11 w-11 place-items-center rounded-[14px] text-xl`}>{icons[index % icons.length]}</span>
                <span className="flex-1"><span className="block text-sm font-black">{item.title}</span><span className="block text-xs text-monkey-muted">Cada día · {item.time}</span></span>
              </button>
              <button onClick={() => setItems((list) => list.map((x) => (x.id === item.id ? { ...x, enabled: !x.enabled } : x)))} className={`relative h-7 w-12 rounded-pill transition ${item.enabled ? "bg-monkey-green" : "bg-gray-300"}`} aria-label="Activar recordatorio"><span className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${item.enabled ? "left-6" : "left-1"}`} /></button>
              <button onClick={() => removeReminder(item.id)} className="grid h-8 w-8 place-items-center rounded-full bg-pink-50 text-monkey-pink opacity-0 transition group-hover:opacity-100" aria-label="Eliminar"><Trash2 className="h-4 w-4" /></button>
            </div>
          ))}
        </div>
        <button onClick={addReminder} className="mt-8 h-14 w-full rounded-pill bg-monkey-green text-sm font-bold text-white shadow-float">+ Agregar recordatorio</button>
      </section>
    </AppShell>
  );
}
