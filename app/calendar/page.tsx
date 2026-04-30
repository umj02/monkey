import { AppShell } from "@/components/app-shell";

export default function CalendarPage() {
  const days = ["LUN 13", "MAR 14", "MIÉ 15", "JUE 16", "VIE 17", "SÁB 18", "DOM 19"];
  return (
    <AppShell>
      <section className="px-5 pt-8">
        <h1 className="text-2xl font-bold">Calendario</h1>
        <div className="mt-5 grid grid-cols-7 gap-2">
          {days.map((day) => (
            <button key={day} className="rounded-2xl bg-white px-2 py-3 text-xs font-bold shadow-sm first:bg-monkey-green first:text-white">{day}</button>
          ))}
        </div>
        <div className="mt-6 space-y-4">
          {["06:00 ☀️ Rutina", "08:00 📚 Estudio", "12:00 🍱 Almuerzo", "16:00 🎮 Descanso"].map(item => (
            <div key={item} className="rounded-monkey bg-white p-5 shadow-sm">{item}</div>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
