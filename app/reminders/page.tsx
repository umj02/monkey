"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { AlertTriangle, Bell, BellOff, CalendarClock, CheckCircle2, Clock, Plus, Trash2 } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { AssetThumb } from "@/components/asset-thumb";
import { ConfirmSheet } from "@/components/confirm-sheet";
import { EmptyState } from "@/components/empty-state";
import { Field } from "@/components/field";
import { FormSheet } from "@/components/form-sheet";
import { Toast, ToastState } from "@/components/toast";
import { useReminderSystem } from "@/hooks/use-reminder-system";
import { isValidReminderTime, statusLabel } from "@/lib/services/reminder-service";
import { cn } from "@/lib/utils";
import type { Reminder, ReminderPanelItem, ReminderStatus } from "@/types";

const repeatLabels: Record<Reminder["repeat"], string> = {
  daily: "Cada día",
  weekly: "Semanal",
  custom: "Personalizado",
};
const repeats: Reminder["repeat"][] = ["daily", "weekly", "custom"];

const statusStyles: Record<ReminderStatus, string> = {
  today: "border-green-100 bg-green-50 text-monkey-greenDark",
  upcoming: "border-sky-100 bg-sky-50 text-sky-700",
  overdue: "border-orange-100 bg-orange-50 text-orange-700",
  inactive: "border-gray-100 bg-gray-50 text-gray-500",
};

const statusIcons: Record<ReminderStatus, ReactNode> = {
  today: <CheckCircle2 className="h-4 w-4" />,
  upcoming: <CalendarClock className="h-4 w-4" />,
  overdue: <AlertTriangle className="h-4 w-4" />,
  inactive: <BellOff className="h-4 w-4" />,
};

export default function RemindersPage() {
  const {
    groups,
    items,
    syncing,
    reminders: { items: standaloneReminders, createReminder, updateReminder, toggleReminder, deleteReminder },
    disableTaskReminder,
  } = useReminderSystem();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<Reminder | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [taskToDisable, setTaskToDisable] = useState<ReminderPanelItem | null>(null);
  const [title, setTitle] = useState("");
  const [time, setTime] = useState("08:00");
  const [repeat, setRepeat] = useState<Reminder["repeat"]>("daily");
  const [errors, setErrors] = useState<{ title?: string; time?: string }>({});
  const [toast, setToast] = useState<ToastState>(null);

  function notify(message: string, type: "success" | "error" = "success") {
    setToast({ message, type });
    window.setTimeout(() => setToast(null), 2200);
  }

  function openNew() {
    setEditing(null);
    setTitle("");
    setTime("08:00");
    setRepeat("daily");
    setErrors({});
    setSheetOpen(true);
  }

  function openStandaloneEdit(item: ReminderPanelItem) {
    if (!item.reminderId) return;
    const reminder = standaloneReminders.find((entry) => entry.id === item.reminderId);
    if (!reminder) return;
    setEditing(reminder);
    setTitle(reminder.title);
    setTime(reminder.time);
    setRepeat(reminder.repeat);
    setErrors({});
    setSheetOpen(true);
  }

  function submit() {
    const nextErrors: { title?: string; time?: string } = {};
    if (title.trim().length < 3) nextErrors.title = "Agregá un título válido.";
    if (!isValidReminderTime(time)) nextErrors.time = "Usá formato HH:MM válido.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    if (editing) updateReminder(editing.id, { title, time, repeat });
    else createReminder({ title, time, repeat });
    setSheetOpen(false);
    notify(editing ? "Recordatorio actualizado" : "Recordatorio creado");
  }

  function renderReminderCard(item: ReminderPanelItem) {
    const isTask = item.source === "task";
    return (
      <article key={item.id} className="rounded-card bg-white p-4 shadow-card">
        <div className="flex items-start gap-3">
          <span className={cn("grid h-12 w-12 shrink-0 place-items-center rounded-[16px]", isTask ? "bg-green-50" : "bg-sky-50")}>
            {isTask ? <AssetThumb icon={item.icon || "activity-study"} size={34} className="rounded-[12px]" /> : <Bell className="h-5 w-5 text-sky-600" />}
          </span>
          <button type="button" onClick={() => (isTask ? null : openStandaloneEdit(item))} className="min-w-0 flex-1 text-left">
            <div className="flex min-w-0 items-center gap-2">
              <h3 className="truncate text-sm font-black text-monkey-ink">{item.title}</h3>
              <span className={cn("inline-flex shrink-0 items-center gap-1 rounded-pill border px-2 py-1 text-[10px] font-black", statusStyles[item.status])}>
                {statusIcons[item.status]}
                {statusLabel(item.status)}
              </span>
            </div>
            <p className="mt-1 flex items-center gap-1 text-xs font-bold text-monkey-muted"><Clock className="h-3.5 w-3.5" />{item.dateLabel} · {item.time}</p>
            <p className="mt-1 text-xs font-semibold text-monkey-muted">
              {isTask ? `Tarea de ${item.blockTitle || "Hoy"}${item.blockTime ? ` · ${item.blockTime}` : ""}` : repeatLabels[item.repeat || "daily"]}
            </p>
          </button>
        </div>
        <div className="mt-3 flex gap-2">
          {isTask ? (
            <>
              <Link href="/today" className="flex-1 rounded-pill bg-gray-100 px-4 py-3 text-center text-xs font-black text-monkey-muted">Ver tarea</Link>
              <button type="button" onClick={() => setTaskToDisable(item)} className="rounded-pill bg-pink-50 px-4 py-3 text-xs font-black text-monkey-pink">Apagar</button>
            </>
          ) : (
            <>
              <button type="button" onClick={() => item.reminderId && toggleReminder(item.reminderId)} className={cn("flex-1 rounded-pill px-4 py-3 text-xs font-black", item.enabled ? "bg-monkey-green text-white" : "bg-gray-100 text-monkey-muted")}>
                {item.enabled ? "Activo" : "Inactivo"}
              </button>
              <button type="button" onClick={() => item.reminderId && setDeleteId(item.reminderId)} className="grid w-12 place-items-center rounded-pill bg-pink-50 text-monkey-pink" aria-label="Eliminar recordatorio"><Trash2 className="h-4 w-4" /></button>
            </>
          )}
        </div>
      </article>
    );
  }

  function renderGroup(status: ReminderStatus, groupItems: ReminderPanelItem[]) {
    if (!groupItems.length) return null;
    return (
      <section className="mt-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-black uppercase tracking-[.08em] text-monkey-muted">{statusLabel(status)}</h2>
          <span className="rounded-pill bg-white px-3 py-1 text-xs font-black text-monkey-muted shadow-sm">{groupItems.length}</span>
        </div>
        <div className="space-y-3">{groupItems.map(renderReminderCard)}</div>
      </section>
    );
  }

  return (
    <AppShell>
      <Toast toast={toast} onClose={() => setToast(null)} />
      <section className="page-pad pt-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-monkey-muted">Sistema de alertas</p>
            <h1 className="text-2xl font-black tracking-tight">Recordatorios</h1>
            <p className="mt-1 text-sm font-semibold text-monkey-muted">Tareas con campanita y recordatorios independientes en un solo lugar.</p>
          </div>
          <button onClick={openNew} className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-monkey-green text-white shadow-float" aria-label="Nuevo recordatorio"><Plus /></button>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-2">
          <div className="rounded-[18px] bg-white p-3 text-center shadow-card"><p className="text-lg font-black text-monkey-green">{groups.today.length}</p><p className="text-[11px] font-bold text-monkey-muted">Hoy</p></div>
          <div className="rounded-[18px] bg-white p-3 text-center shadow-card"><p className="text-lg font-black text-sky-600">{groups.upcoming.length}</p><p className="text-[11px] font-bold text-monkey-muted">Próximos</p></div>
          <div className="rounded-[18px] bg-white p-3 text-center shadow-card"><p className="text-lg font-black text-orange-600">{groups.overdue.length}</p><p className="text-[11px] font-bold text-monkey-muted">Pasados</p></div>
        </div>

        {syncing ? <p className="mt-4 rounded-pill bg-white px-4 py-3 text-center text-xs font-black text-monkey-muted shadow-sm">Sincronizando recordatorios…</p> : null}
        {items.length === 0 ? <div className="mt-6"><EmptyState title="Sin recordatorios" body="Activá una campanita en una tarea o creá una alerta independiente." /></div> : null}
        {renderGroup("today", groups.today)}
        {renderGroup("upcoming", groups.upcoming)}
        {renderGroup("overdue", groups.overdue)}
        {renderGroup("inactive", groups.inactive)}
      </section>

      <FormSheet open={sheetOpen} title={editing ? "Editar recordatorio" : "Nuevo recordatorio"} subtitle="Creá una alerta visual independiente de tus tareas." onClose={() => setSheetOpen(false)} onSubmit={submit} submitLabel={editing ? "Guardar" : "Crear recordatorio"}>
        <Field label="Título" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ej: Beber agua" error={errors.title} />
        <Field label="Hora" value={time} onChange={(e) => setTime(e.target.value)} placeholder="08:00" error={errors.time} />
        <div><span className="mb-2 block text-xs font-black uppercase tracking-[.08em] text-monkey-muted">Repetición</span><div className="grid grid-cols-3 gap-2">{repeats.map((item) => <button type="button" key={item} onClick={() => setRepeat(item)} className={cn("h-10 min-w-0 rounded-pill px-2 text-xs font-black", repeat === item ? "bg-monkey-green text-white" : "bg-gray-100 text-monkey-muted")}><span className="block truncate">{repeatLabels[item]}</span></button>)}</div></div>
      </FormSheet>
      <ConfirmSheet open={!!deleteId} title="¿Eliminar recordatorio?" body="Se quitará de tu lista de recordatorios independientes." onCancel={() => setDeleteId(null)} onConfirm={() => { if (deleteId) deleteReminder(deleteId); setDeleteId(null); notify("Recordatorio eliminado"); }} />
      <ConfirmSheet open={!!taskToDisable} title="¿Apagar campanita?" body="La tarea se mantiene, pero se elimina su hora de recordatorio." onCancel={() => setTaskToDisable(null)} onConfirm={() => { if (taskToDisable) disableTaskReminder(taskToDisable); setTaskToDisable(null); notify("Recordatorio de tarea apagado"); }} />
    </AppShell>
  );
}
