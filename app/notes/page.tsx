"use client";

import { AppShell } from "@/components/app-shell";
import { MonkeyAvatar } from "@/components/monkey-avatar";
import { createId, useLocalStorageState } from "@/lib/local-storage";
import { notesSeed } from "@/lib/mock-data";
import type { Note } from "@/types";
import { Plus, Search, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";

const colorClass: Record<Note["color"], string> = { yellow: "bg-yellow-100", pink: "bg-pink-100", green: "bg-green-100", blue: "bg-sky-100", purple: "bg-purple-100" };
const colors: Note["color"][] = ["yellow", "pink", "green", "blue", "purple"];

export default function NotesPage() {
  const [notes, setNotes] = useLocalStorageState<Note[]>("monkey.notes.v22", notesSeed);
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => notes.filter((note) => `${note.title} ${note.body}`.toLowerCase().includes(query.toLowerCase())), [notes, query]);

  function saveNote(target?: Note) {
    const title = window.prompt("Título de la nota", target?.title ?? "Nueva nota")?.trim();
    if (!title) return;
    const body = window.prompt("Contenido", target?.body ?? "") ?? "";
    const color = target?.color ?? colors[notes.length % colors.length];
    if (target) {
      setNotes((list) => list.map((note) => note.id === target.id ? { ...note, title, body } : note));
      return;
    }
    setNotes((list) => [{ id: createId("note"), title, body, color, createdAt: new Date().toISOString() }, ...list]);
  }

  function deleteNote(id: string) {
    if (!window.confirm("¿Eliminar esta nota?")) return;
    setNotes((list) => list.filter((note) => note.id !== id));
  }

  return (
    <AppShell>
      <section className="page-pad relative pt-8">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-black tracking-tight">Mis Notas</h1>
          <div className="flex gap-2">
            <label className="grid h-11 w-11 place-items-center rounded-full bg-white shadow-sm" aria-label="Buscar notas"><Search className="h-5 w-5" /></label>
            <button onClick={() => saveNote()} className="grid h-11 w-11 place-items-center rounded-full bg-monkey-green text-white shadow-float" aria-label="Agregar nota"><Plus className="h-6 w-6" /></button>
          </div>
        </header>
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar nota..." className="mt-4 h-12 w-full rounded-[18px] border border-monkey-line bg-white px-4 text-sm outline-none focus:border-monkey-green focus:ring-4 focus:ring-green-100" />
        <div className="mt-6 grid grid-cols-2 gap-4">
          {filtered.length === 0 ? <div className="soft-card col-span-2 p-5 text-center text-sm font-semibold text-monkey-muted">No encontré notas. Tocá + para crear una.</div> : null}
          {filtered.map((note) => (
            <article key={note.id} className={`${colorClass[note.color]} group relative min-h-[145px] rounded-card p-4 shadow-card transition active:scale-[.98]`}>
              <button onClick={() => saveNote(note)} className="block w-full text-left">
                <h2 className="text-sm font-black text-monkey-ink">{note.title}</h2>
                <p className="mt-3 whitespace-pre-line text-[13px] leading-5 text-gray-700">{note.body}</p>
              </button>
              <button onClick={() => deleteNote(note.id)} className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-white/70 text-monkey-pink opacity-0 shadow-sm transition group-hover:opacity-100" aria-label="Eliminar nota"><Trash2 className="h-4 w-4" /></button>
            </article>
          ))}
        </div>
        <MonkeyAvatar size={118} variant="full" className="pointer-events-none absolute bottom-[78px] right-1" imageClassName="object-bottom" />
      </section>
    </AppShell>
  );
}
