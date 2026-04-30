import { AppShell } from "@/components/app-shell";

export default function NotesPage() {
  const notes = [
    ["Ideas 💡", "Crear contenido\nVideos\nPosts", "bg-yellow-100"],
    ["Recordatorio", "No olvidar reunión mañana 10:00 am", "bg-pink-100"],
    ["Metas 🎯", "Leer 12 libros\nCorrer 5k", "bg-green-100"],
    ["Motivación ✨", "Pequeños pasos, grandes cambios.", "bg-sky-100"]
  ];

  return (
    <AppShell>
      <section className="px-5 pt-8">
        <h1 className="text-2xl font-bold">Mis Notas</h1>
        <div className="mt-6 grid grid-cols-2 gap-4">
          {notes.map(([title, text, color]) => (
            <article key={title} className={`min-h-40 rounded-monkey p-4 shadow-sm ${color}`}>
              <h2 className="font-bold">{title}</h2>
              <p className="mt-3 whitespace-pre-line text-sm text-gray-700">{text}</p>
            </article>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
