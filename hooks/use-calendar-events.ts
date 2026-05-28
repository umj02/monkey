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
export type EventSaveState = "saving" | "remote" | "local" | "error";

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
  const [eventSaveState, setEventSaveState] = useState<Record<string, EventSaveState>>({});

  function markEventSaveState(id: string, state: EventSaveState) {
    setEventSaveState((map) => ({ ...map, [id]: state }));
  }

  function replaceEventSaveState(localId: string, remoteId: string, state: EventSaveState) {
    setEventSaveState((map) => {
      const next = { ...map };
      delete next[localId];
      next[remoteId] = state;
      return next;
    });
  }

  async function refreshEvents() {
    if (mode !== "supabase") return false;
    setSyncing(true);
    setSyncStatus("loading");
    setLastError(null);
    try {
      const remote = await fetchCalendarEvents();
      if (remote) {
        setEvents(remote);
        setEventSaveState((map) => {
          const next = { ...map };
          remote.forEach((event) => { next[event.id] = "remote"; });
          return next;
        });
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
    if (mode !== "supabase") return;
    void refreshEvents().then(() => {
      if (cancelled) return;
    });
    return () => {
      cancelled = true;
    };
  }, [session?.userId, mode]);

  async function createEvent(input: CalendarEventInput): Promise<CalendarEvent> {
    const event = createCalendarEvent(input);
    // v2.28.1.25 — use the Supabase mode as the source of truth.
    // The auth session can arrive a few ms later from cookies, but the remote
    // data service can still resolve it with supabase.auth.getSession().
    const shouldSaveRemote = mode === "supabase";
    setSyncStatus(shouldSaveRemote ? "saving" : "local");
    setLastSaveMode(shouldSaveRemote ? "pending" : "local");
    setLastError(null);
    markEventSaveState(event.id, shouldSaveRemote ? "saving" : "local");
    setEvents((list) => sortCalendarEvents([...list, event]));

    if (shouldSaveRemote) {
      const remote = await upsertCalendarEvent(event);
      if (remote) {
        setEvents((list) =>
          sortCalendarEvents(
            list.map((item) => (item.id === event.id ? remote : item)),
          ),
        );
        replaceEventSaveState(event.id, remote.id, "remote");
        setSyncStatus("synced");
        setLastSaveMode("remote");
        setLastSavedAt(new Date().toISOString());
        // Pull the canonical remote list after create so recurring payloads and
        // remote IDs are reflected immediately in Calendar/Today.
        void refreshEvents();
        return remote;
      }
      markEventSaveState(event.id, "error");
      setSyncStatus("error");
      setLastSaveMode("local");
      setLastError("No pudimos guardar en tu cuenta. La actividad quedó local hasta reconectar.");
    }

    return event;
  }

  async function updateEvent(id: string, input: CalendarEventInput): Promise<CalendarEvent> {
    const event = { id, ...input, title: input.title.trim() };
    const shouldSaveRemote = mode === "supabase";
    setSyncStatus(shouldSaveRemote ? "saving" : "local");
    setLastSaveMode(shouldSaveRemote ? "pending" : "local");
    setLastError(null);
    markEventSaveState(id, shouldSaveRemote ? "saving" : "local");
    setEvents((list) =>
      sortCalendarEvents(list.map((item) => (item.id === id ? event : item))),
    );

    if (shouldSaveRemote) {
      const remote = await upsertCalendarEvent(event);
      if (remote) {
        setEvents((list) => sortCalendarEvents(list.map((item) => (item.id === id ? remote : item))));
        replaceEventSaveState(id, remote.id, "remote");
        setSyncStatus("synced");
        setLastSaveMode("remote");
        setLastSavedAt(new Date().toISOString());
        void refreshEvents();
        return remote;
      }
      markEventSaveState(id, "error");
      setSyncStatus("error");
      setLastSaveMode("local");
      setLastError("No pudimos guardar en tu cuenta. La actividad quedó local hasta reconectar.");
    }

    return event;
  }

  async function deleteEvent(id: string): Promise<void> {
    const previous = events;
    setEvents((list) => list.filter((item) => item.id !== id));

    if (mode === "supabase") {
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
    eventSaveState,
    createEvent,
    updateEvent,
    deleteEvent,
    refreshEvents,
  };
}
