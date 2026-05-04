"use client";

import { useEffect, useState } from "react";
import { useLocalStorageState } from "@/lib/local-storage";
import { STORAGE_KEYS } from "@/lib/storage-keys";
import { useAuth } from "@/hooks/use-auth";
import type { CalendarOccurrenceOverride } from "@/types";
import {
  deleteCalendarOccurrenceOverrideRemote,
  fetchCalendarOccurrenceOverrides,
  upsertCalendarOccurrenceOverride,
} from "@/lib/services/supabase-data-service";

export type OverrideSyncStatus = "idle" | "loading" | "saving" | "synced" | "error";

const OVERRIDE_STORAGE_KEY = `${STORAGE_KEYS.calendarEvents}.overrides.v215`;

function overrideKey(calendarEventId: string, occurrenceDate: string) {
  return `${calendarEventId}::${occurrenceDate}`;
}

export function useCalendarOverrides() {
  const { session, mode } = useAuth();
  const [overrides, setOverrides, ready] = useLocalStorageState<CalendarOccurrenceOverride[]>(OVERRIDE_STORAGE_KEY, []);
  const [syncStatus, setSyncStatus] = useState<OverrideSyncStatus>("idle");
  const [lastError, setLastError] = useState<string | null>(null);

  async function refreshOverrides() {
    if (!session || mode !== "supabase") return false;
    setSyncStatus("loading");
    setLastError(null);
    try {
      const remote = await fetchCalendarOccurrenceOverrides();
      if (remote) {
        setOverrides(remote);
        setSyncStatus("synced");
        return true;
      }
      setSyncStatus("error");
      setLastError("No se pudieron cargar los cambios por fecha.");
      return false;
    } catch {
      setSyncStatus("error");
      setLastError("No se pudieron cargar los cambios por fecha.");
      return false;
    }
  }

  useEffect(() => {
    if (!session || mode !== "supabase") return;
    void refreshOverrides();
  }, [session?.userId, mode]);

  async function saveOverride(input: Omit<CalendarOccurrenceOverride, "id"> & { id?: string }) {
    const temp: CalendarOccurrenceOverride = {
      id: input.id ?? `override-${Date.now()}`,
      calendarEventId: input.calendarEventId,
      occurrenceDate: input.occurrenceDate,
      title: input.title ?? null,
      time: input.time ?? null,
      endTime: input.endTime ?? null,
      color: input.color ?? null,
      iconKey: input.iconKey ?? null,
      activityTypeKey: input.activityTypeKey ?? null,
      reminderAt: input.reminderAt ?? null,
      isCancelled: Boolean(input.isCancelled),
    };
    const key = overrideKey(temp.calendarEventId, temp.occurrenceDate);
    setOverrides((list) => {
      const exists = list.some((item) => overrideKey(item.calendarEventId, item.occurrenceDate) === key);
      return exists
        ? list.map((item) => (overrideKey(item.calendarEventId, item.occurrenceDate) === key ? { ...item, ...temp } : item))
        : [...list, temp];
    });

    if (session && mode === "supabase") {
      setSyncStatus("saving");
      const remote = await upsertCalendarOccurrenceOverride(temp);
      if (remote) {
        setOverrides((list) => list.map((item) => (overrideKey(item.calendarEventId, item.occurrenceDate) === key ? remote : item)));
        setSyncStatus("synced");
        return { ok: true, override: remote };
      }
      setSyncStatus("error");
      setLastError("El cambio quedó temporal, pero no se pudo sincronizar.");
      return { ok: false, override: temp };
    }

    return { ok: true, override: temp };
  }

  async function deleteOverride(calendarEventId: string, occurrenceDate: string) {
    const key = overrideKey(calendarEventId, occurrenceDate);
    const previous = overrides;
    setOverrides((list) => list.filter((item) => overrideKey(item.calendarEventId, item.occurrenceDate) !== key));
    if (session && mode === "supabase") {
      const ok = await deleteCalendarOccurrenceOverrideRemote(calendarEventId, occurrenceDate);
      if (!ok) {
        setOverrides(previous);
        setSyncStatus("error");
        setLastError("No se pudo eliminar el cambio por fecha.");
      }
      return ok;
    }
    return true;
  }

  return { overrides, ready, syncStatus, lastError, refreshOverrides, saveOverride, deleteOverride };
}
