"use client";

import { useState } from "react";
import { Bell, Plus, Trash2 } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { ConfirmSheet } from "@/components/confirm-sheet";
import { EmptyState } from "@/components/empty-state";
import { Field } from "@/components/field";
import { FormSheet } from "@/components/form-sheet";
import { Toast, ToastState } from "@/components/toast";
import { createId, useLocalStorageState } from "@/lib/local-storage";
import { remindersSeed } from "@/lib/mock-data";
import type { Reminder } from "@/types";

const repeatLabels: Record<Reminder["repeat"], string> = { daily: "Cada día", weekly: "Semanal", custom: "Personalizado" };
const repeats: Reminder["repeat"][] = ["daily", "weekly", "custom"];

export default function RemindersPage() {
  const [items, setItems] = useLocalStorageState<Reminder[]>("monkey.reminders.v23", remindersSeed);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<Reminder | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [time, setTime] = useState("08:00");
  const [repeat, setRepeat] = useState<Reminder["repeat"]>("daily");
  const [errors, setErrors] = useState<{ title?: string; time?: string }>({});
  const [toast, setToast] = useState<ToastState>(null);

  function notify(message: string) { setToast({ message, type: "success" }); window.setTimeout(() => setToast(null), 2200); }
  function openNew() { setEditing(null); setTitle(""); setTime("08:00"); setRepeat("daily"); setErrors({}); setSheetOpen(true); }
  function openEdit(item: Reminder) { setEditing(item); setTitle(item.title); setTime(item.time); setRepeat(item.repeat); setErrors({}); setSheetOpen(true); }
  function submit() {
    const nextErrors: { title?: string; time?: string } = {};
    if (title.trim().length < 3) nextErrors.title = "Agregá un título válido.";
    if (!/^\d{2}:\d{2}$/.test(time)) nextErrors.time = "Usá formato HH:MM.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    if (editing) setItems((list) => list.map((item) => item.id === editing.id ? { ...item, title: title.trim(), time, repeat } : item));
    else setItems((list) => [{ id: createId("reminder"), title: title.trim(), time, repeat, enabled: true }, ...list]);
    setSheetOpen(false);
    notify(editing ? "Recordatorio actualizado" : "Recordatorio creado");
  }

  return (
    <AppShell>
      <Toast toast={toast} onClose={() => setToast(null)} />
      <section className="page-pad pt-8"><div className="flex items-center justify-between"><h1 className="text-2xl font-black">Recordatorios</h1><button onClick={openNew} className="grid h-11 w-11 place-items-center rounded-full bg-monkey-green text-white shadow-float"><Plus /></button></div>
        <div className="mt-6 space-y-3">
          {items.length === 0 ? <EmptyState title="Sin recordatorios" body="Agregá alertas para no perder tareas importantes." /> : null}
          {items.map((item) => <div key={item.id} className="flex min-h-[68px] w-full items-center gap-3 rounded-card bg-white px-4 py-3 text-left shadow-card"><button onClick={() => openEdit(item)} className="flex flex-1 items-center gap-3 text-left"><span className="grid h-11 w-11 place-items-center rounded-[14px] bg-sky-100 text-sky-600"><Bell className="h-5 w-5" /></span><span className="flex-1"><span className="block text-sm font-black">{item.title}</span><span className="block text-xs text-monkey-muted">{repeatLabels[item.repeat]} - {item.time}</span></span></button><button onClick={() => setItems((list) => list.map((x) => x.id === item.id ? { ...x, enabled: !x.enabled } : x))} className={`relative h-7 w-12 rounded-pill transition ${item.enabled ? "bg-monkey-green" : "bg-gray-300"}`} aria-label="Activar recordatorio"><span className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${item.enabled ? "left-6" : "left-1"}`} /></button><button onClick={() => setDeleteId(item.id)} className="grid h-9 w-9 place-items-center rounded-full bg-pink-50 text-monkey-pink" aria-label="Eliminar recordatorio"><Trash2 className="h-4 w-4" /></button></div>)}
        </div>
      </section>
      <FormSheet open={sheetOpen} title={editing ? "Editar recordatorio" : "Nuevo recordatorio"} subtitle="Configurá una alerta visual para tu rutina." onClose={() => setSheetOpen(false)} onSubmit={submit} submitLabel={editing ? "Guardar" : "Crear recordatorio"}>
        <Field label="Título" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ej: Beber agua" error={errors.title} />
        <Field label="Hora" value={time} onChange={(e) => setTime(e.target.value)} placeholder="08:00" error={errors.time} />
        <div><span className="mb-2 block text-xs font-black uppercase tracking-[.08em] text-monkey-muted">Repetición</span><div className="grid grid-cols-3 gap-2">{repeats.map((item) => <button type="button" key={item} onClick={() => setRepeat(item)} className={`h-10 rounded-pill text-xs font-black ${repeat === item ? "bg-monkey-green text-white" : "bg-gray-100 text-monkey-muted"}`}>{repeatLabels[item]}</button>)}</div></div>
      </FormSheet>
      <ConfirmSheet open={!!deleteId} title="¿Eliminar recordatorio?" body="Se quitará de tu lista local de recordatorios." onCancel={() => setDeleteId(null)} onConfirm={() => { if (deleteId) setItems((list) => list.filter((item) => item.id !== deleteId)); setDeleteId(null); notify("Recordatorio eliminado"); }} />
    </AppShell>
  );
}
