"use client";

import { useEffect, useMemo, useState } from "react";
import { Bell, BellOff, Check, Trash2, X } from "lucide-react";
import { AssetThumb } from "@/components/asset-thumb";
import { ConfirmSheet } from "@/components/confirm-sheet";
import type { Task, TimeBlock } from "@/types";

type Props = {
  open: boolean;
  block?: TimeBlock | null;
  task?: Task | null;
  onClose: () => void;
  onToggle?: (blockId: string, taskId: string) => void;
  onEdit?: (blockId: string, taskId: string, title: string) => void;
  onReminderChange?: (blockId: string, taskId: string, reminderAt: string | null) => void;
  onDelete?: (blockId: string, taskId: string) => void;
};

function timeFromReminder(reminderAt?: string | null, fallback = "08:00") {
  if (!reminderAt) return fallback;
  const date = new Date(reminderAt);
  if (Number.isNaN(date.getTime())) return fallback;
  return date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false });
}

function createReminderIso(block: TimeBlock, reminderTime: string) {
  const dateKey = block.date || new Date().toISOString().slice(0, 10);
  const value = new Date(`${dateKey}T${reminderTime}:00`);
  return Number.isNaN(value.getTime()) ? null : value.toISOString();
}

export function TaskDetailSheet({ open, block, task, onClose, onToggle, onEdit, onReminderChange, onDelete }: Props) {
  const selectedTask = task ?? block?.tasks[0] ?? null;
  const [title, setTitle] = useState(selectedTask?.title ?? "");
  const [editing, setEditing] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [reminderEnabled, setReminderEnabled] = useState(Boolean(selectedTask?.reminderAt));
  const [reminderTime, setReminderTime] = useState(timeFromReminder(selectedTask?.reminderAt, block?.time || "08:00"));

  useEffect(() => {
    setTitle(selectedTask?.title ?? "");
    setEditing(false);
    setReminderEnabled(Boolean(selectedTask?.reminderAt));
    setReminderTime(timeFromReminder(selectedTask?.reminderAt, block?.time || "08:00"));
  }, [block?.time, selectedTask?.id, selectedTask?.reminderAt, selectedTask?.title]);

  const reminderLabel = useMemo(() => {
    if (!reminderEnabled) return "Recordatorio apagado";
    return `Recordatorio a las ${reminderTime}`;
  }, [reminderEnabled, reminderTime]);

  if (!open || !block) return null;

  const activeBlock = block;

  function saveTitle() {
    if (!selectedTask || title.trim().length < 3) return;
    onEdit?.(activeBlock.id, selectedTask.id, title.trim());
    setEditing(false);
  }

  function applyReminder(nextEnabled: boolean, nextTime = reminderTime) {
    if (!selectedTask) return;
    setReminderEnabled(nextEnabled);
    if (!nextEnabled) {
      onReminderChange?.(activeBlock.id, selectedTask.id, null);
      return;
    }
    const reminderAt = createReminderIso(activeBlock, nextTime);
    if (reminderAt) onReminderChange?.(activeBlock.id, selectedTask.id, reminderAt);
  }

  function changeReminderTime(value: string) {
    setReminderTime(value);
    if (reminderEnabled && selectedTask) {
      const reminderAt = createReminderIso(activeBlock, value);
      if (reminderAt) onReminderChange?.(activeBlock.id, selectedTask.id, reminderAt);
    }
  }

  return (
    <>
      <div className="fixed inset-0 z-50 mx-auto max-w-[430px] bg-black/55 px-5 pb-6 pt-20">
        <section className="max-h-[calc(100dvh-110px)] overflow-y-auto animate-pop rounded-[28px] bg-white p-5 shadow-soft no-scrollbar">
          <button onClick={onClose} className="grid h-10 w-10 place-items-center rounded-full bg-gray-100" aria-label="Cerrar"><X className="h-5 w-5" /></button>
          <div className="flex justify-center"><AssetThumb icon={activeBlock.icon} size={92} className="rounded-[26px] bg-green-50 p-2" /></div>
          <h2 className="mt-2 text-2xl font-black">{activeBlock.title}</h2>
          <p className="mt-1 text-sm font-semibold text-monkey-muted">{activeBlock.time}</p>
          {selectedTask ? (
            <div className="mt-4 rounded-[18px] bg-gray-50 p-3">
              <p className="text-xs font-black uppercase tracking-[.08em] text-monkey-muted">Tarea seleccionada</p>
              {editing ? <input value={title} onChange={(e) => setTitle(e.target.value)} className="mt-2 h-11 w-full rounded-[14px] border border-monkey-line px-3 text-sm font-bold outline-none focus:border-monkey-green focus:ring-4 focus:ring-green-100" /> : <p className="mt-2 text-sm font-black text-monkey-ink">{selectedTask.title}</p>}
              {editing && title.trim().length > 0 && title.trim().length < 3 ? <p className="mt-2 text-xs font-bold text-monkey-pink">Usá al menos 3 caracteres.</p> : null}
            </div>
          ) : null}
          {selectedTask ? (
            <div className="mt-4 rounded-[20px] border border-green-100 bg-green-50/70 p-3">
              <div className="flex items-center gap-3">
                <span className={`grid h-10 w-10 place-items-center rounded-full ${reminderEnabled ? "bg-monkey-green text-white" : "bg-white text-gray-400"}`}>
                  {reminderEnabled ? <Bell className="h-5 w-5" /> : <BellOff className="h-5 w-5" />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-black text-monkey-ink">Recordatorio</p>
                  <p className="text-xs font-semibold text-monkey-muted">{reminderLabel}</p>
                </div>
                <button
                  type="button"
                  onClick={() => applyReminder(!reminderEnabled)}
                  className={`h-8 rounded-pill px-3 text-xs font-black ${reminderEnabled ? "bg-monkey-green text-white" : "bg-white text-monkey-muted"}`}
                >
                  {reminderEnabled ? "Activo" : "Activar"}
                </button>
              </div>
              {reminderEnabled ? (
                <label className="mt-3 block text-xs font-black uppercase tracking-[.08em] text-monkey-muted">
                  Hora
                  <input
                    type="time"
                    value={reminderTime}
                    onChange={(event) => changeReminderTime(event.target.value)}
                    className="mt-2 h-11 w-full rounded-[14px] border border-green-100 bg-white px-3 text-sm font-bold text-monkey-ink outline-none focus:border-monkey-green focus:ring-4 focus:ring-green-100"
                  />
                </label>
              ) : null}
            </div>
          ) : null}
          <div className="mt-4 space-y-2">
            {activeBlock.tasks.map((item) => (
              <button key={item.id} onClick={() => onToggle?.(activeBlock.id, item.id)} className="flex h-10 w-full items-center gap-3 rounded-[14px] px-2 text-left text-sm transition active:scale-[.98]">
                <span className={item.done ? "grid h-5 w-5 place-items-center rounded-full bg-monkey-green text-white" : "h-5 w-5 rounded-full border-2 border-gray-300 bg-white"}>{item.done ? <Check className="h-3.5 w-3.5" /> : null}</span>
                <span className={item.done ? "flex-1 text-gray-400 line-through" : "flex-1"}>{item.title}</span>
                <span className={item.reminderAt ? "grid h-7 w-7 place-items-center rounded-full bg-green-100 text-monkey-green" : "grid h-7 w-7 place-items-center rounded-full bg-gray-100 text-gray-400"}>
                  {item.reminderAt ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
                </span>
              </button>
            ))}
          </div>
          <div className="mt-5 flex gap-3">
            {editing ? <button className="flex-1 rounded-pill bg-monkey-green px-5 py-4 text-sm font-bold text-white" onClick={saveTitle}>Guardar cambios</button> : <button className="flex-1 rounded-pill bg-monkey-green px-5 py-4 text-sm font-bold text-white" onClick={() => setEditing(true)}>Editar tarea</button>}
            <button className="grid w-14 place-items-center rounded-pill bg-pink-100 text-monkey-pink" onClick={() => selectedTask && setConfirmOpen(true)} aria-label="Eliminar tarea"><Trash2 /></button>
          </div>
        </section>
      </div>
      <ConfirmSheet open={confirmOpen} title="¿Eliminar tarea?" body="Esta acción quitará la tarea de tu día. Luego en Supabase podremos guardar historial si lo necesitás." onCancel={() => setConfirmOpen(false)} onConfirm={() => { if (selectedTask) onDelete?.(activeBlock.id, selectedTask.id); setConfirmOpen(false); }} />
    </>
  );
}
