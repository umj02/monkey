"use client";

import { useMemo, useState } from "react";
import { CalendarDays, Plus } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { MonkeyAvatar } from "@/components/monkey-avatar";
import { ProgressCard } from "@/components/progress-card";
import { TimeBlockCard } from "@/components/time-block-card";
import { TaskDetailSheet } from "@/components/task-detail-sheet";
import { createId, useLocalStorageState } from "@/lib/local-storage";
import { todaySeed } from "@/lib/mock-data";
import type { Task, TimeBlock } from "@/types";

export default function TodayPage() {
  const [blocks, setBlocks] = useLocalStorageState<TimeBlock[]>("monkey.today.blocks.v22", todaySeed);
  const [selectedBlock, setSelectedBlock] = useState<TimeBlock | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const percent = useMemo(() => {
    const tasks = blocks.flatMap((b) => b.tasks);
    if (!tasks.length) return 0;
    return Math.round((tasks.filter((t) => t.done).length / tasks.length) * 100);
  }, [blocks]);

  function toggleTask(blockId: string, taskId: string) {
    setBlocks((list) =>
      list.map((block) =>
        block.id === blockId
          ? { ...block, tasks: block.tasks.map((task) => (task.id === taskId ? { ...task, done: !task.done } : task)) }
          : block
      )
    );
  }

  function addTask() {
    const title = window.prompt("Nueva tarea")?.trim();
    if (!title) return;
    const time = window.prompt("Hora del bloque", "09:00")?.trim() || "09:00";
    setBlocks((list) => {
      const existing = list.find((block) => block.time === time);
      if (existing) {
        return list.map((block) => block.id === existing.id ? { ...block, tasks: [...block.tasks, { id: createId("task"), title, done: false }] } : block);
      }
      return [...list, { id: createId("block"), time, title: "Nuevo bloque", color: "blue", icon: "✨", tasks: [{ id: createId("task"), title, done: false }] }]
        .sort((a, b) => a.time.localeCompare(b.time));
    });
  }

  function editTask(blockId: string, taskId: string, title: string) {
    setBlocks((list) => list.map((block) => block.id === blockId ? { ...block, tasks: block.tasks.map((task) => task.id === taskId ? { ...task, title } : task) } : block));
  }

  function deleteTask(blockId: string, taskId: string) {
    setBlocks((list) => list.map((block) => block.id === blockId ? { ...block, tasks: block.tasks.filter((task) => task.id !== taskId) } : block).filter((block) => block.tasks.length > 0));
    setSelectedBlock(null);
    setSelectedTask(null);
  }

  const freshSelectedBlock = selectedBlock ? blocks.find((block) => block.id === selectedBlock.id) ?? null : null;
  const freshSelectedTask = freshSelectedBlock && selectedTask ? freshSelectedBlock.tasks.find((task) => task.id === selectedTask.id) ?? null : null;

  return (
    <AppShell>
      <section className="page-pad pt-8">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-monkey-muted">¡Hola! 👋</p>
            <h1 className="text-[22px] font-black tracking-tight">Hoy es un gran día</h1>
          </div>
          <button className="grid h-12 w-12 place-items-center rounded-full bg-white shadow-card"><MonkeyAvatar size={34} variant="face" /></button>
        </header>

        <div className="mt-5"><ProgressCard percent={percent} /></div>

        <div className="mt-5 flex h-11 items-center justify-between">
          <button className="text-left text-lg font-black tracking-tight">Martes, 14 de Mayo</button>
          <button className="grid h-10 w-10 place-items-center rounded-full bg-white shadow-sm">
            <CalendarDays className="h-5 w-5 text-monkey-muted" />
          </button>
        </div>

        <div className="mt-3 space-y-3">
          {blocks.length === 0 ? <div className="soft-card p-5 text-center text-sm font-semibold text-monkey-muted">No hay tareas todavía. Tocá + para crear la primera.</div> : null}
          {blocks.map((block) => (
            <TimeBlockCard
              key={block.id}
              block={block}
              onToggle={toggleTask}
              onOpen={(openedBlock) => { setSelectedBlock(openedBlock); setSelectedTask(openedBlock.tasks[0] ?? null); }}
              onTaskOpen={(openedBlock, openedTask) => { setSelectedBlock(openedBlock); setSelectedTask(openedTask); }}
            />
          ))}
        </div>
      </section>

      <button onClick={addTask} className="fixed bottom-[104px] right-[calc(50%-195px)] z-30 grid h-16 w-16 place-items-center rounded-full bg-monkey-green text-white shadow-float transition active:scale-95" aria-label="Agregar tarea">
        <Plus className="h-8 w-8" />
      </button>
      <TaskDetailSheet open={!!freshSelectedBlock} block={freshSelectedBlock} task={freshSelectedTask} onClose={() => setSelectedBlock(null)} onToggle={toggleTask} onEdit={editTask} onDelete={deleteTask} />
    </AppShell>
  );
}
