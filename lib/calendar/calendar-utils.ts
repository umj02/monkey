import type { CalendarEvent, CalendarOccurrenceOverride } from "@/types";

export const DEFAULT_CALENDAR_DURATION_MINUTES = 60;

export function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function fromDateKey(dateKey: string) {
  const [year = "2026", month = "05", day = "14"] = dateKey.split("-");
  return new Date(Number(year), Number(month) - 1, Number(day));
}

export function compareDateKeys(a: string, b: string) {
  return a.localeCompare(b);
}

export function dateKeyToJsDay(dateKey: string) {
  return fromDateKey(dateKey).getDay();
}

export function isValidDateKey(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = fromDateKey(value);
  return !Number.isNaN(date.getTime()) && toDateKey(date) === value;
}

export function isValidTime(value: string) {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}

export function timeToMinutes(value: string) {
  const [hour = "0", minute = "0"] = value.split(":");
  return Number(hour) * 60 + Number(minute);
}

export function normalizeTime(value: string | null | undefined, fallback = "09:00") {
  return (value || fallback).slice(0, 5);
}

export function eventStartHour(event: CalendarEvent) {
  return Math.floor(timeToMinutes(event.time) / 60) * 60;
}

export function eventEndMinutes(event: CalendarEvent) {
  if (event.endTime && isValidTime(event.endTime)) return timeToMinutes(event.endTime);
  return timeToMinutes(event.time) + DEFAULT_CALENDAR_DURATION_MINUTES;
}

export function eventInterval(event: CalendarEvent) {
  const start = timeToMinutes(event.time);
  const end = eventEndMinutes(event);
  return { start, end, startHour: Math.floor(start / 60) * 60 };
}

export function isLongEvent(event: CalendarEvent) {
  return Boolean(
    event.endTime &&
      isValidTime(event.endTime) &&
      eventEndMinutes(event) > timeToMinutes(event.time) + DEFAULT_CALENDAR_DURATION_MINUTES,
  );
}

export function eventOccursOnDate(event: CalendarEvent, dateKey: string) {
  const recurrenceType = event.recurrenceType ?? "none";
  const startDate = event.date;
  if (recurrenceType === "none") return startDate === dateKey;
  if (compareDateKeys(dateKey, startDate) < 0) return false;
  if (event.recurrenceUntil && compareDateKeys(dateKey, event.recurrenceUntil) > 0) return false;
  if (recurrenceType === "daily") return true;
  if (recurrenceType === "custom_days") return (event.recurrenceDays ?? []).includes(dateKeyToJsDay(dateKey));
  return false;
}

export function isRecurringEvent(event: CalendarEvent) {
  return (event.recurrenceType ?? "none") !== "none";
}

export function getCalendarEventDone(event: CalendarEvent, occurrenceDate: string, completions: Record<string, boolean>) {
  const key = calendarCompletionKey(event.id, occurrenceDate);
  if (key in completions) return completions[key];
  return isRecurringEvent(event) ? false : Boolean(event.done);
}

export function calendarCompletionKey(eventId: string, occurrenceDate: string) {
  return `${eventId}::${occurrenceDate}`;
}

export function findContainingLongEvent(events: CalendarEvent[], dateKey: string, child: CalendarEvent) {
  const childStart = timeToMinutes(child.time);
  return events.find((candidate) => {
    if (candidate.id === child.id) return false;
    if (!eventOccursOnDate(candidate, dateKey)) return false;
    if (!isLongEvent(candidate)) return false;
    const { start, end } = eventInterval(candidate);
    return start <= childStart && end > childStart;
  }) ?? null;
}


export function calendarOccurrenceBaseId(event: CalendarEvent) {
  return event.parentEventId || event.id;
}

export function calendarOccurrenceDate(event: CalendarEvent, fallbackDate: string) {
  return event.occurrenceDate || fallbackDate;
}

export function overrideKey(calendarEventId: string, occurrenceDate: string) {
  return `${calendarEventId}::${occurrenceDate}`;
}

export function applyCalendarOverridesForDate(
  events: CalendarEvent[],
  overrides: CalendarOccurrenceOverride[],
  dateKey: string,
) {
  const byKey = new Map<string, CalendarOccurrenceOverride>();
  overrides.forEach((override) => byKey.set(overrideKey(override.calendarEventId, override.occurrenceDate), override));

  return events
    .filter((event) => eventOccursOnDate(event, dateKey))
    .map((event): CalendarEvent | null => {
      const override = byKey.get(overrideKey(event.id, dateKey));
      if (override?.isCancelled) return null;
      if (!override) {
        return {
          ...event,
          parentEventId: isRecurringEvent(event) ? event.id : null,
          occurrenceDate: dateKey,
          isOccurrenceOverride: false,
        };
      }
      return {
        ...event,
        id: `occ-${override.id}`,
        parentEventId: event.id,
        occurrenceDate: dateKey,
        isOccurrenceOverride: true,
        title: override.title ?? event.title,
        time: override.time ?? event.time,
        endTime: override.endTime ?? event.endTime ?? null,
        color: override.color ?? event.color,
        iconKey: override.iconKey ?? event.iconKey ?? null,
        activityTypeKey: override.activityTypeKey ?? event.activityTypeKey ?? null,
      };
    })
    .filter((event): event is CalendarEvent => Boolean(event));
}
