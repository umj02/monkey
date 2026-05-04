"use client";

import { AppShell } from "@/components/app-shell";
import { ConfirmSheet } from "@/components/confirm-sheet";
import { EmptyState } from "@/components/empty-state";
import { Field, TextAreaField } from "@/components/field";
import { FormSheet } from "@/components/form-sheet";
import { Toast, ToastState } from "@/components/toast";
import { useNotes } from "@/hooks/use-notes";
import type { Note } from "@/types";
import { Plus, Search, Trash2 } from "lucide-react";
import { useState } from "react";

const colorClass: Record<Note["color"], string> = { yellow: "bg-yellow-100", pink: "bg-pink-100", green: "bg-green-100", blue: "bg-sky-100", purple: "bg-purple-100" };
const colors: Note["color"][] = ["yellow", "pink", "green", "blue", "purple"];

export default function NotesPage() {
  const { query, setQuery, filteredNotes, createNote, updateNote, deleteNote } = useNotes();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<Note | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [color, setColor] = useState<Note["color"]>("yellow");
  const [errors, setErrors] = useState<{ title?: string; body?: string }>({});
  const [toast, setToast] = useState<ToastState>(null);

  function notify(message: string) { setToast({ message, type: "success" }); window.setTimeout(() => setToast(null), 2200); }
  function openNew() { setEditing(null); setTitle(""); setBody(""); setColor("yellow"); setErrors({}); setSheetOpen(true); }
  function openEdit(note: Note) { setEditing(note); setTitle(note.title); setBody(note.body); setColor(note.color); setErrors({}); setSheetOpen(true); }
  function submit() {
    const nextErrors: { title?: string; body?: string } = {};
    if (title.trim().length < 2) nextErrors.title = "Agregá un título.";
    if (body.trim().length < 3) nextErrors.body = "Escribí una nota un poco más completa.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    if (editing) updateNote(editing.id, { title, body, color });
    else createNote({ title, body, color });
    setSheetOpen(false);
    notify(editing ? "Nota actualizada" : "Nota creada");
  }

  return (
    <AppShell>
      <Toast toast={toast} onClose={() => setToast(null)} />
      <section className="page-pad pt-8">
        <header className="flex items-center justify-between"><h1 className="text-2xl font-black tracking-tight">Mis Notas</h1><div className="flex gap-2"><button className="grid h-11 w-11 place-items-center rounded-full bg-white shadow-sm"><Search className="h-5 w-5" /></button><button onClick={openNew} className="grid h-11 w-11 place-items-center rounded-full bg-monkey-green text-white shadow-float"><Plus /></button></div></header>
        <div className="mt-5 rounded-[18px] bg-white px-4 shadow-sm"><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar nota..." className="h-12 w-full bg-transparent text-sm font-semibold outline-none placeholder:text-gray-400" /></div>
        <div className="mt-6 grid grid-cols-2 gap-4">
          {filteredNotes.length === 0 ? <div className="col-span-2"><EmptyState title={query ? "Sin resultados" : "No hay notas"} body={query ? "Probá buscar con otra palabra." : "Creá tu primera nota rápida."} /></div> : null}
          {filteredNotes.map((note) => <article key={note.id} className={`${colorClass[note.color]} min-h-[145px] rounded-card p-4 shadow-card transition active:scale-[.98]`}><button onClick={() => openEdit(note)} className="block w-full text-left"><h2 className="text-sm font-black text-monkey-ink">{note.title}</h2><p className="mt-3 whitespace-pre-line text-[13px] leading-5 text-gray-700">{note.body}</p></button><button onClick={() => setDeleteId(note.id)} className="mt-3 grid h-8 w-8 place-items-center rounded-full bg-white/70 text-monkey-pink" aria-label="Eliminar nota"><Trash2 className="h-4 w-4" /></button></article>)}
        </div>
      </section>
      <FormSheet open={sheetOpen} title={editing ? "Editar nota" : "Nueva nota"} subtitle="Guardá ideas, recordatorios o metas." onClose={() => setSheetOpen(false)} onSubmit={submit} submitLabel={editing ? "Guardar nota" : "Crear nota"}>
        <Field label="Título" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ej: Ideas" error={errors.title} />
        <TextAreaField label="Contenido" value={body} onChange={(e) => setBody(e.target.value)} placeholder="Escribí tu nota..." error={errors.body} />
        <div><span className="mb-2 block text-xs font-black uppercase tracking-[.08em] text-monkey-muted">Color</span><div className="grid grid-cols-5 gap-2">{colors.map((item) => <button type="button" key={item} onClick={() => setColor(item)} className={`h-10 rounded-full ${colorClass[item]} ${color === item ? "ring-4 ring-monkey-green/25" : ""}`} aria-label={item} />)}</div></div>
      </FormSheet>
      <ConfirmSheet open={!!deleteId} title="¿Eliminar nota?" body="Esta nota se eliminará de tu cuenta." onCancel={() => setDeleteId(null)} onConfirm={() => { if (deleteId) deleteNote(deleteId); setDeleteId(null); notify("Nota eliminada"); }} />
    </AppShell>
  );
}
