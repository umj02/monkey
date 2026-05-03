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

export type SyncStatus = "idle" | "loading" | "saving" | "synced" | "error";

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

  useEffect(() => {
    if (!session || mode !== "supabase") return;
    let cancelled = false;
    setSyncing(true);
    setSyncStatus("loading");
    setLastError(null);
    fetchCalendarEvents()
      .then((remote) => {
        if (cancelled) return;
        if (remote) {
          setEvents(remote);
          setSyncStatus("synced");
        } else {
          setSyncStatus("error");
          setLastError("No se pudo cargar el calendario.");
        }
      })
      .catch(() => {
        if (!cancelled) {
          setSyncStatus("error");
          setLastError("No se pudo cargar el calendario.");
        }
      })
      .finally(() => {
        if (!cancelled) setSyncing(false);
      });
    return () => {
      cancelled = true;
    };
  }, [session?.userId, mode, setEvents]);

  async function createEvent(input: CalendarEventInput): Promise<CalendarEvent> {
    const event = createCalendarEvent(input);
    setEvents((list) => sortCalendarEvents([...list, event]));

    if (session && mode === "supabase") {
      setSyncStatus("saving");
      setLastError(null);
      const remote = await upsertCalendarEvent(event);
      if (remote) {
        setEvents((list) =>
          sortCalendarEvents(
            list.map((item) => (item.id === event.id ? remote : item)),
          ),
        );
        setSyncStatus("synced");
        return remote;
      }
      setSyncStatus("error");
      setLastError("La actividad quedó local, pero no se pudo sincronizar.");
    }

    return event;
  }

  async function updateEvent(id: string, input: CalendarEventInput): Promise<CalendarEvent> {
    const event = { id, ...input, title: input.title.trim() };
    setEvents((list) =>
      sortCalendarEvents(list.map((item) => (item.id === id ? event : item))),
    );

    if (session && mode === "supabase") {
      setSyncStatus("saving");
      setLastError(null);
      const remote = await upsertCalendarEvent(event);
      if (remote) {
        setEvents((list) => sortCalendarEvents(list.map((item) => (item.id === id ? remote : item))));
        setSyncStatus("synced");
        return remote;
      }
      setSyncStatus("error");
      setLastError("La actividad quedó local, pero no se pudo sincronizar.");
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
      } catch {
        setEvents(previous);
        setSyncStatus("error");
        setLastError("No se pudo eliminar la actividad.");
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
    createEvent,
    updateEvent,
    deleteEvent,
  };
}
