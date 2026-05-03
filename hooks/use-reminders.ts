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

export type ReminderSyncStatus = "idle" | "loading" | "saving" | "synced" | "error";

export function useReminders() {
  const { session, mode } = useAuth();
  const [items, setItems, ready] = useLocalStorageState<Reminder[]>(STORAGE_KEYS.reminders, remindersSeed, [...LEGACY_STORAGE_KEYS.reminders]);
  const [syncing, setSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<ReminderSyncStatus>("idle");
  const [lastError, setLastError] = useState<string | null>(null);

  useEffect(() => {
    if (!session || mode !== "supabase") return;
    let cancelled = false;
    setSyncing(true);
    setSyncStatus("loading");
    setLastError(null);
    fetchReminders()
      .then((remote) => {
        if (cancelled) return;
        if (remote) {
          setItems(remote);
          setSyncStatus("synced");
        } else {
          setSyncStatus("error");
          setLastError("No se pudieron cargar los recordatorios.");
        }
      })
      .catch(() => {
        if (!cancelled) {
          setSyncStatus("error");
          setLastError("No se pudieron cargar los recordatorios.");
        }
      })
      .finally(() => {
        if (!cancelled) setSyncing(false);
      });
    return () => {
      cancelled = true;
    };
  }, [session?.userId, mode, setItems]);

  async function persist(item: Reminder) {
    if (!session || mode !== "supabase") return { ok: true, reminder: item, localOnly: true };
    setSyncStatus("saving");
    setLastError(null);
    const remote = await upsertReminder(item);
    if (!remote) {
      setSyncStatus("error");
      setLastError("No se pudo sincronizar el recordatorio.");
      return { ok: false, reminder: item, localOnly: false };
    }
    setItems((list) => list.map((current) => (current.id === item.id || current.calendarEventId === remote.calendarEventId ? remote : current)));
    setSyncStatus("synced");
    return { ok: true, reminder: remote, localOnly: false };
  }

  async function create(input: ReminderInput) {
    const item = createReminder(input);
    setItems((list) => [item, ...list]);
    await persist(item);
    return item;
  }

  async function update(id: string, input: ReminderInput) {
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
    if (!merged) return null;
    setItems((list) => list.map((item) => (item.id === id ? merged : item)));
    await persist(merged);
    return merged;
  }

  async function upsertCalendarReminder(calendarEventId: string, input: ReminderInput): Promise<{ ok: boolean; reminder: Reminder | null }> {
    const existing = items.find((item) => item.calendarEventId === calendarEventId);
    const merged: Reminder = existing
      ? {
          ...existing,
          title: input.title.trim(),
          time: input.time,
          repeat: input.repeat,
          enabled: true,
          calendarEventId,
        }
      : createReminder({ ...input, calendarEventId });

    setItems((list) => {
      if (existing) return list.map((item) => (item.id === existing.id ? merged : item));
      return [merged, ...list];
    });

    const result = await persist(merged);
    return { ok: result.ok, reminder: result.reminder };
  }

  async function deleteCalendarEventReminders(calendarEventId: string): Promise<boolean> {
    const previous = items;
    setItems((list) => list.filter((item) => item.calendarEventId !== calendarEventId));
    if (!session || mode !== "supabase") return true;
    setSyncStatus("saving");
    setLastError(null);
    const ok = await deleteRemindersByCalendarEventRemote(calendarEventId);
    if (!ok) {
      setItems(previous);
      setSyncStatus("error");
      setLastError("No se pudo eliminar la alerta relacionada.");
      return false;
    }
    setSyncStatus("synced");
    return true;
  }

  async function toggle(id: string) {
    const nextItem = items.find((item) => item.id === id);
    const merged = nextItem ? { ...nextItem, enabled: !nextItem.enabled } : null;
    if (!merged) return;
    setItems((list) => list.map((item) => (item.id === id ? merged : item)));
    await persist(merged);
  }

  async function remove(id: string) {
    const previous = items;
    setItems((list) => list.filter((item) => item.id !== id));
    if (!session || mode !== "supabase") return;
    setSyncStatus("saving");
    setLastError(null);
    const ok = await deleteReminderRemote(id);
    if (!ok) {
      setItems(previous);
      setSyncStatus("error");
      setLastError("No se pudo eliminar el recordatorio.");
      return;
    }
    setSyncStatus("synced");
  }

  return {
    items,
    setItems,
    ready,
    syncing,
    syncStatus,
    lastError,
    createReminder: create,
    updateReminder: update,
    upsertCalendarReminder,
    deleteCalendarEventReminders,
    toggleReminder: toggle,
    deleteReminder: remove,
  };
}
