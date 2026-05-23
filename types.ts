export type TaskColor = "purple" | "green" | "orange" | "blue" | "pink" | "yellow";

export type Task = {
  id: string;
  title: string;
  done: boolean;
  reminderAt?: string | null;
};

export type TimeBlock = {
  id: string;
  date?: string;
  time: string;
  title: string;
  color: TaskColor;
  icon: string;
  tasks: Task[];
};

export type Note = {
  id: string;
  title: string;
  body: string;
  color: "yellow" | "pink" | "green" | "blue" | "purple";
  createdAt: string;
};

export type Reminder = {
  id: string;
  title: string;
  time: string;
  repeat: "daily" | "weekly" | "custom";
  enabled: boolean;
  taskId?: string | null;
  calendarEventId?: string | null;
};

export type ReminderStatus = "today" | "upcoming" | "overdue" | "inactive";

export type ReminderPanelItem = {
  id: string;
  source: "task" | "standalone";
  title: string;
  time: string;
  reminderAt?: string | null;
  enabled: boolean;
  status: ReminderStatus;
  dateLabel: string;
  repeat?: Reminder["repeat"];
  reminderId?: string | null;
  taskId?: string | null;
  calendarEventId?: string | null;
  blockId?: string | null;
  blockTitle?: string | null;
  blockTime?: string | null;
  icon?: string | null;
};

export type CalendarRecurrenceType = "none" | "daily" | "custom_days";

export type CalendarEvent = {
  id: string;
  date: string;
  time: string;
  endTime?: string | null;
  title: string;
  color: "yellow" | "blue" | "green" | "pink" | "purple" | "orange";
  iconKey?: string | null;
  activityTypeKey?: string | null;
  recurrenceType?: CalendarRecurrenceType;
  recurrenceDays?: number[] | null;
  recurrenceUntil?: string | null;
  recurrenceGroupId?: string | null;
  done?: boolean;
  parentEventId?: string | null;
  occurrenceDate?: string | null;
  isOccurrenceOverride?: boolean;
  source?: "normal" | "personal_challenge" | "guardian_challenge";
  challengeId?: string | null;
  challengeTaskId?: string | null;
  isLocked?: boolean;
  verificationStatus?: ChallengeVerificationStatus | null;
  rewardBananas?: number | null;
};

export type CalendarOccurrenceOverride = {
  id: string;
  calendarEventId: string;
  occurrenceDate: string;
  title?: string | null;
  time?: string | null;
  endTime?: string | null;
  color?: CalendarEvent["color"] | null;
  iconKey?: string | null;
  activityTypeKey?: string | null;
  reminderAt?: string | null;
  isCancelled?: boolean;
};


export type CalendarEventCompletion = {
  id: string;
  calendarEventId: string;
  occurrenceDate: string;
  done: boolean;
};

export type Profile = {
  name: string;
  email: string;
  hasCompletedOnboarding: boolean;
};

export type Settings = {
  darkMode: boolean;
  sounds: boolean;
  sync: boolean;
  theme: "colorful" | "soft";
};

export type AuthSession = {
  userId: string;
  email: string;
  name: string;
  provider: "email" | "google" | "apple";
  signedInAt: string;
};

export type WalletPeriod = "weekly" | "biweekly" | "monthly";
export type WalletCurrency = "CRC" | "USD";
export type WalletTransactionType = "income" | "expense" | "saving" | "extra";
export type WalletExpenseKind = "variable" | "planned";
export type WalletPlannedExpenseStatus = "pending" | "paid" | "overdue";
export type WalletColor = "green" | "orange" | "purple" | "pink" | "blue" | "yellow";

export type WalletCategory = {
  id: string;
  name: string;
  amount: number;
  percent: number;
  color: WalletColor;
  icon: string;
};

export type WalletBudget = {
  id: string;
  period: WalletPeriod;
  limit: number;
  currency: WalletCurrency;
};

export type WalletGoal = {
  id: string;
  title: string;
  target: number;
  current: number;
  currency?: WalletCurrency;
  targetDate?: string | null;
  icon: string;
};

export type WalletTransaction = {
  id: string;
  type: WalletTransactionType;
  title: string;
  amount: number;
  currency: WalletCurrency;
  category: string;
  categoryKey?: string | null;
  date: string;
  period: WalletPeriod;
  color: WalletColor;
  icon: string;
  expenseKind?: WalletExpenseKind;
  plannedExpenseId?: string | null;
  note?: string | null;
};

export type WalletPlannedExpense = {
  id: string;
  name: string;
  category: string;
  categoryKey?: string | null;
  amount: number;
  currency: WalletCurrency;
  dueDate: string;
  frequency: "weekly" | "biweekly" | "monthly" | "yearly" | "one_time";
  status: WalletPlannedExpenseStatus;
  paidAt?: string | null;
  icon: string;
  notes?: string | null;
  enabled?: boolean;
};

export type WalletBadge = {
  id: string;
  label: string;
  tone: "success" | "warning" | "info";
  icon: string;
};

export type WalletData = {
  period: WalletPeriod;
  currency: WalletCurrency;
  balance: number;
  income: number;
  expenses: number;
  savings: number;
  extras?: number;
  budgetLimit: number;
  categories: WalletCategory[];
  goals: WalletGoal[];
  transactions: WalletTransaction[];
  plannedExpenses: WalletPlannedExpense[];
  badges: WalletBadge[];
  tip: string;
};

export type WalletDbTransaction = Omit<WalletTransaction, "color" | "icon"> & {
  userId: string;
  createdAt?: string;
  updatedAt?: string;
};

export type WalletDbBudget = {
  id: string;
  userId: string;
  period: WalletPeriod;
  limit: number;
  currency: WalletCurrency;
  createdAt?: string;
  updatedAt?: string;
};

export type WalletDbGoal = WalletGoal & {
  userId: string;
  createdAt?: string;
  updatedAt?: string;
};

export type WalletDbPlannedExpense = WalletPlannedExpense & {
  userId: string;
  createdAt?: string;
  updatedAt?: string;
};


export type ChallengeOrigin = "personal" | "guardian";
export type ChallengeFrequency = "daily" | "weekly" | "monthly";
export type ChallengeStatus = "active" | "completed" | "cancelled" | "expired";
export type ChallengeTaskStatus = "pending" | "checked" | "verified" | "rejected" | "missed";
export type ChallengeVerificationStatus = "none" | "self_checked" | "guardian_pending" | "guardian_verified" | "guardian_rejected";

export type ChallengeTask = {
  id: string;
  challengeId: string;
  calendarEventId?: string | null;
  title: string;
  iconKey: string;
  activityTypeKey: string;
  scheduledDate: string;
  scheduledTime: string;
  status: ChallengeTaskStatus;
  rewardBananas: number;
  checkedAt?: string | null;
  verifiedAt?: string | null;
};

export type Challenge = {
  id: string;
  origin: ChallengeOrigin;
  title: string;
  description: string;
  iconKey: string;
  imagePath?: string | null;
  activityTypeKey: string;
  frequency: ChallengeFrequency;
  status: ChallengeStatus;
  startDate: string;
  endDate: string;
  rewardBananas: number;
  requiresGuardianVerification: boolean;
  claimedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  tasks: ChallengeTask[];
};

export type BananaLedgerEntry = {
  id: string;
  userId?: string | null;
  sourceType: "challenge" | "achievement" | "manual_adjustment";
  sourceId: string;
  amount: number;
  reason: string;
  createdAt: string;
};

export type ChallengeSummary = {
  active: number;
  completed: number;
  pendingTasks: number;
  missedTasks: number;
  bananasEarned: number;
  bananasAvailable: number;
  bananasLost: number;
};
