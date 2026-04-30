import { useLocalStorageState } from "@/lib/local-storage";
import { calendarSeed } from "@/lib/mock-data";
import { STORAGE_KEYS } from "@/lib/storage-keys";
import type { CalendarEvent } from "@/types";

export function useCalendarEvents() {
  const [events, setEvents, ready] = useLocalStorageState<CalendarEvent[]>(STORAGE_KEYS.calendarEvents, calendarSeed);
  return { events, setEvents, ready };
}
