"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocalStorageState } from "@/lib/local-storage";
import { STORAGE_KEYS } from "@/lib/storage-keys";
import {
  fetchCalendarEventCompletions,
  upsertCalendarEventCompletion,
} from "@/lib/services/supabase-data-service";
import { calendarCompletionKey } from "@/lib/calendar/calendar-utils";
import type { CalendarEventCompletion } from "@/types";

export type CalendarCompletionSyncStatus = "idle" | "loading" | "saving" | "synced" | "error";

export function useCalendarCompletions() {
  const { session, mode } = useAuth();
  const [completions, setCompletions] = useLocalStorageState<CalendarEventCompletion[]>(
    STORAGE_KEYS.calendarEventCompletions,
    [],
    [],
  );
  const [syncStatus, setSyncStatus] = useState<CalendarCompletionSyncStatus>("idle");
  const [lastError, setLastError] = useState<string | null>(null);

  useEffect(() => {
    if (!session || mode !== "supabase") return;
    let cancelled = false;
    setSyncStatus("loading");
    setLastError(null);
    fetchCalendarEventCompletions()
      .then((remote) => {
        if (cancelled) return;
        if (remote) {
          setCompletions(remote);
          setSyncStatus("synced");
        } else {
          setSyncStatus("error");
          setLastError("No se pudieron cargar los completados del calendario.");
        }
      })
      .catch(() => {
        if (!cancelled) {
          setSyncStatus("error");
          setLastError("No se pudieron cargar los completados del calendario.");
        }
      });
    return () => {
      cancelled = true;
    };
  }, [session?.userId, mode, setCompletions]);

  const completionMap = useMemo(() => {
    const map: Record<string, boolean> = {};
    completions.forEach((completion) => {
      map[calendarCompletionKey(completion.calendarEventId, completion.occurrenceDate)] = completion.done;
    });
    return map;
  }, [completions]);

  async function setCompletion(calendarEventId: string, occurrenceDate: string, done: boolean) {
    const local: CalendarEventCompletion = {
      id: calendarCompletionKey(calendarEventId, occurrenceDate),
      calendarEventId,
      occurrenceDate,
      done,
    };

    setCompletions((list) => {
      const exists = list.some(
        (item) => item.calendarEventId === calendarEventId && item.occurrenceDate === occurrenceDate,
      );
      return exists
        ? list.map((item) =>
            item.calendarEventId === calendarEventId && item.occurrenceDate === occurrenceDate
              ? { ...item, done }
              : item,
          )
        : [...list, local];
    });

    if (session && mode === "supabase") {
      setSyncStatus("saving");
      setLastError(null);
      const remote = await upsertCalendarEventCompletion({ calendarEventId, occurrenceDate, done });
      if (remote) {
        setCompletions((list) =>
          list.map((item) =>
            item.calendarEventId === calendarEventId && item.occurrenceDate === occurrenceDate ? remote : item,
          ),
        );
        setSyncStatus("synced");
        return true;
      }
      setSyncStatus("error");
      setLastError("Se marcó localmente, pero no se pudo sincronizar con tu cuenta.");
      return false;
    }

    return true;
  }

  return { completions, completionMap, syncStatus, lastError, setCompletion };
}
