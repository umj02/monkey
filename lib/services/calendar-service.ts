import { createId } from "@/lib/local-storage";
import type { CalendarEvent } from "@/types";

export type CalendarEventInput = Omit<CalendarEvent, "id">;

export function createCalendarEvent(input: CalendarEventInput): CalendarEvent {
  return {
    id: createId("event"),
    date: input.date,
    title: input.title.trim(),
    time: input.time,
    color: input.color
  };
}

export function normalizeCalendarEvents(events: CalendarEvent[], fallbackDate = "2026-05-14") {
  return events.map((event) => ({ ...event, date: event.date || fallbackDate }));
}

export function sortCalendarEvents(events: CalendarEvent[]) {
  return [...events].sort((a, b) => `${a.date}-${a.time}`.localeCompare(`${b.date}-${b.time}`));
}
