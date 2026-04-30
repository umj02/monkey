import { createId } from "@/lib/local-storage";
import type { WalletBadge, WalletCategory, WalletColor, WalletData, WalletGoal, WalletPeriod, WalletTransaction, WalletTransactionType } from "@/types";

export type WalletUpdateInput = Partial<Pick<WalletData, "income" | "expenses" | "savings" | "budgetLimit" | "balance" | "tip">>;
export type WalletTransactionInput = Omit<WalletTransaction, "id" | "color" | "icon">;
export type WalletGoalInput = Omit<WalletGoal, "id" | "icon"> & { icon?: string };

const categoryMeta: Record<string, { color: WalletColor; icon: string }> = {
  Comida: { color: "orange", icon: "🍕" },
  Transporte: { color: "yellow", icon: "🚌" },
  Entretenimiento: { color: "purple", icon: "🎮" },
  Compras: { color: "pink", icon: "🛍️" },
  Escuela: { color: "blue", icon: "📚" },
  Mesada: { color: "green", icon: "💵" },
  Trabajo: { color: "green", icon: "💼" },
  Regalo: { color: "green", icon: "🎁" },
  Venta: { color: "green", icon: "🧾" },
  Ahorro: { color: "purple", icon: "🌱" },
  Otro: { color: "blue", icon: "✨" }
};

function getCategoryMeta(category: string, type: WalletTransactionType) {
  if (categoryMeta[category]) return categoryMeta[category];
  if (type === "income") return categoryMeta.Mesada;
  if (type === "saving") return categoryMeta.Ahorro;
  return categoryMeta.Otro;
}

function samePeriod(transaction: WalletTransaction, period: WalletPeriod) {
  return transaction.period === period;
}

function buildCategories(transactions: WalletTransaction[], period: WalletPeriod): WalletCategory[] {
  const expenses = transactions.filter((tx) => tx.type === "expense" && samePeriod(tx, period));
  const total = expenses.reduce((sum, tx) => sum + tx.amount, 0);
  const grouped = expenses.reduce<Record<string, WalletCategory>>((acc, tx) => {
    const key = tx.category || "Otro";
    const meta = getCategoryMeta(key, "expense");
    if (!acc[key]) acc[key] = { id: key.toLowerCase().replace(/\s+/g, "-"), name: key, amount: 0, percent: 0, color: meta.color, icon: meta.icon };
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
  if (budgetRate <= 65) badges.push({ id: "stable-week", label: "Semana estable", tone: "success", icon: "🛡️" });
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

export function normalizeWallet(data: WalletData): WalletData {
  const transactions = Array.isArray(data.transactions) ? data.transactions : [];
  const income = transactions.filter((tx) => tx.type === "income" && samePeriod(tx, data.period)).reduce((sum, tx) => sum + tx.amount, 0) || (Number.isFinite(data.income) ? data.income : 0);
  const expenses = transactions.filter((tx) => tx.type === "expense" && samePeriod(tx, data.period)).reduce((sum, tx) => sum + tx.amount, 0) || (Number.isFinite(data.expenses) ? data.expenses : 0);
  const savings = transactions.filter((tx) => tx.type === "saving" && samePeriod(tx, data.period)).reduce((sum, tx) => sum + tx.amount, 0) || (Number.isFinite(data.savings) ? data.savings : Math.max(income - expenses, 0));
  const balance = Math.max(0, income - expenses - savings);
  const budgetLimit = Number.isFinite(data.budgetLimit) && data.budgetLimit > 0 ? data.budgetLimit : 1;
  const categories = buildCategories(transactions, data.period);
  const safeCategories = categories.length > 0 ? categories : data.categories.map((category) => ({ ...category, amount: Number.isFinite(category.amount) ? category.amount : 0, percent: Math.max(0, Math.min(100, Number.isFinite(category.percent) ? category.percent : 0)) }));
  const goals = data.goals.map((goal) => ({ ...goal, current: Math.max(0, Number.isFinite(goal.current) ? goal.current : 0), target: Math.max(1, Number.isFinite(goal.target) ? goal.target : 1) }));
  const badges = buildBadges(income, expenses, savings, budgetLimit, transactions);

  return {
    ...data,
    income,
    expenses,
    savings,
    balance,
    budgetLimit,
    categories: safeCategories,
    goals,
    transactions,
    badges,
    tip: buildTip(income, expenses, savings, budgetLimit, safeCategories)
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
    color: meta.color,
    icon: meta.icon
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
    icon: input.icon || "🎯"
  };
  return normalizeWallet({ ...data, goals: [goal, ...data.goals] });
}
