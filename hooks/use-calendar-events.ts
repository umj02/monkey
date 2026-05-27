"use client";

import { useEffect, useState } from "react";
import { useLocalStorageState } from "@/lib/local-storage";
import { calendarSeed } from "@/lib/mock-data";
import { LEGACY_STORAGE_KEYS, STORAGE_KEYS } from "@/lib/storage-keys";
import {
  createCalendarEvent,
  sortCalendarEvents,
  type CalendarEventInput,
} from "@/lib/services/calendar-service";
import {
  deleteCalendarEventRemote,
  fetchCalendarEvents,
  upsertCalendarEvent,
} from "@/lib/services/supabase-data-service";
import { useAuth } from "@/hooks/use-auth";
import type { CalendarEvent } from "@/types";

export type SyncStatus = "idle" | "loading" | "saving" | "synced" | "local" | "error";
export type SaveMode = "remote" | "local" | "pending";

export function useCalendarEvents() {
  const { session, mode } = useAuth();
  const [events, setEvents, ready] = useLocalStorageState<CalendarEvent[]>(
    STORAGE_KEYS.calendarEvents,
    calendarSeed,
    [...LEGACY_STORAGE_KEYS.calendarEvents],
  );
  const [syncing, setSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("idle");
  const [lastError, setLastError] = useState<string | null>(null);
  const [lastSaveMode, setLastSaveMode] = useState<SaveMode>("pending");
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);

  async function refreshEvents() {
    if (!session || mode !== "supabase") return false;
    setSyncing(true);
    setSyncStatus("loading");
    setLastError(null);
    try {
      const remote = await fetchCalendarEvents();
      if (remote) {
        setEvents(remote);
        setSyncStatus("synced");
        setLastSaveMode("remote");
        return true;
      }
      setSyncStatus("error");
      setLastError("No se pudo cargar el calendario.");
      return false;
    } catch {
      setSyncStatus("error");
      setLastError("No se pudo cargar el calendario.");
      return false;
    } finally {
      setSyncing(false);
    }
  }

  useEffect(() => {
    let cancelled = false;
    if (!session || mode !== "supabase") return;
    void refreshEvents().then(() => {
      if (cancelled) return;
    });
    return () => {
      cancelled = true;
    };
  }, [session?.userId, mode]);

  async function createEvent(input: CalendarEventInput): Promise<CalendarEvent> {
    const event = createCalendarEvent(input);
    const shouldSaveRemote = Boolean(session && mode === "supabase");
    setSyncStatus(shouldSaveRemote ? "saving" : "local");
    setLastSaveMode(shouldSaveRemote ? "pending" : "local");
    setLastError(null);
    setEvents((list) => sortCalendarEvents([...list, event]));

    if (shouldSaveRemote) {
      const remote = await upsertCalendarEvent(event);
      if (remote) {
        setEvents((list) =>
          sortCalendarEvents(
            list.map((item) => (item.id === event.id ? remote : item)),
          ),
        );
        setSyncStatus("synced");
        setLastSaveMode("remote");
        setLastSavedAt(new Date().toISOString());
        return remote;
      }
      setSyncStatus("error");
      setLastSaveMode("local");
      setLastError("Guardado solo en este dispositivo. Revisá la conexión de tu cuenta.");
    }

    return event;
  }

  async function updateEvent(id: string, input: CalendarEventInput): Promise<CalendarEvent> {
    const event = { id, ...input, title: input.title.trim() };
    const shouldSaveRemote = Boolean(session && mode === "supabase");
    setSyncStatus(shouldSaveRemote ? "saving" : "local");
    setLastSaveMode(shouldSaveRemote ? "pending" : "local");
    setLastError(null);
    setEvents((list) =>
      sortCalendarEvents(list.map((item) => (item.id === id ? event : item))),
    );

    if (shouldSaveRemote) {
      const remote = await upsertCalendarEvent(event);
      if (remote) {
        setEvents((list) => sortCalendarEvents(list.map((item) => (item.id === id ? remote : item))));
        setSyncStatus("synced");
        setLastSaveMode("remote");
        setLastSavedAt(new Date().toISOString());
        return remote;
      }
      setSyncStatus("error");
      setLastSaveMode("local");
      setLastError("Guardado solo en este dispositivo. Revisá la conexión de tu cuenta.");
    }

    return event;
  }

  async function deleteEvent(id: string): Promise<void> {
    const previous = events;
    setEvents((list) => list.filter((item) => item.id !== id));

    if (session && mode === "supabase") {
      setSyncStatus("saving");
      setLastError(null);
      try {
        await deleteCalendarEventRemote(id);
        setSyncStatus("synced");
        setLastSaveMode("remote");
        setLastSavedAt(new Date().toISOString());
      } catch {
        setEvents(previous);
        setSyncStatus("error");
        setLastSaveMode("local");
        setLastError("No se pudo eliminar en tu cuenta. Restauramos la actividad aquí.");
      }
    }
  }

  return {
    events,
    setEvents,
    ready,
    syncing,
    syncStatus,
    lastError,
    lastSaveMode,
    lastSavedAt,
    createEvent,
    updateEvent,
    deleteEvent,
    refreshEvents,
  };
}
