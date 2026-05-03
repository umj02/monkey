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

export function useCalendarEvents() {
  const { session, mode } = useAuth();
  const [events, setEvents, ready] = useLocalStorageState<CalendarEvent[]>(
    STORAGE_KEYS.calendarEvents,
    calendarSeed,
    [...LEGACY_STORAGE_KEYS.calendarEvents],
  );
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    if (!session || mode !== "supabase") return;
    let cancelled = false;
    setSyncing(true);
    fetchCalendarEvents()
      .then((remote) => {
        if (!cancelled && remote) setEvents(remote);
      })
      .finally(() => {
        if (!cancelled) setSyncing(false);
      });
    return () => {
      cancelled = true;
    };
  }, [session?.userId, mode, setEvents]);

  function createEvent(input: CalendarEventInput) {
    const event = createCalendarEvent(input);
    setEvents((list) => sortCalendarEvents([...list, event]));
    if (session && mode === "supabase") {
      void upsertCalendarEvent(event).then((remote) => {
        if (!remote) return;
        setEvents((list) =>
          sortCalendarEvents(
            list.map((item) => (item.id === event.id ? remote : item)),
          ),
        );
      });
    }
  }

  function updateEvent(id: string, input: CalendarEventInput) {
    const event = { id, ...input, title: input.title.trim() };
    setEvents((list) =>
      sortCalendarEvents(list.map((item) => (item.id === id ? event : item))),
    );
    if (session && mode === "supabase") void upsertCalendarEvent(event);
  }

  function deleteEvent(id: string) {
    setEvents((list) => list.filter((item) => item.id !== id));
    if (session && mode === "supabase") void deleteCalendarEventRemote(id);
  }

  return {
    events,
    setEvents,
    ready,
    syncing,
    createEvent,
    updateEvent,
    deleteEvent,
  };
}
