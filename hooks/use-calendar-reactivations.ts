"use client";

import { useCallback } from "react";
import { useLocalStorageState } from "@/lib/local-storage";
import { calendarOccurrenceBaseId, calendarOccurrenceDate } from "@/lib/calendar/calendar-utils";
import type { CalendarEvent } from "@/types";

type ReactivationMap = Record<string, number>;

const STORAGE_KEY = "monkey.calendarReactivations.v228113";

export function calendarReactivationKey(event: CalendarEvent, fallbackDate: string) {
  return `${calendarOccurrenceBaseId(event)}::${calendarOccurrenceDate(event, fallbackDate)}`;
}

export function reactivationPenaltyPercent(count: number) {
  if (count <= 0) return 0;
  if (count === 1) return 5;
  if (count === 2) return 10;
  return 30;
}

export function useCalendarReactivations() {
  const [counts, setCounts, ready] = useLocalStorageState<ReactivationMap>(STORAGE_KEY, {});

  const getReactivationCount = useCallback((key: string) => counts[key] ?? 0, [counts]);
  const getPenaltyPercent = useCallback((key: string) => reactivationPenaltyPercent(counts[key] ?? 0), [counts]);

  const recordReactivation = useCallback((key: string) => {
    setCounts((current) => ({ ...current, [key]: (current[key] ?? 0) + 1 }));
  }, [setCounts]);

  return { counts, ready, getReactivationCount, getPenaltyPercent, recordReactivation };
}
