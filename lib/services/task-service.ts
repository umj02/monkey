import { createId } from "@/lib/local-storage";
import type { Task, TaskColor, TimeBlock } from "@/types";

export type CreateTaskInput = { title: string; time: string; blockTitle: string; color: TaskColor; icon?: string };

export function calculateTaskProgress(blocks: TimeBlock[]) {
  const tasks = blocks.flatMap((block) => block.tasks);
  if (!tasks.length) return 0;
  return Math.round((tasks.filter((task) => task.done).length / tasks.length) * 100);
}

export function toggleTaskInBlocks(blocks: TimeBlock[], blockId: string, taskId: string) {
  return blocks.map((block) =>
    block.id === blockId
      ? { ...block, tasks: block.tasks.map((task) => (task.id === taskId ? { ...task, done: !task.done } : task)) }
      : block
  );
}

export function addTaskToBlocks(blocks: TimeBlock[], input: CreateTaskInput) {
  const task: Task = { id: createId("task"), title: input.title.trim(), done: false };
  const existing = blocks.find((block) => block.time === input.time);
  if (existing) {
    return blocks.map((block) => (block.id === existing.id ? { ...block, tasks: [...block.tasks, task] } : block));
  }
  const block: TimeBlock = {
    id: createId("block"),
    time: input.time,
    title: input.blockTitle.trim() || "Nuevo bloque",
    color: input.color,
    icon: input.icon || "activity-study",
    tasks: [task]
  };
  return [...blocks, block].sort((a, b) => a.time.localeCompare(b.time));
}

export function editTaskInBlocks(blocks: TimeBlock[], blockId: string, taskId: string, title: string) {
  return blocks.map((block) =>
    block.id === blockId
      ? { ...block, tasks: block.tasks.map((task) => (task.id === taskId ? { ...task, title: title.trim() } : task)) }
      : block
  );
}

export function deleteTaskFromBlocks(blocks: TimeBlock[], blockId: string, taskId: string) {
  return blocks
    .map((block) => (block.id === blockId ? { ...block, tasks: block.tasks.filter((task) => task.id !== taskId) } : block))
    .filter((block) => block.tasks.length > 0);
}
