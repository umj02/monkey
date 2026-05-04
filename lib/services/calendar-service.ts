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
    recurrenceType: input.recurrenceType ?? "none",
    recurrenceDays: input.recurrenceDays ?? null,
    recurrenceUntil: input.recurrenceUntil ?? null,
    recurrenceGroupId: input.recurrenceGroupId ?? null,
    done: Boolean(input.done),
  };
}

export function sortCalendarEvents(events: CalendarEvent[]) {
  return [...events].sort((a, b) =>
    `${a.date} ${a.time} ${a.endTime ?? ""} ${a.recurrenceType ?? "none"}`.localeCompare(`${b.date} ${b.time} ${b.endTime ?? ""} ${b.recurrenceType ?? "none"}`),
  );
}
