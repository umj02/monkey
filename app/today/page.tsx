"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { ProgressCard } from "@/components/progress-card";
import { TimeBlockCard } from "@/components/time-block-card";
import type { TimeBlock } from "@/types";

const initialBlocks: TimeBlock[] = [
  {
    id: "morning",
    time: "06:00",
    title: "Despertar",
    emoji: "☀️",
    color: "purple",
    tasks: [
      { id: "t1", title: "Lavarme los dientes", done: true },
      { id: "t2", title: "Tomar agua", done: true }
    ]
  },
  {
    id: "exercise",
    time: "07:00",
    title: "Ejercicio",
    emoji: "💪",
    color: "yellow",
    tasks: [
      { id: "t3", title: "Hacer estiramientos", done: false },
      { id: "t4", title: "Correr 20 min", done: false }
    ]
  },
  {
    id: "study",
    time: "08:00",
    title: "Estudiar",
    emoji: "📚",
    color: "green",
    tasks: [
      { id: "t5", title: "Matemáticas", done: false },
      { id: "t6", title: "Lectura", done: false }
    ]
  }
];

export default function TodayPage() {
  const [blocks, setBlocks] = useState(initialBlocks);

  const percent = useMemo(() => {
    const tasks = blocks.flatMap((b) => b.tasks);
    const done = tasks.filter((t) => t.done).length;
    return Math.round((done / tasks.length) * 100);
  }, [blocks]);

  function toggleTask(blockId: string, taskId: string) {
    setBlocks((current) =>
      current.map((block) =>
        block.id === blockId
          ? { ...block, tasks: block.tasks.map((task) => task.id === taskId ? { ...task, done: !task.done } : task) }
          : block
      )
    );
  }

  return (
    <AppShell>
      <section className="px-5 pt-8">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">¡Hola! 👋</p>
            <h1 className="text-2xl font-bold">Hoy es un gran día</h1>
          </div>
          <div className="grid h-12 w-12 place-items-center rounded-full bg-white shadow-sm">🐵</div>
        </header>

        <div className="mt-6">
          <ProgressCard percent={percent} />
        </div>

        <div className="mt-6 flex items-center justify-between">
          <h2 className="text-lg font-bold">Martes, 14 de Mayo</h2>
          <button className="rounded-full bg-white px-4 py-2 text-sm font-semibold shadow-sm">Día</button>
        </div>

        <div className="mt-4 space-y-3">
          {blocks.map((block) => (
            <TimeBlockCard key={block.id} block={block} onToggle={toggleTask} />
          ))}
        </div>
      </section>

      <button className="fixed bottom-24 right-[calc(50%-195px)] grid h-16 w-16 place-items-center rounded-full bg-monkey-green text-white shadow-soft">
        <Plus className="h-8 w-8" />
      </button>
    </AppShell>
  );
}
