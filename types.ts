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

export type CalendarEvent = {
  id: string;
  date: string;
  time: string;
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

export type WalletGoal = {
  id: string;
  title: string;
  target: number;
  current: number;
  icon: string;
};

export type WalletTransaction = {
  id: string;
  type: WalletTransactionType;
  title: string;
  amount: number;
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
