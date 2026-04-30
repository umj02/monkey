import { useLocalStorageState } from "@/lib/local-storage";
import { calendarSeed } from "@/lib/mock-data";
import { LEGACY_STORAGE_KEYS, STORAGE_KEYS } from "@/lib/storage-keys";
import { createCalendarEvent, normalizeCalendarEvents, sortCalendarEvents, type CalendarEventInput } from "@/lib/services/calendar-service";
import type { CalendarEvent } from "@/types";

export function useCalendarEvents() {
  const [events, setEvents, ready] = useLocalStorageState<CalendarEvent[]>(STORAGE_KEYS.calendarEvents, calendarSeed, [...LEGACY_STORAGE_KEYS.calendarEvents]);
  const normalizedEvents = normalizeCalendarEvents(events);
  return {
    events: normalizedEvents,
    setEvents,
    ready,
    createEvent: (input: CalendarEventInput) => setEvents((list) => sortCalendarEvents([...normalizeCalendarEvents(list), createCalendarEvent(input)])),
    updateEvent: (id: string, input: CalendarEventInput) => setEvents((list) => sortCalendarEvents(normalizeCalendarEvents(list).map((item) => item.id === id ? { ...item, ...input, title: input.title.trim() } : item))),
    deleteEvent: (id: string) => setEvents((list) => list.filter((item) => item.id !== id))
  };
}
