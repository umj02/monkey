import { createId } from "@/lib/local-storage";
import type { Reminder, ReminderPanelItem, ReminderStatus, TimeBlock } from "@/types";

export type ReminderInput = Pick<Reminder, "title" | "time" | "repeat"> & { taskId?: string | null; calendarEventId?: string | null };

export function createReminder(input: ReminderInput): Reminder {
  return { id: createId("reminder"), title: input.title.trim(), time: input.time, repeat: input.repeat, enabled: true, taskId: input.taskId ?? null, calendarEventId: input.calendarEventId ?? null };
}

export function isValidReminderTime(value: string) {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}

export function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

export function normalizeReminderTime(value: string | null | undefined, fallback = "09:00") {
  const next = (value || fallback).slice(0, 5);
  return isValidReminderTime(next) ? next : fallback;
}

export function createReminderDateTime(dateKey: string, time: string) {
  const safeTime = normalizeReminderTime(time);
  return new Date(`${dateKey}T${safeTime}:00`).toISOString();
}

export function reminderTimeFromIso(value?: string | null, fallback = "09:00") {
  if (!value) return fallback;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return fallback;
  return date.toLocaleTimeString("es-CR", { hour: "2-digit", minute: "2-digit", hour12: false });
}

export function reminderDateKeyFromIso(value?: string | null) {
  if (!value) return todayKey();
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return todayKey();
  return date.toISOString().slice(0, 10);
}

export function getReminderStatus(reminderAt?: string | null, enabled = true): ReminderStatus {
  if (!enabled) return "inactive";
  if (!reminderAt) return "inactive";
  const date = new Date(reminderAt);
  if (Number.isNaN(date.getTime())) return "upcoming";
  const now = new Date();
  const valueKey = date.toISOString().slice(0, 10);
  const nowKey = now.toISOString().slice(0, 10);
  if (date.getTime() < now.getTime()) return "overdue";
  if (valueKey === nowKey) return "today";
  return "upcoming";
}

export function formatReminderDateLabel(reminderAt?: string | null) {
  if (!reminderAt) return "Sin fecha";
  const date = new Date(reminderAt);
  if (Number.isNaN(date.getTime())) return "Fecha pendiente";
  const valueKey = date.toISOString().slice(0, 10);
  const currentKey = todayKey();
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowKey = tomorrow.toISOString().slice(0, 10);
  if (valueKey === currentKey) return "Hoy";
  if (valueKey === tomorrowKey) return "Mañana";
  return new Intl.DateTimeFormat("es-CR", { weekday: "short", day: "numeric", month: "short" }).format(date);
}

export function statusLabel(status: ReminderStatus) {
  const labels: Record<ReminderStatus, string> = {
    today: "Para hoy",
    upcoming: "Próximos",
    overdue: "Ya pasaron",
    inactive: "Inactivos",
  };
  return labels[status];
}

export function mapTaskBlocksToReminderItems(blocks: TimeBlock[]): ReminderPanelItem[] {
  return blocks.flatMap((block) =>
    block.tasks
      .filter((task) => Boolean(task.reminderAt))
      .map((task): ReminderPanelItem => {
        const reminderAt = task.reminderAt || null;
        const time = reminderTimeFromIso(reminderAt, block.time);
        const status = getReminderStatus(reminderAt, true);
        return {
          id: `task-${task.id}`,
          source: "task",
          taskId: task.id,
          title: task.title,
          time,
          reminderAt,
          enabled: true,
          status,
          dateLabel: formatReminderDateLabel(reminderAt),
          blockId: block.id,
          blockTitle: block.title,
          blockTime: block.time,
          icon: block.icon,
        };
      }),
  );
}

export function mapStandaloneRemindersToItems(reminders: Reminder[]): ReminderPanelItem[] {
  return reminders.map((item): ReminderPanelItem => {
    const reminderAt = createReminderDateTime(todayKey(), item.time);
    const status = getReminderStatus(reminderAt, item.enabled);
    return {
      id: `reminder-${item.id}`,
      source: "standalone",
      reminderId: item.id,
      title: item.title,
      time: normalizeReminderTime(item.time),
      reminderAt,
      enabled: item.enabled,
      repeat: item.repeat,
      taskId: item.taskId ?? null,
      calendarEventId: item.calendarEventId ?? null,
      status,
      dateLabel: item.enabled ? formatReminderDateLabel(reminderAt) : "Inactivo",
    };
  });
}

export function sortReminderItems(items: ReminderPanelItem[]) {
  const order: Record<ReminderStatus, number> = { today: 0, upcoming: 1, overdue: 2, inactive: 3 };
  return [...items].sort((a, b) => {
    const statusDiff = order[a.status] - order[b.status];
    if (statusDiff !== 0) return statusDiff;
    return (a.reminderAt || "").localeCompare(b.reminderAt || "") || a.title.localeCompare(b.title);
  });
}

export function groupReminderItems(items: ReminderPanelItem[]) {
  const sorted = sortReminderItems(items);
  return {
    today: sorted.filter((item) => item.status === "today"),
    upcoming: sorted.filter((item) => item.status === "upcoming"),
    overdue: sorted.filter((item) => item.status === "overdue"),
    inactive: sorted.filter((item) => item.status === "inactive"),
  };
}
