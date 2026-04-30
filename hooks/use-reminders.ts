import { useLocalStorageState } from "@/lib/local-storage";
import { remindersSeed } from "@/lib/mock-data";
import { STORAGE_KEYS } from "@/lib/storage-keys";
import type { Reminder } from "@/types";

export function useReminders() {
  const [items, setItems, ready] = useLocalStorageState<Reminder[]>(STORAGE_KEYS.reminders, remindersSeed);
  return { items, setItems, ready };
}
