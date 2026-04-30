import { AppShell } from "@/components/app-shell";
import { Plus, SlidersHorizontal } from "lucide-react";

const days = [["LUN", "13"], ["MAR", "14"], ["MIÉ", "15"], ["JUE", "16"], ["VIE", "17"], ["SÁB", "18"], ["DOM", "19"]];
const events = [
  { time: "06:00", title: "😊 Ejercicio", color: "bg-yellow-100 text-orange-600" },
  { time: "08:00", title: "🏃‍♂️ Estudiar", color: "bg-sky-100 text-sky-700" },
  { time: "12:00", title: "🌱 Clases", color: "bg-green-100 text-green-700" },
  { time: "14:00", title: "🍽️ Almuerzo", color: "bg-pink-100 text-pink-700" },
  { time: "16:00", title: "📘 Proyecto", color: "bg-purple-100 text-purple-700" },
  { time: "18:00", title: "🌙 Descanso", color: "bg-indigo-100 text-indigo-700" }
];

export default function CalendarPage() {
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
            return (
              <button key={num} className={active ? "rounded-[18px] bg-monkey-green py-3 text-center text-white shadow-card" : "rounded-[18px] bg-white py-3 text-center shadow-sm"}>
                <p className="text-[10px] font-bold opacity-70">{name}</p>
                <p className="text-base font-black">{num}</p>
              </button>
            );
          })}
        </div>
        <div className="mx-auto mt-4 grid h-10 w-[176px] grid-cols-2 rounded-pill bg-gray-100 p-1 text-sm font-bold">
          <button className="rounded-pill bg-monkey-green text-white">Semana</button>
          <button className="text-monkey-muted">Mes</button>
        </div>
        <div className="relative mt-6 min-h-[480px] rounded-card bg-white p-4 shadow-card">
          {events.map((event) => (
            <div key={event.title} className="mb-4 grid grid-cols-[54px_1fr] items-center gap-2">
              <span className="text-[11px] font-bold text-monkey-muted">{event.time}</span>
              <div className={`${event.color} rounded-[14px] px-4 py-3 text-sm font-bold`}>{event.title}</div>
            </div>
          ))}
        </div>
      </section>
      <button className="fixed bottom-[104px] right-[calc(50%-195px)] z-30 grid h-16 w-16 place-items-center rounded-full bg-monkey-green text-white shadow-float transition active:scale-95"><Plus /></button>
    </AppShell>
  );
}
