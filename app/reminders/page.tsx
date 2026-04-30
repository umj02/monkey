"use client";

import { useState } from "react";
import { AppShell } from "@/components/app-shell";

const base = [
  { id: "water", title: "Beber agua", subtitle: "Cada día · 08:00", icon: "💧", color: "bg-sky-100", on: true },
  { id: "study", title: "Estudiar", subtitle: "Cada día · 10:00", icon: "📒", color: "bg-yellow-100", on: true },
  { id: "meditate", title: "Meditar", subtitle: "Lun, Mié, Vie · 18:00", icon: "🧘", color: "bg-pink-100", on: true },
  { id: "sleep", title: "Dormir", subtitle: "Cada día · 22:30", icon: "🌙", color: "bg-purple-100", on: false }
];

export default function RemindersPage() {
  const [items, setItems] = useState(base);

  return (
    <AppShell>
      <section className="page-pad pt-8">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-black">Recordatorios</h1>
          <span className="text-3xl">🐵</span>
        </header>
        <div className="mt-6 space-y-3">
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => setItems((list) => list.map((x) => (x.id === item.id ? { ...x, on: !x.on } : x)))}
              className="flex h-[68px] w-full items-center gap-3 rounded-card bg-white px-4 text-left shadow-card transition active:scale-[.98]"
            >
              <span className={`${item.color} grid h-11 w-11 place-items-center rounded-[14px] text-xl`}>{item.icon}</span>
              <span className="flex-1"><span className="block text-sm font-black">{item.title}</span><span className="block text-xs text-monkey-muted">{item.subtitle}</span></span>
              <span className={`relative h-7 w-12 rounded-pill transition ${item.on ? "bg-monkey-green" : "bg-gray-300"}`}><span className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${item.on ? "left-6" : "left-1"}`} /></span>
            </button>
          ))}
        </div>
        <button className="mt-8 h-14 w-full rounded-pill bg-monkey-green text-sm font-bold text-white shadow-float">+ Agregar recordatorio</button>
      </section>
    </AppShell>
  );
}
