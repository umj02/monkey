"use client";

import { useEffect, useState } from "react";
import { useLocalStorageState } from "@/lib/local-storage";
import { remindersSeed } from "@/lib/mock-data";
import { LEGACY_STORAGE_KEYS, STORAGE_KEYS } from "@/lib/storage-keys";
import { createReminder, type ReminderInput } from "@/lib/services/reminder-service";
import {
  deleteReminderRemote,
  deleteRemindersByCalendarEventRemote,
  fetchReminders,
  upsertReminder,
} from "@/lib/services/supabase-data-service";
import { useAuth } from "@/hooks/use-auth";
import type { Reminder } from "@/types";

export function useReminders() {
  const { session, mode } = useAuth();
  const [items, setItems, ready] = useLocalStorageState<Reminder[]>(STORAGE_KEYS.reminders, remindersSeed, [...LEGACY_STORAGE_KEYS.reminders]);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    if (!session || mode !== "supabase") return;
    let cancelled = false;
    setSyncing(true);
    fetchReminders().then((remote) => {
      if (!cancelled && remote) setItems(remote);
      if (!cancelled) setSyncing(false);
    });
    return () => {
      cancelled = true;
    };
  }, [session?.userId, mode, setItems]);

  function create(input: ReminderInput) {
    const item = createReminder(input);
    setItems((list) => [item, ...list]);
    if (session && mode === "supabase") void upsertReminder(item);
    return item;
  }

  function update(id: string, input: ReminderInput) {
    const nextItem = items.find((item) => item.id === id);
    const merged = nextItem
      ? {
          ...nextItem,
          title: input.title.trim(),
          time: input.time,
          repeat: input.repeat,
          taskId: input.taskId ?? nextItem.taskId ?? null,
          calendarEventId: input.calendarEventId ?? nextItem.calendarEventId ?? null,
        }
      : null;
    setItems((list) => list.map((item) => (item.id === id ? merged ?? item : item)));
    if (merged && session && mode === "supabase") void upsertReminder(merged);
  }

  function upsertCalendarReminder(calendarEventId: string, input: ReminderInput) {
    const existing = items.find((item) => item.calendarEventId === calendarEventId);
    const merged: Reminder = existing
      ? {
          ...existing,
          title: input.title.trim(),
          time: input.time,
          repeat: input.repeat,
          calendarEventId,
        }
      : createReminder({ ...input, calendarEventId });

    setItems((list) => {
      if (existing) return list.map((item) => (item.id === existing.id ? merged : item));
      return [merged, ...list];
    });
    if (session && mode === "supabase") void upsertReminder(merged);
    return merged;
  }

  function deleteCalendarEventReminders(calendarEventId: string) {
    setItems((list) => list.filter((item) => item.calendarEventId !== calendarEventId));
    if (session && mode === "supabase") void deleteRemindersByCalendarEventRemote(calendarEventId);
  }

  function toggle(id: string) {
    const nextItem = items.find((item) => item.id === id);
    const merged = nextItem ? { ...nextItem, enabled: !nextItem.enabled } : null;
    setItems((list) => list.map((item) => item.id === id ? { ...item, enabled: !item.enabled } : item));
    if (merged && session && mode === "supabase") void upsertReminder(merged);
  }

  function remove(id: string) {
    setItems((list) => list.filter((item) => item.id !== id));
    if (session && mode === "supabase") void deleteReminderRemote(id);
  }

  return {
    items,
    setItems,
    ready,
    syncing,
    createReminder: create,
    updateReminder: update,
    upsertCalendarReminder,
    deleteCalendarEventReminders,
    toggleReminder: toggle,
    deleteReminder: remove,
  };
}
