"use client";

import { useMemo, useState } from "react";
import { CalendarDays, Plus } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { ProgressCard } from "@/components/progress-card";
import { TimeBlockCard } from "@/components/time-block-card";
import { TaskDetailSheet } from "@/components/task-detail-sheet";
import type { TimeBlock } from "@/types";

const seed: TimeBlock[] = [
  {
    id: "wake",
    time: "06:00",
    title: "Despertar",
    color: "purple",
    icon: "☀️",
    tasks: [
      { id: "a", title: "Lavarme los dientes", done: true },
      { id: "b", title: "Tomar agua", done: true }
    ]
  },
  {
    id: "sport",
    time: "07:00",
    title: "Ejercicio",
    color: "orange",
    icon: "🏃‍♂️",
    tasks: [
      { id: "c", title: "Hacer estiramientos", done: false },
      { id: "d", title: "Correr 20 min", done: false }
    ]
  },
  {
    id: "study",
    time: "08:00",
    title: "Estudiar",
    color: "green",
    icon: "📚",
    tasks: [
      { id: "e", title: "Matemáticas", done: false },
      { id: "f", title: "Lectura", done: false }
    ]
  }
];

export default function TodayPage() {
  const [blocks, setBlocks] = useState(seed);
  const [sheetOpen, setSheetOpen] = useState(false);

  const percent = useMemo(() => {
    const tasks = blocks.flatMap((b) => b.tasks);
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

  return (
    <AppShell>
      <section className="page-pad pt-8">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-monkey-muted">¡Hola! 👋</p>
            <h1 className="text-[22px] font-black tracking-tight">Hoy es un gran día</h1>
          </div>
          <button className="grid h-12 w-12 place-items-center rounded-full bg-white text-2xl shadow-card">🐵</button>
        </header>

        <div className="mt-5"><ProgressCard percent={percent} /></div>

        <div className="mt-5 flex h-11 items-center justify-between">
          <button className="text-left text-lg font-black tracking-tight">Martes, 14 de Mayo</button>
          <button className="grid h-10 w-10 place-items-center rounded-full bg-white shadow-sm">
            <CalendarDays className="h-5 w-5 text-monkey-muted" />
          </button>
        </div>

        <div className="mt-3 space-y-3">
          {blocks.map((block) => (
            <TimeBlockCard key={block.id} block={block} onToggle={toggleTask} onOpen={() => setSheetOpen(true)} />
          ))}
        </div>
      </section>

      <button className="fixed bottom-[104px] right-[calc(50%-195px)] z-30 grid h-16 w-16 place-items-center rounded-full bg-monkey-green text-white shadow-float transition active:scale-95">
        <Plus className="h-8 w-8" />
      </button>
      <TaskDetailSheet open={sheetOpen} onClose={() => setSheetOpen(false)} />
    </AppShell>
  );
}
