import { createId } from "@/lib/local-storage";
import type {
  WalletBadge,
  WalletCategory,
  WalletColor,
  WalletCurrency,
  WalletData,
  WalletGoal,
  WalletPeriod,
  WalletTransaction,
  WalletTransactionType
} from "@/types";

export type WalletUpdateInput = Partial<Pick<WalletData, "income" | "expenses" | "savings" | "budgetLimit" | "balance" | "tip" | "currency">>;
export type WalletTransactionInput = Omit<WalletTransaction, "id" | "color" | "icon" | "currency"> & { currency?: WalletCurrency; icon?: string };
export type WalletGoalInput = Omit<WalletGoal, "id" | "icon" | "currency"> & { icon?: string; currency?: WalletCurrency };

export const WALLET_DEFAULT_CURRENCY: WalletCurrency = "CRC";

export const walletCurrencyLabels: Record<WalletCurrency, string> = {
  CRC: "Colones",
  USD: "Dólares"
};

export const walletPeriodLabels: Record<WalletPeriod, string> = {
  weekly: "Semana",
  biweekly: "Quincena",
  monthly: "Mes"
};

const categoryMeta: Record<string, { color: WalletColor; icon: string }> = {
  Comida: { color: "orange", icon: "wallet-food" },
  Transporte: { color: "yellow", icon: "wallet-transport" },
  Entretenimiento: { color: "purple", icon: "wallet-fun" },
  Compras: { color: "pink", icon: "wallet-shop" },
  Escuela: { color: "blue", icon: "wallet-study" },
  Mesada: { color: "green", icon: "wallet-income" },
  Trabajo: { color: "green", icon: "wallet-income" },
  Regalo: { color: "green", icon: "wallet-gift" },
  Venta: { color: "green", icon: "wallet-extras" },
  Extra: { color: "blue", icon: "wallet-extras" },
  Bono: { color: "blue", icon: "wallet-extras" },
  Ahorro: { color: "purple", icon: "wallet-savings" },
  Otro: { color: "blue", icon: "wallet-extras" }
};

function getCategoryMeta(category: string, type: WalletTransactionType) {
  if (categoryMeta[category]) return categoryMeta[category];
  if (type === "income") return categoryMeta.Mesada;
  if (type === "extra") return categoryMeta.Extra;
  if (type === "saving") return categoryMeta.Ahorro;
  return categoryMeta.Otro;
}

function toDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function parseDateKey(dateKey?: string | null) {
  if (!dateKey) return new Date();
  const [year, month, day] = dateKey.split("-").map(Number);
  if (!year || !month || !day) return new Date();
  return new Date(year, month - 1, day);
}

function endOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

export function getWalletPeriodRange(period: WalletPeriod, referenceDate = new Date()): { start: string; end: string; label: string } {
  const ref = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), referenceDate.getDate());
  if (period === "weekly") {
    const start = new Date(ref);
    start.setDate(ref.getDate() - 6);
    return { start: toDateKey(start), end: toDateKey(ref), label: "Últimos 7 días" };
  }
  if (period === "biweekly") {
    const firstDay = ref.getDate() <= 14 ? 1 : 15;
    const lastDay = ref.getDate() <= 14 ? 14 : endOfMonth(ref).getDate();
    const start = new Date(ref.getFullYear(), ref.getMonth(), firstDay);
    const end = new Date(ref.getFullYear(), ref.getMonth(), lastDay);
    return { start: toDateKey(start), end: toDateKey(end), label: firstDay === 1 ? "1 al 14" : `15 al ${lastDay}` };
  }
  const start = new Date(ref.getFullYear(), ref.getMonth(), 1);
  const end = endOfMonth(ref);
  return { start: toDateKey(start), end: toDateKey(end), label: new Intl.DateTimeFormat("es-CR", { month: "long", year: "numeric" }).format(ref) };
}

export function isTransactionInPeriod(transaction: WalletTransaction, period: WalletPeriod, referenceDate = new Date()) {
  const range = getWalletPeriodRange(period, referenceDate);
  const date = transaction.date;
  return date >= range.start && date <= range.end;
}

function buildCategories(transactions: WalletTransaction[], period: WalletPeriod): WalletCategory[] {
  const expenses = transactions.filter((tx) => tx.type === "expense" && isTransactionInPeriod(tx, period));
  const total = expenses.reduce((sum, tx) => sum + tx.amount, 0);
  const grouped = expenses.reduce<Record<string, WalletCategory>>((acc, tx) => {
    const key = tx.category || "Otro";
    const meta = getCategoryMeta(key, "expense");
    if (!acc[key]) acc[key] = { id: key.toLowerCase().replace(/\s+/g, "-"), name: key, amount: 0, percent: 0, color: meta.color, icon: tx.icon || meta.icon };
    acc[key].amount += tx.amount;
    return acc;
  }, {});

  return Object.values(grouped)
    .map((category) => ({ ...category, percent: total > 0 ? Math.round((category.amount / total) * 100) : 0 }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);
}

function buildBadges(income: number, expenses: number, savings: number, budgetLimit: number, transactions: WalletTransaction[]): WalletBadge[] {
  const badges: WalletBadge[] = [];
  const savingRate = income > 0 ? (savings / income) * 100 : 0;
  const budgetRate = budgetLimit > 0 ? (expenses / budgetLimit) * 100 : 0;

  if (savingRate >= 20) badges.push({ id: "good-saving", label: "Buen ahorro", tone: "success", icon: "🌱" });
  if (budgetRate <= 65) badges.push({ id: "stable-week", label: "Periodo estable", tone: "success", icon: "🛡️" });
  if (budgetRate > 80) badges.push({ id: "high-expense", label: "Cuidado con gastos", tone: "warning", icon: "⚠️" });
  if (transactions.some((tx) => tx.type === "saving")) badges.push({ id: "goal-active", label: "Meta activa", tone: "info", icon: "🎯" });
  if (badges.length === 0) badges.push({ id: "start", label: "Empezá hoy", tone: "info", icon: "✨" });

  return badges.slice(0, 4);
}

function buildTip(income: number, expenses: number, savings: number, budgetLimit: number, categories: WalletCategory[]) {
  const savingRate = income > 0 ? Math.round((savings / income) * 100) : 0;
  const budgetRate = budgetLimit > 0 ? Math.round((expenses / budgetLimit) * 100) : 0;
  const topCategory = categories[0];

  if (budgetRate >= 85) return `Vas usando ${budgetRate}% de tu presupuesto. Revisá ${topCategory?.name || "tus gastos"} para cerrar mejor el periodo.`;
  if (savingRate >= 20) return `¡Vas muy bien! Ya guardaste cerca del ${savingRate}% de tus ingresos. Seguí así para cumplir tu meta.`;
  if (topCategory) return `Tu gasto principal es ${topCategory.name}. Podés bajarlo un poco y mover esa diferencia a ahorro.`;
  return "Agregá tus ingresos y gastos para recibir consejos inteligentes según tus hábitos.";
}

function normalizeTransaction(tx: WalletTransaction, currency: WalletCurrency): WalletTransaction {
  const meta = getCategoryMeta(tx.category, tx.type);
  return {
    ...tx,
    amount: Math.max(0, Number(tx.amount) || 0),
    currency: tx.currency || currency,
    date: tx.date || toDateKey(new Date()),
    period: tx.period || "monthly",
    color: tx.color || meta.color,
    icon: tx.icon || meta.icon,
  };
}

export function normalizeWallet(data: WalletData): WalletData {
  const currency: WalletCurrency = data.currency || WALLET_DEFAULT_CURRENCY;
  const period: WalletPeriod = data.period || "monthly";
  const transactions = Array.isArray(data.transactions) ? data.transactions.map((tx) => normalizeTransaction(tx, currency)) : [];
  const periodTransactions = transactions.filter((tx) => isTransactionInPeriod(tx, period));
  const income = periodTransactions.filter((tx) => tx.type === "income").reduce((sum, tx) => sum + tx.amount, 0);
  const extras = periodTransactions.filter((tx) => tx.type === "extra").reduce((sum, tx) => sum + tx.amount, 0);
  const expenses = periodTransactions.filter((tx) => tx.type === "expense").reduce((sum, tx) => sum + tx.amount, 0);
  const savings = periodTransactions.filter((tx) => tx.type === "saving").reduce((sum, tx) => sum + tx.amount, 0);
  const balance = Math.max(0, income + extras - expenses - savings);
  const budgetLimit = Number.isFinite(data.budgetLimit) && data.budgetLimit > 0 ? data.budgetLimit : 1;
  const categories = buildCategories(transactions, period);
  const safeCategories = categories.length > 0 ? categories : data.categories.map((category) => ({ ...category, amount: Number.isFinite(category.amount) ? category.amount : 0, percent: Math.max(0, Math.min(100, Number.isFinite(category.percent) ? category.percent : 0)) }));
  const goals = data.goals.map((goal) => ({ ...goal, currency: goal.currency || currency, current: Math.max(0, Number.isFinite(goal.current) ? goal.current : 0), target: Math.max(1, Number.isFinite(goal.target) ? goal.target : 1), targetDate: goal.targetDate || null }));
  const badges = buildBadges(income + extras, expenses, savings, budgetLimit, periodTransactions);

  return {
    ...data,
    period,
    currency,
    income,
    extras,
    expenses,
    savings,
    balance,
    budgetLimit,
    categories: safeCategories,
    goals,
    transactions,
    badges,
    tip: buildTip(income + extras, expenses, savings, budgetLimit, safeCategories)
  };
}

export function updateWalletData(data: WalletData, input: WalletUpdateInput): WalletData {
  return normalizeWallet({ ...data, ...input });
}

export function changeWalletPeriod(data: WalletData, period: WalletPeriod): WalletData {
  return normalizeWallet({ ...data, period });
}

export function addWalletTransaction(data: WalletData, input: WalletTransactionInput): WalletData {
  const meta = getCategoryMeta(input.category, input.type);
  const transaction: WalletTransaction = {
    ...input,
    id: createId("wallet-tx"),
    amount: Math.max(0, Number(input.amount) || 0),
    currency: input.currency || data.currency || WALLET_DEFAULT_CURRENCY,
    color: meta.color,
    icon: input.icon || meta.icon
  };
  return normalizeWallet({ ...data, transactions: [transaction, ...(data.transactions || [])] });
}

export function deleteWalletTransaction(data: WalletData, transactionId: string): WalletData {
  return normalizeWallet({ ...data, transactions: (data.transactions || []).filter((tx) => tx.id !== transactionId) });
}

export function addWalletGoal(data: WalletData, input: WalletGoalInput): WalletData {
  const goal: WalletGoal = {
    id: createId("wallet-goal"),
    title: input.title.trim(),
    target: Math.max(1, Number(input.target) || 1),
    current: Math.max(0, Number(input.current) || 0),
    currency: input.currency || data.currency || WALLET_DEFAULT_CURRENCY,
    targetDate: input.targetDate || null,
    icon: input.icon || "wallet-savings"
  };
  return normalizeWallet({ ...data, goals: [goal, ...data.goals] });
}
