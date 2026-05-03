"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CalendarDays, Plus } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { MonkeyAvatar } from "@/components/monkey-avatar";
import { ProgressCard } from "@/components/progress-card";
import { TimeBlockCard } from "@/components/time-block-card";
import { TaskDetailSheet } from "@/components/task-detail-sheet";
import { FormSheet } from "@/components/form-sheet";
import { Field } from "@/components/field";
import { Toast, ToastState } from "@/components/toast";
import { EmptyState } from "@/components/empty-state";
import { AssetPicker } from "@/components/asset-picker";
import { activityAssets } from "@/lib/asset-library";
import { useTasks } from "@/hooks/use-tasks";
import type { Task, TaskColor, TimeBlock } from "@/types";

const blockColors: TaskColor[] = ["green", "blue", "orange", "purple", "pink", "yellow"];
const colorLabels: Record<TaskColor, string> = { green: "Verde", blue: "Azul", orange: "Naranja", purple: "Morado", pink: "Rosa", yellow: "Amarillo" };

function formatTodayDate() {
  const value = new Intl.DateTimeFormat("es-CR", {
    weekday: "long",
    day: "numeric",
    month: "long"
  }).format(new Date());
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export default function TodayPage() {
  const { blocks, percent, toggleTask, createTask, editTask, updateTaskReminder, deleteTask } = useTasks();
  const [selectedBlock, setSelectedBlock] = useState<TimeBlock | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  const [blockTitle, setBlockTitle] = useState("Nuevo bloque");
  const [time, setTime] = useState("09:00");
  const [color, setColor] = useState<TaskColor>("green");
  const [icon, setIcon] = useState("activity-study");
  const [errors, setErrors] = useState<{ title?: string; time?: string }>({});
  const [toast, setToast] = useState<ToastState>(null);
  const todayLabel = useMemo(() => formatTodayDate(), []);

  function showToast(message: string, type: "success" | "error" = "success") {
    setToast({ message, type });
    window.setTimeout(() => setToast(null), 2200);
  }

  function resetForm() {
    setTaskTitle("");
    setBlockTitle("Nuevo bloque");
    setTime("09:00");
    setColor("green");
    setIcon("activity-study");
    setErrors({});
  }

  function submitTask() {
    const nextErrors: { title?: string; time?: string } = {};
    if (taskTitle.trim().length < 3) nextErrors.title = "Escribí al menos 3 caracteres.";
    if (!/^\d{2}:\d{2}$/.test(time)) nextErrors.time = "Usá formato HH:MM, por ejemplo 09:00.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    createTask({ title: taskTitle, time, blockTitle, color, icon });
    setFormOpen(false);
    resetForm();
    showToast("Tarea creada con éxito");
  }

  function handleEditTask(blockId: string, taskId: string, title: string) {
    if (title.trim().length < 3) return;
    editTask(blockId, taskId, title);
    showToast("Tarea actualizada");
  }

  function handleReminderChange(blockId: string, taskId: string, reminderAt: string | null) {
    updateTaskReminder(blockId, taskId, reminderAt);
    showToast(reminderAt ? "Recordatorio activado" : "Recordatorio apagado");
  }

  function handleDeleteTask(blockId: string, taskId: string) {
    deleteTask(blockId, taskId);
    setSelectedBlock(null);
    setSelectedTask(null);
    showToast("Tarea eliminada");
  }

  const freshSelectedBlock = selectedBlock ? blocks.find((block) => block.id === selectedBlock.id) ?? null : null;
  const freshSelectedTask = freshSelectedBlock && selectedTask ? freshSelectedBlock.tasks.find((task) => task.id === selectedTask.id) ?? null : null;

  return (
    <AppShell>
      <Toast toast={toast} onClose={() => setToast(null)} />
      <section className="page-pad pt-8">
        <header className="flex items-center justify-between">
          <div><p className="text-sm font-medium text-monkey-muted">¡Hola! 👋</p><h1 className="text-[22px] font-black tracking-tight">Hoy es un gran día</h1></div>
          <button className="grid h-12 w-12 place-items-center rounded-full bg-white shadow-card"><MonkeyAvatar size={34} variant="face" /></button>
        </header>
        <div className="mt-5"><ProgressCard percent={percent} /></div>
        <div className="mt-5 flex h-11 items-center justify-between">
          <h2 className="text-left text-lg font-black tracking-tight">{todayLabel}</h2>
          <Link href="/calendar" className="grid h-12 w-12 place-items-center rounded-full bg-white shadow-card transition active:scale-95" aria-label="Ir al calendario"><CalendarDays className="h-5 w-5 text-monkey-muted" /></Link>
        </div>
        <div className="mt-3 space-y-3">
          {blocks.length === 0 ? <EmptyState title="Tu día está limpio" body="Agregá tu primera tarea para empezar con buen ritmo." /> : null}
          {blocks.map((block) => <TimeBlockCard key={block.id} block={block} onToggle={toggleTask} onOpen={(openedBlock) => { setSelectedBlock(openedBlock); setSelectedTask(openedBlock.tasks[0] ?? null); }} onTaskOpen={(openedBlock, openedTask) => { setSelectedBlock(openedBlock); setSelectedTask(openedTask); }} />)}
        </div>
      </section>
      <button onClick={() => setFormOpen(true)} className="fixed bottom-[104px] right-[calc(50%-195px)] z-30 grid h-16 w-16 place-items-center rounded-full bg-monkey-green text-white shadow-float transition active:scale-95" aria-label="Agregar tarea"><Plus className="h-8 w-8" /></button>
      <FormSheet open={formOpen} title="Nueva tarea" subtitle="Creá una tarea rápida y asignala a un bloque de hora." onClose={() => { setFormOpen(false); resetForm(); }} onSubmit={submitTask} submitLabel="Crear tarea">
        <Field label="Tarea" value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} placeholder="Ej: Repasar matemáticas" error={errors.title} />
        <Field label="Hora" value={time} onChange={(e) => setTime(e.target.value)} placeholder="09:00" error={errors.time} />
        <Field label="Nombre del bloque" value={blockTitle} onChange={(e) => setBlockTitle(e.target.value)} placeholder="Estudiar" />
        <div><span className="mb-2 block text-xs font-black uppercase tracking-[.08em] text-monkey-muted">Color</span><div className="grid min-w-0 grid-cols-2 gap-2 sm:grid-cols-3">{blockColors.map((item) => <button key={item} type="button" onClick={() => setColor(item)} className={`h-10 min-w-0 rounded-pill px-2 text-xs font-black ${color === item ? "bg-monkey-green text-white" : "bg-gray-100 text-monkey-muted"}`}><span className="block truncate">{colorLabels[item]}</span></button>)}</div></div>
        <AssetPicker label="Ícono de actividad" assets={activityAssets} value={icon} onChange={setIcon} />
      </FormSheet>
      <TaskDetailSheet open={!!freshSelectedBlock} block={freshSelectedBlock} task={freshSelectedTask} onClose={() => setSelectedBlock(null)} onToggle={toggleTask} onEdit={handleEditTask} onReminderChange={handleReminderChange} onDelete={handleDeleteTask} />
    </AppShell>
  );
}
