import type { CalendarEvent, TimeBlock, WalletData } from "@/types";
import { fromDateKey, toDateKey } from "@/lib/calendar/calendar-utils";

export type AchievementTier = "bronze" | "silver" | "gold" | "special";
export type AchievementGroup = "daily" | "calendar" | "wallet" | "growth";

export type Achievement = {
  id: string;
  title: string;
  description: string;
  group: AchievementGroup;
  tier: AchievementTier;
  icon: string;
  progress: number;
  target: number;
  unlocked: boolean;
  unlockedAt?: string | null;
  persisted?: boolean;
  helper: string;
};

export type PersistentAchievementUnlock = {
  achievementId: string;
  unlockedAt: string;
  sourceProgress: number;
};

export type AchievementStats = {
  totalTasks: number;
  completedTasks: number;
  totalCalendarEvents: number;
  completedCalendarEvents: number;
  totalWalletTransactions: number;
  savingsAmount: number;
  activeGoals: number;
  activeDays: number;
  streak: number;
  routineCount: number;
};

export type AchievementResult = {
  achievements: Achievement[];
  stats: AchievementStats;
  unlockedCount: number;
  totalCount: number;
  completion: number;
  nextAchievement: Achievement | null;
};

function clamp(value: number, target: number) {
  if (target <= 0) return 0;
  return Math.max(0, Math.min(value, target));
}

function percent(value: number, target: number) {
  if (!target) return 0;
  return Math.round((clamp(value, target) / target) * 100);
}

function addDays(date: Date, amount: number) {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + amount);
  return copy;
}

function completionDatesFromMap(completionMap: Record<string, boolean>) {
  return Object.entries(completionMap)
    .filter(([, done]) => done)
    .map(([key]) => key.split("::")[1])
    .filter((dateKey): dateKey is string => Boolean(dateKey));
}

function calculateCurrentStreak(doneDates: Set<string>, todayKey: string) {
  let count = 0;
  let cursor = todayKey;
  while (doneDates.has(cursor)) {
    count += 1;
    cursor = toDateKey(addDays(fromDateKey(cursor), -1));
  }
  return count;
}

function buildAchievement(params: Omit<Achievement, "unlocked" | "progress" | "unlockedAt" | "persisted"> & { value: number }) {
  const progress = percent(params.value, params.target);
  return {
    id: params.id,
    title: params.title,
    description: params.description,
    group: params.group,
    tier: params.tier,
    icon: params.icon,
    progress,
    target: params.target,
    unlocked: progress >= 100,
    helper: params.helper,
  } satisfies Achievement;
}

export function buildAchievements(input: {
  blocks: TimeBlock[];
  events: CalendarEvent[];
  completionMap: Record<string, boolean>;
  wallet: WalletData;
  hasCompletedOnboarding?: boolean;
  todayKey: string;
}): AchievementResult {
  const { blocks, events, completionMap, wallet, hasCompletedOnboarding = false, todayKey } = input;
  const totalTasks = blocks.reduce((sum, block) => sum + block.tasks.length, 0);
  const completedTasks = blocks.reduce((sum, block) => sum + block.tasks.filter((task) => task.done).length, 0);
  const completedTaskDates = blocks.flatMap((block) => (block.tasks.some((task) => task.done) ? [block.date ?? todayKey] : []));
  const completedCalendarDates = [
    ...events.filter((event) => event.done).map((event) => event.date),
    ...completionDatesFromMap(completionMap),
  ];
  const doneDates = new Set([...completedTaskDates, ...completedCalendarDates]);
  const activeDates = new Set([
    ...blocks.map((block) => block.date ?? todayKey),
    ...events.map((event) => event.date),
    ...wallet.transactions.map((transaction) => transaction.date),
  ]);
  const completedCalendarEvents = events.filter((event) => event.done).length + Object.values(completionMap).filter(Boolean).length;
  const savingsTransactions = wallet.transactions.filter((transaction) => transaction.type === "saving").reduce((sum, transaction) => sum + transaction.amount, 0);
  const savingsAmount = savingsTransactions + wallet.goals.reduce((sum, goal) => sum + goal.current, 0);
  const routineKeys = new Map<string, number>();
  blocks.forEach((block) => routineKeys.set(block.icon, (routineKeys.get(block.icon) ?? 0) + block.tasks.length));
  events.forEach((event) => routineKeys.set(event.activityTypeKey ?? event.iconKey ?? event.color, (routineKeys.get(event.activityTypeKey ?? event.iconKey ?? event.color) ?? 0) + 1));
  const routineCount = Array.from(routineKeys.values()).filter((count) => count >= 3).length;

  const stats: AchievementStats = {
    totalTasks,
    completedTasks,
    totalCalendarEvents: events.length,
    completedCalendarEvents,
    totalWalletTransactions: wallet.transactions.length,
    savingsAmount,
    activeGoals: wallet.goals.length,
    activeDays: activeDates.size,
    streak: calculateCurrentStreak(doneDates, todayKey),
    routineCount,
  };

  const totalCompleted = completedTasks + completedCalendarEvents;
  const achievements: Achievement[] = [
    buildAchievement({ id: "first-check", title: "Primer check", description: "Completaste tu primera actividad.", group: "daily", tier: "bronze", icon: "check", value: totalCompleted, target: 1, helper: "Marcá una tarea o actividad como lista." }),
    buildAchievement({ id: "five-checks", title: "5 checks", description: "Ya empezaste a agarrar ritmo.", group: "daily", tier: "bronze", icon: "sparkles", value: totalCompleted, target: 5, helper: "Completá 5 actividades en total." }),
    buildAchievement({ id: "twenty-checks", title: "Modo constante", description: "20 actividades completadas entre Hoy y Calendario.", group: "daily", tier: "silver", icon: "target", value: totalCompleted, target: 20, helper: "Seguí marcando checks." }),
    buildAchievement({ id: "streak-three", title: "Racha 3 días", description: "Tres días seguidos con al menos un check.", group: "growth", tier: "silver", icon: "flame", value: stats.streak, target: 3, helper: "Completá algo hoy y mañana." }),
    buildAchievement({ id: "streak-seven", title: "Semana prendida", description: "Siete días seguidos cumpliendo algo.", group: "growth", tier: "gold", icon: "flame", value: stats.streak, target: 7, helper: "Mantené la racha durante una semana." }),
    buildAchievement({ id: "welcome-done", title: "Guía completada", description: "Terminaste la bienvenida de Monkey Checks.", group: "growth", tier: "special", icon: "monkey", value: hasCompletedOnboarding ? 1 : 0, target: 1, helper: "Terminá las cards de bienvenida." }),
    buildAchievement({ id: "calendar-first", title: "Planificador", description: "Creaste tu primera actividad en Calendario.", group: "calendar", tier: "bronze", icon: "calendar", value: events.length, target: 1, helper: "Agregá una actividad con hora." }),
    buildAchievement({ id: "calendar-five", title: "Semana organizada", description: "Cinco actividades calendarizadas.", group: "calendar", tier: "silver", icon: "calendar", value: events.length, target: 5, helper: "Planeá tus próximos bloques." }),
    buildAchievement({ id: "calendar-done-five", title: "Agenda cumplida", description: "Cinco actividades del calendario completadas.", group: "calendar", tier: "gold", icon: "trophy", value: completedCalendarEvents, target: 5, helper: "Marcá tus actividades de calendario como listas." }),
    buildAchievement({ id: "routine-builder", title: "Rutina detectada", description: "Repetiste un tipo de actividad varias veces.", group: "growth", tier: "silver", icon: "repeat", value: routineCount, target: 1, helper: "Repetí una actividad 3 veces." }),
    buildAchievement({ id: "wallet-first", title: "Primer movimiento", description: "Registraste tu primer movimiento en Wallet.", group: "wallet", tier: "bronze", icon: "wallet", value: wallet.transactions.length, target: 1, helper: "Agregá ingreso, gasto o ahorro." }),
    buildAchievement({ id: "budget-active", title: "Presupuesto activo", description: "Definiste un límite para cuidar tus gastos.", group: "wallet", tier: "silver", icon: "piggy", value: wallet.budgetLimit > 0 ? 1 : 0, target: 1, helper: "Configurá un presupuesto." }),
    buildAchievement({ id: "goal-active", title: "Meta en marcha", description: "Creaste una meta de ahorro.", group: "wallet", tier: "silver", icon: "target", value: wallet.goals.length, target: 1, helper: "Creá una meta en Wallet." }),
    buildAchievement({ id: "saving-started", title: "Ahorro iniciado", description: "Ya pusiste dinero en ahorros o metas.", group: "wallet", tier: "gold", icon: "piggy", value: savingsAmount, target: 1, helper: "Sumá dinero a una meta o ahorro." }),
  ];

  const unlockedCount = achievements.filter((achievement) => achievement.unlocked).length;
  const nextAchievement = achievements.find((achievement) => !achievement.unlocked) ?? null;
  return { achievements, stats, unlockedCount, totalCount: achievements.length, completion: percent(unlockedCount, achievements.length), nextAchievement };
}

export function mergePersistentAchievementUnlocks(result: AchievementResult, persisted: PersistentAchievementUnlock[]): AchievementResult {
  if (!persisted.length) return result;

  const persistedById = new Map(persisted.map((unlock) => [unlock.achievementId, unlock]));
  const achievements = result.achievements.map((achievement) => {
    const unlock = persistedById.get(achievement.id);
    if (!unlock) return achievement;

    return {
      ...achievement,
      unlocked: true,
      progress: Math.max(achievement.progress, unlock.sourceProgress, 100),
      unlockedAt: unlock.unlockedAt,
      persisted: true,
    } satisfies Achievement;
  });

  const unlockedCount = achievements.filter((achievement) => achievement.unlocked).length;
  const nextAchievement = achievements.find((achievement) => !achievement.unlocked) ?? null;

  return {
    ...result,
    achievements,
    unlockedCount,
    completion: percent(unlockedCount, achievements.length),
    nextAchievement,
  };
}
