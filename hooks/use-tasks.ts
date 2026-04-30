import { useMemo } from "react";
import { useLocalStorageState } from "@/lib/local-storage";
import { todaySeed } from "@/lib/mock-data";
import { STORAGE_KEYS } from "@/lib/storage-keys";
import { addTaskToBlocks, calculateTaskProgress, deleteTaskFromBlocks, editTaskInBlocks, toggleTaskInBlocks, type CreateTaskInput } from "@/lib/services/task-service";
import type { TimeBlock } from "@/types";

export function useTasks() {
  const [blocks, setBlocks, ready] = useLocalStorageState<TimeBlock[]>(STORAGE_KEYS.taskBlocks, todaySeed);
  const percent = useMemo(() => calculateTaskProgress(blocks), [blocks]);

  return {
    blocks,
    setBlocks,
    ready,
    percent,
    toggleTask: (blockId: string, taskId: string) => setBlocks((list) => toggleTaskInBlocks(list, blockId, taskId)),
    createTask: (input: CreateTaskInput) => setBlocks((list) => addTaskToBlocks(list, input)),
    editTask: (blockId: string, taskId: string, title: string) => setBlocks((list) => editTaskInBlocks(list, blockId, taskId, title)),
    deleteTask: (blockId: string, taskId: string) => setBlocks((list) => deleteTaskFromBlocks(list, blockId, taskId))
  };
}
