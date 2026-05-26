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

export function eventReactivationCount(event: CalendarEvent) {
  return Math.max(0, event.reactivationCount ?? 0);
}

export function eventReactivationPenalty(event: CalendarEvent, scopeDate?: string) {
  const penaltyDate = event.reactivationPenaltyDate ?? event.date ?? null;
  if (scopeDate && penaltyDate && penaltyDate !== scopeDate) return 0;
  return Math.max(0, event.reactivationPenalty ?? reactivationPenaltyPercent(eventReactivationCount(event)));
}

export function withReactivationPenalty(event: CalendarEvent, expiredAt?: string, penaltyDate?: string): CalendarEvent {
  const nextCount = eventReactivationCount(event) + 1;
  return {
    ...event,
    reactivationCount: nextCount,
    reactivationPenalty: reactivationPenaltyPercent(nextCount),
    reactivationPenaltyDate: penaltyDate ?? event.reactivationPenaltyDate ?? event.date ?? null,
    expiredAt: event.expiredAt ?? expiredAt ?? new Date().toISOString(),
    lastReactivatedAt: new Date().toISOString(),
  };
}

export function useCalendarReactivations() {
  const [counts, setCounts, ready] = useLocalStorageState<ReactivationMap>(STORAGE_KEY, {});

  const getReactivationCount = useCallback((key: string, event?: CalendarEvent) => {
    return Math.max(eventReactivationCount(event ?? ({} as CalendarEvent)), counts[key] ?? 0);
  }, [counts]);

  const getPenaltyPercent = useCallback((key: string, event?: CalendarEvent, scopeDate?: string) => {
    const localPenalty = reactivationPenaltyPercent(counts[key] ?? 0);
    const remotePenalty = event ? eventReactivationPenalty(event, scopeDate) : 0;
    return Math.max(localPenalty, remotePenalty);
  }, [counts]);

  const recordReactivation = useCallback((key: string) => {
    setCounts((current) => ({ ...current, [key]: (current[key] ?? 0) + 1 }));
  }, [setCounts]);

  return { counts, ready, getReactivationCount, getPenaltyPercent, recordReactivation };
}
