import { createId } from "@/lib/local-storage";
import type { Reminder } from "@/types";

export type ReminderInput = Pick<Reminder, "title" | "time" | "repeat">;

export function createReminder(input: ReminderInput): Reminder {
  return { id: createId("reminder"), title: input.title.trim(), time: input.time, repeat: input.repeat, enabled: true };
}
