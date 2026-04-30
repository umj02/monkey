import { useLocalStorageState } from "@/lib/local-storage";
import { remindersSeed } from "@/lib/mock-data";
import { LEGACY_STORAGE_KEYS, STORAGE_KEYS } from "@/lib/storage-keys";
import { createReminder, type ReminderInput } from "@/lib/services/reminder-service";
import type { Reminder } from "@/types";

export function useReminders() {
  const [items, setItems, ready] = useLocalStorageState<Reminder[]>(STORAGE_KEYS.reminders, remindersSeed, [...LEGACY_STORAGE_KEYS.reminders]);
  return {
    items,
    setItems,
    ready,
    createReminder: (input: ReminderInput) => setItems((list) => [createReminder(input), ...list]),
    updateReminder: (id: string, input: ReminderInput) => setItems((list) => list.map((item) => item.id === id ? { ...item, title: input.title.trim(), time: input.time, repeat: input.repeat } : item)),
    toggleReminder: (id: string) => setItems((list) => list.map((item) => item.id === id ? { ...item, enabled: !item.enabled } : item)),
    deleteReminder: (id: string) => setItems((list) => list.filter((item) => item.id !== id))
  };
}
