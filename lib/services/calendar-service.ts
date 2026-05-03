import { createId } from "@/lib/local-storage";
import type { CalendarEvent } from "@/types";

export type CalendarEventInput = Omit<CalendarEvent, "id">;

export function createCalendarEvent(input: CalendarEventInput): CalendarEvent {
  return {
    id: createId("event"),
    date: input.date,
    title: input.title.trim(),
    time: input.time,
    endTime: input.endTime ?? null,
    color: input.color,
  };
}

export function sortCalendarEvents(events: CalendarEvent[]) {
  return [...events].sort((a, b) =>
    `${a.date} ${a.time} ${a.endTime ?? ""}`.localeCompare(`${b.date} ${b.time} ${b.endTime ?? ""}`),
  );
}
