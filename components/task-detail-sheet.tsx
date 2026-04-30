"use client";

import { useEffect, useState } from "react";
import { Check, Trash2, X } from "lucide-react";
import { MonkeyAvatar } from "@/components/monkey-avatar";
import { ConfirmSheet } from "@/components/confirm-sheet";
import type { Task, TimeBlock } from "@/types";

type Props = {
  open: boolean;
  block?: TimeBlock | null;
  task?: Task | null;
  onClose: () => void;
  onToggle?: (blockId: string, taskId: string) => void;
  onEdit?: (blockId: string, taskId: string, title: string) => void;
  onDelete?: (blockId: string, taskId: string) => void;
};

export function TaskDetailSheet({ open, block, task, onClose, onToggle, onEdit, onDelete }: Props) {
  const selectedTask = task ?? block?.tasks[0] ?? null;
  const [title, setTitle] = useState(selectedTask?.title ?? "");
  const [editing, setEditing] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    setTitle(selectedTask?.title ?? "");
    setEditing(false);
  }, [selectedTask?.id, selectedTask?.title]);

  if (!open || !block) return null;

  function saveTitle() {
    if (!selectedTask || title.trim().length < 3) return;
    onEdit?.(block.id, selectedTask.id, title.trim());
    setEditing(false);
  }

  return (
    <>
      <div className="fixed inset-0 z-50 mx-auto max-w-[430px] bg-black/55 px-5 pb-6 pt-20">
        <section className="animate-pop rounded-[28px] bg-white p-5 shadow-soft">
          <button onClick={onClose} className="grid h-10 w-10 place-items-center rounded-full bg-gray-100" aria-label="Cerrar"><X className="h-5 w-5" /></button>
          <div className="flex justify-center"><MonkeyAvatar size={92} variant="full" imageClassName="object-bottom" /></div>
          <h2 className="mt-2 text-2xl font-black">{block.title}</h2>
          <p className="mt-1 text-sm font-semibold text-monkey-muted">{block.time}</p>
          {selectedTask ? (
            <div className="mt-4 rounded-[18px] bg-gray-50 p-3">
              <p className="text-xs font-black uppercase tracking-[.08em] text-monkey-muted">Tarea seleccionada</p>
              {editing ? <input value={title} onChange={(e) => setTitle(e.target.value)} className="mt-2 h-11 w-full rounded-[14px] border border-monkey-line px-3 text-sm font-bold outline-none focus:border-monkey-green focus:ring-4 focus:ring-green-100" /> : <p className="mt-2 text-sm font-black text-monkey-ink">{selectedTask.title}</p>}
              {editing && title.trim().length > 0 && title.trim().length < 3 ? <p className="mt-2 text-xs font-bold text-monkey-pink">Usá al menos 3 caracteres.</p> : null}
            </div>
          ) : null}
          <div className="mt-4 space-y-2">
            {block.tasks.map((item) => (
              <button key={item.id} onClick={() => onToggle?.(block.id, item.id)} className="flex h-10 w-full items-center gap-3 rounded-[14px] px-2 text-left text-sm transition active:scale-[.98]">
                <span className={item.done ? "grid h-5 w-5 place-items-center rounded-md bg-monkey-green text-white" : "h-5 w-5 rounded-md border border-gray-300 bg-white"}>{item.done ? <Check className="h-3.5 w-3.5" /> : null}</span>
                <span className={item.done ? "text-gray-400 line-through" : ""}>{item.title}</span>
              </button>
            ))}
          </div>
          <div className="mt-5 flex gap-3">
            {editing ? <button className="flex-1 rounded-pill bg-monkey-green px-5 py-4 text-sm font-bold text-white" onClick={saveTitle}>Guardar cambios</button> : <button className="flex-1 rounded-pill bg-monkey-green px-5 py-4 text-sm font-bold text-white" onClick={() => setEditing(true)}>Editar tarea</button>}
            <button className="grid w-14 place-items-center rounded-pill bg-pink-100 text-monkey-pink" onClick={() => selectedTask && setConfirmOpen(true)} aria-label="Eliminar tarea"><Trash2 /></button>
          </div>
        </section>
      </div>
      <ConfirmSheet open={confirmOpen} title="¿Eliminar tarea?" body="Esta acción quitará la tarea de tu día. Luego en Supabase podremos guardar historial si lo necesitás." onCancel={() => setConfirmOpen(false)} onConfirm={() => { if (selectedTask) onDelete?.(block.id, selectedTask.id); setConfirmOpen(false); }} />
    </>
  );
}
