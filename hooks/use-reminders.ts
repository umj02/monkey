"use client";

import { useEffect, useState } from "react";
import { useLocalStorageState } from "@/lib/local-storage";
import { remindersSeed } from "@/lib/mock-data";
import { LEGACY_STORAGE_KEYS, STORAGE_KEYS } from "@/lib/storage-keys";
import { createReminder, type ReminderInput } from "@/lib/services/reminder-service";
import { deleteReminderRemote, fetchReminders, upsertReminder } from "@/lib/services/supabase-data-service";
import { useAuth } from "@/hooks/use-auth";
import type { Reminder } from "@/types";

export function useReminders() {
  const { session, mode } = useAuth();
  const [items, setItems, ready] = useLocalStorageState<Reminder[]>(STORAGE_KEYS.reminders, remindersSeed, [...LEGACY_STORAGE_KEYS.reminders]);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    if (!session || mode !== "supabase") return;
    setSyncing(true);
    fetchReminders().then((remote) => {
      if (remote && remote.length) setItems(remote);
      setSyncing(false);
    });
  }, [session?.userId, mode]);

  function create(input: ReminderInput) {
    const item = createReminder(input);
    setItems((list) => [item, ...list]);
    if (session && mode === "supabase") void upsertReminder(item);
  }

  function update(id: string, input: ReminderInput) {
    const nextItem = items.find((item) => item.id === id);
    const merged = nextItem ? { ...nextItem, title: input.title.trim(), time: input.time, repeat: input.repeat } : null;
    setItems((list) => list.map((item) => item.id === id ? { ...item, title: input.title.trim(), time: input.time, repeat: input.repeat } : item));
    if (merged && session && mode === "supabase") void upsertReminder(merged);
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

  return { items, setItems, ready, syncing, createReminder: create, updateReminder: update, toggleReminder: toggle, deleteReminder: remove };
}
