"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useReminders } from "@/hooks/use-reminders";
import { useTasks } from "@/hooks/use-tasks";
import {
  groupReminderItems,
  mapStandaloneRemindersToItems,
  mapTaskBlocksToReminderItems,
  sortReminderItems,
} from "@/lib/services/reminder-service";
import {
  fetchTaskReminderItems,
  updateTaskRemote,
} from "@/lib/services/supabase-data-service";
import type { ReminderPanelItem } from "@/types";

export function useReminderSystem() {
  const { session, mode } = useAuth();
  const reminders = useReminders();
  const tasks = useTasks();
  const [remoteTaskItems, setRemoteTaskItems] = useState<ReminderPanelItem[] | null>(null);
  const [syncingTaskReminders, setSyncingTaskReminders] = useState(false);

  function refreshTaskReminders() {
    if (!session || mode !== "supabase") return;
    setSyncingTaskReminders(true);
    void fetchTaskReminderItems()
      .then((items) => {
        if (items) setRemoteTaskItems(items);
      })
      .finally(() => setSyncingTaskReminders(false));
  }

  useEffect(() => {
    refreshTaskReminders();
  }, [session?.userId, mode]);

  const taskItems = useMemo(() => {
    if (mode === "supabase" && remoteTaskItems) return remoteTaskItems;
    return mapTaskBlocksToReminderItems(tasks.blocks);
  }, [mode, remoteTaskItems, tasks.blocks]);

  const standaloneItems = useMemo(
    () => mapStandaloneRemindersToItems(reminders.items),
    [reminders.items],
  );

  const items = useMemo(
    () => sortReminderItems([...taskItems, ...standaloneItems]),
    [taskItems, standaloneItems],
  );

  const groups = useMemo(() => groupReminderItems(items), [items]);

  function disableTaskReminder(item: ReminderPanelItem) {
    if (!item.taskId) return;

    if (item.blockId) {
      tasks.updateTaskReminder(item.blockId, item.taskId, null);
    }

    if (session && mode === "supabase") {
      void updateTaskRemote(item.taskId, { reminderAt: null }).then(() => {
        setRemoteTaskItems((list) =>
          list ? list.filter((reminder) => reminder.taskId !== item.taskId) : list,
        );
        refreshTaskReminders();
      });
    }
  }

  return {
    items,
    groups,
    taskItems,
    standaloneItems,
    syncing: reminders.syncing || tasks.syncing || syncingTaskReminders,
    reminders,
    tasks,
    disableTaskReminder,
    refreshTaskReminders,
  };
}
