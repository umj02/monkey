import { createId } from "@/lib/local-storage";
import type { CalendarEvent } from "@/types";

export type CalendarEventInput = Omit<CalendarEvent, "id">;

export function createCalendarEvent(input: CalendarEventInput): CalendarEvent {
  return { id: createId("event"), title: input.title.trim(), time: input.time, color: input.color };
}

export function sortCalendarEvents(events: CalendarEvent[]) {
  return [...events].sort((a, b) => a.time.localeCompare(b.time));
}
