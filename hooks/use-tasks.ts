"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocalStorageState } from "@/lib/local-storage";
import { todaySeed } from "@/lib/mock-data";
import { LEGACY_STORAGE_KEYS, STORAGE_KEYS } from "@/lib/storage-keys";
import { addTaskToBlocks, calculateTaskProgress, deleteTaskFromBlocks, editTaskInBlocks, toggleTaskInBlocks, type CreateTaskInput } from "@/lib/services/task-service";
import { fetchTimeBlocks, upsertTimeBlocks } from "@/lib/services/supabase-data-service";
import { useAuth } from "@/hooks/use-auth";
import type { TimeBlock } from "@/types";

export function useTasks() {
  const { session, mode } = useAuth();
  const [blocks, setBlocks, ready] = useLocalStorageState<TimeBlock[]>(STORAGE_KEYS.taskBlocks, todaySeed, [...LEGACY_STORAGE_KEYS.taskBlocks]);
  const [syncing, setSyncing] = useState(false);
  const percent = useMemo(() => calculateTaskProgress(blocks), [blocks]);

  useEffect(() => {
    if (!session || mode !== "supabase") return;
    setSyncing(true);
    fetchTimeBlocks().then((remote) => {
      if (remote && remote.length) setBlocks(remote);
      setSyncing(false);
    });
  }, [session?.userId, mode]);

  function persist(next: TimeBlock[]) {
    if (session && mode === "supabase") void upsertTimeBlocks(next);
  }

  function toggleTask(blockId: string, taskId: string) {
    setBlocks((list) => {
      const next = toggleTaskInBlocks(list, blockId, taskId);
      persist(next);
      return next;
    });
  }

  function createTask(input: CreateTaskInput) {
    setBlocks((list) => {
      const next = addTaskToBlocks(list, input);
      persist(next);
      return next;
    });
  }

  function editTask(blockId: string, taskId: string, title: string) {
    setBlocks((list) => {
      const next = editTaskInBlocks(list, blockId, taskId, title);
      persist(next);
      return next;
    });
  }

  function deleteTask(blockId: string, taskId: string) {
    setBlocks((list) => {
      const next = deleteTaskFromBlocks(list, blockId, taskId);
      persist(next);
      return next;
    });
  }

  return { blocks, setBlocks, ready, syncing, percent, toggleTask, createTask, editTask, deleteTask };
}
