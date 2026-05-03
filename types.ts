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
  blockId?: string | null;
  blockTitle?: string | null;
  blockTime?: string | null;
  icon?: string | null;
};

export type CalendarEvent = {
  id: string;
  date: string;
  time: string;
  endTime?: string | null;
  title: string;
  color: "yellow" | "blue" | "green" | "pink" | "purple" | "orange";
};

export type Profile = {
  name: string;
  email: string;
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
export type WalletTransactionType = "income" | "expense" | "saving";
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
  date: string;
  period: WalletPeriod;
  color: WalletColor;
  icon: string;
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
  budgetLimit: number;
  categories: WalletCategory[];
  goals: WalletGoal[];
  transactions: WalletTransaction[];
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
