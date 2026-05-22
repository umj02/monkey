import type { CalendarEvent, Challenge, ChallengeStatus, ChallengeTask, ChallengeTaskStatus } from "@/types";
import { compareDateKeys, toDateKey } from "@/lib/calendar/calendar-utils";

export const BANANA_ICON = "🍌";

export type ChallengeTemplate = {
  id: string;
  title: string;
  description: string;
  iconKey: string;
  activityTypeKey: string;
  color: CalendarEvent["color"];
  defaultTimes: string[];
  frequency: "daily" | "weekly" | "monthly";
  defaultDays: number;
  rewardBananas: number;
  helper: string;
};

export const PERSONAL_CHALLENGE_TEMPLATES: ChallengeTemplate[] = [
  {
    id: "agua-3",
    title: "3 vasos de agua",
    description: "Un reto simple para cuidar tu energía durante el día.",
    iconKey: "monito-beber",
    activityTypeKey: "beber",
    color: "blue",
    defaultTimes: ["09:00", "13:00", "17:00"],
    frequency: "daily",
    defaultDays: 1,
    rewardBananas: 3,
    helper: "Ideal para empezar hoy sin presión.",
  },
  {
    id: "caminar-7",
    title: "Caminar 10 minutos",
    description: "Movimiento suave para despejarte y volver con más foco.",
    iconKey: "monito-caminar",
    activityTypeKey: "caminar",
    color: "green",
    defaultTimes: ["16:00"],
    frequency: "weekly",
    defaultDays: 7,
    rewardBananas: 14,
    helper: "Un check por día durante una semana.",
  },
  {
    id: "orden-7",
    title: "Ordenar tu espacio",
    description: "Pequeña rutina para cerrar el día con menos ruido visual.",
    iconKey: "monito-cuidado-personal",
    activityTypeKey: "cuidado-personal",
    color: "orange",
    defaultTimes: ["19:00"],
    frequency: "weekly",
    defaultDays: 7,
    rewardBananas: 21,
    helper: "Perfecto para crear constancia sin hacerlo pesado.",
  },
  {
    id: "respirar-5",
    title: "Respirar y pausar",
    description: "Un mini momento para bajar revoluciones antes de seguir.",
    iconKey: "monito-meditacion",
    activityTypeKey: "meditacion",
    color: "purple",
    defaultTimes: ["20:30"],
    frequency: "weekly",
    defaultDays: 5,
    rewardBananas: 10,
    helper: "Reto corto de 5 días.",
  },
];

export function isChallengeCalendarEvent(event?: Pick<CalendarEvent, "source" | "challengeId" | "isLocked"> | null) {
  return Boolean(event && (event.source === "personal_challenge" || event.source === "guardian_challenge" || event.challengeId || event.isLocked));
}

export function challengeStatusLabel(status: ChallengeStatus) {
  return {
    active: "Activo",
    completed: "Completado",
    cancelled: "Cancelado",
    expired: "Vencido",
  }[status];
}

export function challengeTaskStatusLabel(status: ChallengeTaskStatus) {
  return {
    pending: "Pendiente",
    checked: "Cumplida",
    verified: "Validada",
    rejected: "Rechazada",
    missed: "No realizada",
  }[status];
}

export function addDaysToDateKey(dateKey: string, amount: number) {
  const date = new Date(`${dateKey}T00:00:00`);
  date.setDate(date.getDate() + amount);
  return toDateKey(date);
}

export function todayDateKey() {
  return toDateKey(new Date());
}

export function buildChallengeDates(startDate: string, days: number) {
  return Array.from({ length: Math.max(1, days) }, (_, index) => addDaysToDateKey(startDate, index));
}

export function isChallengeTaskDone(task: ChallengeTask, doneTaskIds?: Set<string>) {
  return task.status === "checked" || task.status === "verified" || Boolean(doneTaskIds?.has(task.calendarEventId ?? task.id));
}

export function isChallengeTaskMissed(task: ChallengeTask, todayKey = todayDateKey()) {
  if (isChallengeTaskDone(task)) return false;
  if (task.status === "missed") return true;
  return compareDateKeys(task.scheduledDate, todayKey) < 0;
}

export function isChallengeTaskAvailableToday(task: ChallengeTask, todayKey = todayDateKey()) {
  return compareDateKeys(task.scheduledDate, todayKey) === 0 && !isChallengeTaskDone(task) && task.status !== "missed";
}

export function isChallengeTaskUpcoming(task: ChallengeTask, todayKey = todayDateKey()) {
  return compareDateKeys(task.scheduledDate, todayKey) > 0;
}

export function calculateChallengeProgress(challenge: Challenge, doneTaskIds: Set<string>) {
  const todayKey = todayDateKey();
  const total = challenge.tasks.length;
  const done = challenge.tasks.filter((task) => isChallengeTaskDone(task, doneTaskIds)).length;
  const missed = challenge.tasks.filter((task) => isChallengeTaskMissed(task, todayKey)).length;
  const upcoming = challenge.tasks.filter((task) => isChallengeTaskUpcoming(task, todayKey)).length;
  const availableToday = challenge.tasks.filter((task) => isChallengeTaskAvailableToday(task, todayKey)).length;
  const pending = Math.max(0, total - done - missed);
  return {
    total,
    done,
    missed,
    upcoming,
    pending,
    availableToday,
    percent: total ? Math.round((done / total) * 100) : 0,
    completed: total > 0 && done >= total && missed === 0,
    incomplete: missed > 0,
  };
}


export function hydrateChallengeTaskStatuses(challenge: Challenge, doneTaskIds: Set<string>): Challenge {
  const now = new Date().toISOString();
  const todayKey = todayDateKey();
  const tasks = challenge.tasks.map((task) => {
    const done = doneTaskIds.has(task.calendarEventId ?? task.id) || task.status === "checked" || task.status === "verified";
    if (done && task.status !== "checked" && task.status !== "verified") {
      return { ...task, status: "checked" as const, checkedAt: task.checkedAt ?? now };
    }
    if (!done && task.status === "checked") {
      return { ...task, status: "pending" as const, checkedAt: null };
    }
    if (!done && task.status === "pending" && compareDateKeys(task.scheduledDate, todayKey) < 0) {
      return { ...task, status: "missed" as const, checkedAt: null };
    }
    return task;
  });
  const allDone = tasks.length > 0 && tasks.every((task) => task.status === "checked" || task.status === "verified");
  const hasMissed = tasks.some((task) => task.status === "missed");
  return {
    ...challenge,
    tasks,
    status: allDone && challenge.claimedAt ? "completed" : hasMissed && !challenge.claimedAt ? "expired" : challenge.status,
    updatedAt: now,
  };
}

export function nextPendingChallengeTask(challenge: Challenge, doneTaskIds: Set<string>) {
  const todayKey = todayDateKey();
  return challenge.tasks.find((task) => !isChallengeTaskDone(task, doneTaskIds) && task.status !== "missed" && compareDateKeys(task.scheduledDate, todayKey) >= 0) ?? null;
}
