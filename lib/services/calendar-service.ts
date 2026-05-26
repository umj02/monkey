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
    iconKey: input.iconKey ?? null,
    activityTypeKey: input.activityTypeKey ?? null,
    recurrenceType: input.recurrenceType ?? "none",
    recurrenceDays: input.recurrenceDays ?? null,
    recurrenceUntil: input.recurrenceUntil ?? null,
    recurrenceGroupId: input.recurrenceGroupId ?? null,
    done: Boolean(input.done),
    source: input.source ?? "normal",
    challengeId: input.challengeId ?? null,
    challengeTaskId: input.challengeTaskId ?? null,
    isLocked: Boolean(input.isLocked),
    verificationStatus: input.verificationStatus ?? null,
    rewardBananas: input.rewardBananas ?? null,
    reactivationCount: input.reactivationCount ?? 0,
    reactivationPenalty: input.reactivationPenalty ?? 0,
    reactivationPenaltyDate: input.reactivationPenaltyDate ?? null,
    expiredAt: input.expiredAt ?? null,
    lastReactivatedAt: input.lastReactivatedAt ?? null,
  };
}

export function sortCalendarEvents(events: CalendarEvent[]) {
  return [...events].sort((a, b) =>
    `${a.date} ${a.time} ${a.endTime ?? ""} ${a.recurrenceType ?? "none"} ${a.title}`.localeCompare(`${b.date} ${b.time} ${b.endTime ?? ""} ${b.recurrenceType ?? "none"} ${b.title}`),
  );
}
