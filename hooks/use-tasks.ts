"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocalStorageState } from "@/lib/local-storage";
import { todaySeed } from "@/lib/mock-data";
import { LEGACY_STORAGE_KEYS, STORAGE_KEYS } from "@/lib/storage-keys";
import {
  addTaskToBlocks,
  calculateTaskProgress,
  deleteTaskFromBlocks,
  editTaskInBlocks,
  toggleTaskInBlocks,
  type CreateTaskInput,
} from "@/lib/services/task-service";
import {
  createTaskRemote,
  deleteTaskRemote,
  deleteTimeBlockRemote,
  fetchTimeBlocks,
  updateTaskRemote,
} from "@/lib/services/supabase-data-service";
import { useAuth } from "@/hooks/use-auth";
import type { Task, TimeBlock } from "@/types";

function replaceRemoteIds(
  blocks: TimeBlock[],
  tempBlockId: string,
  tempTaskId: string,
  remoteBlock: TimeBlock,
  remoteTask: Task,
) {
  return blocks.map((block) => {
    const isTargetBlock = block.id === tempBlockId;
    const nextBlockId = isTargetBlock ? remoteBlock.id : block.id;
    if (!isTargetBlock) return block;

    return {
      ...block,
      id: nextBlockId,
      date: remoteBlock.date,
      tasks: block.tasks.map((task) =>
        task.id === tempTaskId
          ? { ...task, id: remoteTask.id, reminderAt: remoteTask.reminderAt }
          : task,
      ),
    };
  });
}

function findNewTask(
  previous: TimeBlock[],
  next: TimeBlock[],
  input: CreateTaskInput,
) {
  const previousIds = new Set(
    previous.flatMap((block) => block.tasks.map((task) => task.id)),
  );
  const targetBlock = next.find(
    (block) =>
      block.time === input.time &&
      block.tasks.some((task) => !previousIds.has(task.id)),
  );
  const targetTask =
    targetBlock?.tasks.find((task) => !previousIds.has(task.id)) ?? null;
  return targetBlock && targetTask
    ? { block: targetBlock, task: targetTask }
    : null;
}

export function useTasks() {
  const { session, mode } = useAuth();
  const [blocks, setBlocks, ready] = useLocalStorageState<TimeBlock[]>(
    STORAGE_KEYS.taskBlocks,
    todaySeed,
    [...LEGACY_STORAGE_KEYS.taskBlocks],
  );
  const [syncing, setSyncing] = useState(false);
  const percent = useMemo(() => calculateTaskProgress(blocks), [blocks]);

  useEffect(() => {
    if (!session || mode !== "supabase") return;
    let cancelled = false;
    setSyncing(true);
    fetchTimeBlocks()
      .then((remote) => {
        if (!cancelled && remote) setBlocks(remote);
      })
      .finally(() => {
        if (!cancelled) setSyncing(false);
      });
    return () => {
      cancelled = true;
    };
  }, [session?.userId, mode, setBlocks]);

  function toggleTask(blockId: string, taskId: string) {
    const currentBlock = blocks.find((block) => block.id === blockId);
    const currentTask = currentBlock?.tasks.find((task) => task.id === taskId);
    const nextDone = !currentTask?.done;
    const next = toggleTaskInBlocks(blocks, blockId, taskId);
    setBlocks(next);
    if (session && mode === "supabase")
      void updateTaskRemote(taskId, { done: nextDone });
  }

  function createTask(input: CreateTaskInput) {
    const next = addTaskToBlocks(blocks, input);
    const created = findNewTask(blocks, next, input);
    setBlocks(next);

    if (!created || !session || mode !== "supabase") return;

    const blockIndex = next.findIndex((block) => block.id === created.block.id);
    const taskIndex = created.block.tasks.findIndex(
      (task) => task.id === created.task.id,
    );

    void createTaskRemote(
      created.block,
      created.task,
      Math.max(blockIndex, 0),
      Math.max(taskIndex, 0),
    ).then((remote) => {
      if (!remote) return;
      setBlocks((list) =>
        replaceRemoteIds(
          list,
          created.block.id,
          created.task.id,
          remote.block,
          remote.task,
        ),
      );
    });
  }

  function editTask(blockId: string, taskId: string, title: string) {
    const next = editTaskInBlocks(blocks, blockId, taskId, title);
    setBlocks(next);
    if (session && mode === "supabase")
      void updateTaskRemote(taskId, { title });
  }

  function updateTaskReminder(
    blockId: string,
    taskId: string,
    reminderAt: string | null,
  ) {
    const next = blocks.map((block) =>
      block.id === blockId
        ? {
            ...block,
            tasks: block.tasks.map((task) =>
              task.id === taskId ? { ...task, reminderAt } : task,
            ),
          }
        : block,
    );
    setBlocks(next);
    if (session && mode === "supabase")
      void updateTaskRemote(taskId, { reminderAt });
  }

  function deleteTask(blockId: string, taskId: string) {
    const blockBeforeDelete = blocks.find((block) => block.id === blockId);
    const next = deleteTaskFromBlocks(blocks, blockId, taskId);
    setBlocks(next);
    if (session && mode === "supabase") {
      void deleteTaskRemote(taskId);
      const blockStillExists = next.some((block) => block.id === blockId);
      if (blockBeforeDelete && !blockStillExists)
        void deleteTimeBlockRemote(blockId);
    }
  }

  return {
    blocks,
    setBlocks,
    ready,
    syncing,
    percent,
    toggleTask,
    createTask,
    editTask,
    updateTaskReminder,
    deleteTask,
  };
}
