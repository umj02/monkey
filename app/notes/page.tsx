import { AppShell } from "@/components/app-shell";
import { MonkeyAvatar } from "@/components/monkey-avatar";
import { Plus, Search } from "lucide-react";

const notes = [
  { title: "Ideas 💡", body: "Crear contenido para redes\n- Videos\n- Posts", color: "bg-yellow-100" },
  { title: "Recordatorio", body: "No olvidar la reunión de mañana\n10:00 am", color: "bg-pink-100" },
  { title: "Metas 🎯", body: "- Leer 12 libros este año\n- Correr 5k", color: "bg-green-100" },
  { title: "Motivación ✨", body: "Pequeños pasos, grandes cambios.", color: "bg-sky-100" },
  { title: "Tareas pendientes", body: "☑ Enviar proyecto\n☑ Estudiar capítulo 4\n☐ Comprar regalo", color: "bg-purple-100" }
];

export default function NotesPage() {
  return (
    <AppShell>
      <section className="page-pad pt-8">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-black tracking-tight">Mis Notas</h1>
          <div className="flex gap-2">
            <button className="grid h-11 w-11 place-items-center rounded-full bg-white shadow-sm"><Search className="h-5 w-5" /></button>
            <button className="grid h-11 w-11 place-items-center rounded-full bg-monkey-green text-white shadow-float"><Plus className="h-6 w-6" /></button>
          </div>
        </header>
        <div className="mt-6 grid grid-cols-2 gap-4">
          {notes.map((note) => (
            <article key={note.title} className={`${note.color} min-h-[145px] rounded-card p-4 shadow-card transition active:scale-[.98]`}>
              <h2 className="text-sm font-black text-monkey-ink">{note.title}</h2>
              <p className="mt-3 whitespace-pre-line text-[13px] leading-5 text-gray-700">{note.body}</p>
            </article>
          ))}
          <MonkeyAvatar size={118} variant="full" className="pointer-events-none absolute bottom-[78px] right-1" imageClassName="object-bottom" />
        </div>
      </section>
    </AppShell>
  );
}
