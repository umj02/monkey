import { createId } from "@/lib/local-storage";
import type {
  WalletBadge,
  WalletCategory,
  WalletColor,
  WalletCurrency,
  WalletData,
  WalletGoal,
  WalletPeriod,
  WalletPlannedExpense,
  WalletPlannedExpenseStatus,
  WalletTransaction,
  WalletTransactionType
} from "@/types";

export type WalletUpdateInput = Partial<Pick<WalletData, "income" | "expenses" | "savings" | "budgetLimit" | "balance" | "tip" | "currency">>;
export type WalletTransactionInput = Omit<WalletTransaction, "id" | "color" | "icon" | "currency"> & { currency?: WalletCurrency; icon?: string };
export type WalletPlannedExpenseInput = Omit<WalletPlannedExpense, "id" | "status" | "currency" | "icon"> & { currency?: WalletCurrency; icon?: string; status?: WalletPlannedExpenseStatus };
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

export const VARIABLE_EXPENSE_CATEGORIES = ["Comida", "Transporte", "Entretenimiento", "Compras", "Escuela", "Café", "Uber", "Pagos", "Alquiler", "Cuidado personal", "Buses", "Vehículo"];
export const PLANNED_EXPENSE_CATEGORIES = ["Préstamo", "Casa", "Colegiatura", "Hipoteca", "Vehículo", "Salud", "Pases", "Peajes", "Remodelación", "Celular", "Internet", "Suscripción", "Tarjeta de crédito", "Gastos escolares", "Supermercado", "Ropa y zapatos", "Pólizas / seguros", "Marchamo", "Otro"];

const categoryMeta: Record<string, { color: WalletColor; icon: string }> = {
  Comida: { color: "orange", icon: "wallet-comida" },
  Transporte: { color: "yellow", icon: "wallet-transporte" },
  Entretenimiento: { color: "purple", icon: "wallet-entretenimiento" },
  Compras: { color: "pink", icon: "wallet-compras" },
  Escuela: { color: "blue", icon: "wallet-escuela" },
  Café: { color: "orange", icon: "wallet-cafe" },
  Uber: { color: "yellow", icon: "wallet-uber" },
  Pagos: { color: "green", icon: "wallet-pagos" },
  Alquiler: { color: "blue", icon: "wallet-alquiler" },
  "Cuidado personal": { color: "green", icon: "wallet-cuidado-personal" },
  Buses: { color: "yellow", icon: "wallet-buses" },
  Vehículo: { color: "yellow", icon: "wallet-vehiculo" },
  Luz: { color: "yellow", icon: "wallet-luz" },
  Agua: { color: "blue", icon: "wallet-agua" },
  Teléfono: { color: "blue", icon: "wallet-telefono" },
  Internet: { color: "blue", icon: "wallet-internet" },
  Combustible: { color: "yellow", icon: "wallet-combustible" },
  Prestamos: { color: "blue", icon: "wallet-prestamos" },
  Medicina: { color: "green", icon: "wallet-medicina" },
  Dentista: { color: "green", icon: "wallet-dentista" },
  Optica: { color: "green", icon: "wallet-optica" },
  "Tarjetas de Crédito": { color: "pink", icon: "wallet-tarjetas-credito" },
  Viaje: { color: "purple", icon: "wallet-viaje" },
  "Gasto Hormiga": { color: "orange", icon: "wallet-gasto-hormiga" },
  Préstamo: { color: "blue", icon: "wallet-prestamos" },
  Casa: { color: "blue", icon: "wallet-alquiler" },
  Colegiatura: { color: "blue", icon: "wallet-escuela" },
  Hipoteca: { color: "blue", icon: "wallet-alquiler" },
  Salud: { color: "green", icon: "wallet-medicina" },
  Pases: { color: "yellow", icon: "wallet-transporte" },
  Peajes: { color: "yellow", icon: "wallet-transporte" },
  Remodelación: { color: "orange", icon: "wallet-pagos" },
  Celular: { color: "blue", icon: "wallet-telefono" },
  Suscripción: { color: "purple", icon: "wallet-entretenimiento" },
  "Tarjeta de crédito": { color: "pink", icon: "wallet-tarjetas-credito" },
  "Gastos escolares": { color: "blue", icon: "wallet-escuela" },
  Supermercado: { color: "orange", icon: "wallet-comida" },
  "Ropa y zapatos": { color: "pink", icon: "wallet-compras" },
  "Pólizas / seguros": { color: "green", icon: "wallet-income" },
  Marchamo: { color: "yellow", icon: "wallet-vehiculo" },
  Mesada: { color: "green", icon: "wallet-income" },
  Trabajo: { color: "green", icon: "wallet-income" },
  Regalo: { color: "green", icon: "wallet-regalo" },
  Venta: { color: "green", icon: "wallet-extras" },
  Extra: { color: "blue", icon: "wallet-extras" },
  Bono: { color: "blue", icon: "wallet-extras" },
  Ahorro: { color: "purple", icon: "wallet-savings" },
  Otro: { color: "blue", icon: "wallet-otro" }
};

export function getWalletTransactionMeta(category: string, type: WalletTransactionType) {
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
  const expenses = transactions.filter((tx) => tx.type === "expense" && (tx.expenseKind || "variable") === "variable" && isTransactionInPeriod(tx, period));
  const total = expenses.reduce((sum, tx) => sum + tx.amount, 0);
  const grouped = expenses.reduce<Record<string, WalletCategory>>((acc, tx) => {
    const key = tx.category || "Otro";
    const meta = getWalletTransactionMeta(key, "expense");
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
  const meta = getWalletTransactionMeta(tx.category, tx.type);
  return {
    ...tx,
    amount: Math.max(0, Number(tx.amount) || 0),
    currency: tx.currency || currency,
    date: tx.date || toDateKey(new Date()),
    period: tx.period || "monthly",
    color: tx.color || meta.color,
    icon: tx.icon || meta.icon,
    expenseKind: tx.type === "expense" ? (tx.expenseKind || "variable") : undefined,
    plannedExpenseId: tx.plannedExpenseId || null,
    note: tx.note || null,
  };
}


function buildDateKey(year: number, monthIndex: number, day: number) {
  const last = new Date(year, monthIndex + 1, 0).getDate();
  return toDateKey(new Date(year, monthIndex, Math.max(1, Math.min(day, last))));
}

function datesBetween(startKey: string, endKey: string) {
  const dates: string[] = [];
  const cursor = parseDateKey(startKey);
  const end = parseDateKey(endKey);
  while (cursor <= end) {
    dates.push(toDateKey(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return dates;
}

export function getPlannedExpenseDueDates(expense: WalletPlannedExpense, period: WalletPeriod, referenceDate = new Date()): string[] {
  const range = getWalletPeriodRange(period, referenceDate);
  const base = parseDateKey(expense.dueDate);
  const baseDay = base.getDate();
  const rangeStart = parseDateKey(range.start);
  const candidates = new Set<string>();

  if (expense.frequency === "one_time") candidates.add(expense.dueDate);

  if (expense.frequency === "monthly") {
    candidates.add(buildDateKey(rangeStart.getFullYear(), rangeStart.getMonth(), baseDay));
  }

  if (expense.frequency === "biweekly") {
    const firstHalfDay = baseDay <= 14 ? baseDay : Math.max(1, baseDay - 15);
    const secondHalfDay = Math.min(firstHalfDay + 15, new Date(rangeStart.getFullYear(), rangeStart.getMonth() + 1, 0).getDate());
    candidates.add(buildDateKey(rangeStart.getFullYear(), rangeStart.getMonth(), firstHalfDay));
    candidates.add(buildDateKey(rangeStart.getFullYear(), rangeStart.getMonth(), secondHalfDay));
  }

  if (expense.frequency === "weekly") {
    const targetDay = base.getDay();
    for (const key of datesBetween(range.start, range.end)) {
      if (parseDateKey(key).getDay() === targetDay) candidates.add(key);
    }
  }

  if (expense.frequency === "yearly") {
    candidates.add(buildDateKey(rangeStart.getFullYear(), base.getMonth(), baseDay));
  }

  return [...candidates].filter((date) => date >= range.start && date <= range.end).sort();
}

export function getPlannedExpenseDueLabel(expense: WalletPlannedExpense, period: WalletPeriod, referenceDate = new Date()) {
  const dates = getPlannedExpenseDueDates(expense, period, referenceDate);
  if (!dates.length) return expense.dueDate;
  const formatter = new Intl.DateTimeFormat("es-CR", { day: "2-digit", month: "short" });
  return dates.map((date) => formatter.format(parseDateKey(date))).join(" y ");
}

export function isPlannedExpenseInPeriod(expense: WalletPlannedExpense, period: WalletPeriod, referenceDate = new Date()) {
  return getPlannedExpenseDueDates(expense, period, referenceDate).length > 0;
}

export function getPlannedExpenseStatusForPeriod(expense: WalletPlannedExpense, period: WalletPeriod, transactions: WalletTransaction[] = [], referenceDate = new Date()): WalletPlannedExpenseStatus {
  const dueDates = getPlannedExpenseDueDates(expense, period, referenceDate);
  if (!dueDates.length) return "pending";
  const range = getWalletPeriodRange(period, referenceDate);
  const today = toDateKey(referenceDate);
  const paymentsInRange = transactions.filter((tx) => tx.type === "expense" && tx.expenseKind === "planned" && tx.plannedExpenseId === expense.id && tx.date >= range.start && tx.date <= range.end);
  if (paymentsInRange.length >= dueDates.length) return "paid";
  const dueDatesUntilToday = dueDates.filter((date) => date < today || date === today);
  if (dueDatesUntilToday.length > paymentsInRange.length) return "overdue";
  return "pending";
}

export function getPlannedExpenseStatus(expense: WalletPlannedExpense, referenceDate = new Date()): WalletPlannedExpenseStatus {
  if (expense.frequency === "one_time" && (expense.status === "paid" || expense.paidAt)) return "paid";
  const today = toDateKey(referenceDate);
  if (expense.dueDate < today && expense.frequency === "one_time") return "overdue";
  return "pending";
}

function normalizePlannedExpense(expense: WalletPlannedExpense, currency: WalletCurrency): WalletPlannedExpense {
  const category = PLANNED_EXPENSE_CATEGORIES.includes(expense.category) ? expense.category : "Otro";
  const meta = getWalletTransactionMeta(category, "expense");
  const normalized: WalletPlannedExpense = {
    ...expense,
    name: (expense.name || "Gasto planificado").trim(),
    category,
    amount: Math.max(0, Number(expense.amount) || 0),
    currency: expense.currency || currency,
    dueDate: expense.dueDate || toDateKey(new Date()),
    frequency: expense.frequency || "monthly",
    paidAt: expense.paidAt || null,
    icon: expense.icon || meta.icon,
    notes: expense.notes || null,
    enabled: expense.enabled !== false,
    status: expense.status || "pending",
  };
  return { ...normalized, status: getPlannedExpenseStatus(normalized) };
}

export function normalizeWallet(data: WalletData): WalletData {
  const currency: WalletCurrency = data.currency || WALLET_DEFAULT_CURRENCY;
  const period: WalletPeriod = data.period || "monthly";
  const transactions = Array.isArray(data.transactions) ? data.transactions.map((tx) => normalizeTransaction(tx, currency)) : [];
  const plannedExpenses = Array.isArray(data.plannedExpenses) ? data.plannedExpenses.map((expense) => normalizePlannedExpense(expense, currency)) : [];
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
    plannedExpenses,
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
  const meta = getWalletTransactionMeta(input.category, input.type);
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


export function addWalletPlannedExpense(data: WalletData, input: WalletPlannedExpenseInput): WalletData {
  const meta = getWalletTransactionMeta(input.category, "expense");
  const plannedExpense: WalletPlannedExpense = {
    ...input,
    id: createId("wallet-plan"),
    name: input.name.trim(),
    amount: Math.max(0, Number(input.amount) || 0),
    currency: input.currency || data.currency || WALLET_DEFAULT_CURRENCY,
    status: input.status || "pending",
    icon: input.icon || meta.icon,
    paidAt: input.paidAt || null,
    notes: input.notes || null,
    enabled: input.enabled !== false,
  };
  return normalizeWallet({ ...data, plannedExpenses: [plannedExpense, ...(data.plannedExpenses || [])] });
}

export function updateWalletPlannedExpense(data: WalletData, expense: WalletPlannedExpense): WalletData {
  return normalizeWallet({
    ...data,
    plannedExpenses: (data.plannedExpenses || []).map((item) => item.id === expense.id ? expense : item),
  });
}

export function deleteWalletPlannedExpense(data: WalletData, expenseId: string): WalletData {
  return normalizeWallet({ ...data, plannedExpenses: (data.plannedExpenses || []).filter((item) => item.id !== expenseId) });
}

export function markWalletPlannedExpensePaid(data: WalletData, expenseId: string, paidDate = toDateKey(new Date())): { wallet: WalletData; transaction?: WalletTransaction; expense?: WalletPlannedExpense } {
  const existing = (data.plannedExpenses || []).find((expense) => expense.id === expenseId);
  if (!existing) return { wallet: normalizeWallet(data) };
  const paidExpense: WalletPlannedExpense = { ...existing, status: existing.frequency === "one_time" ? "paid" : "pending", paidAt: paidDate };
  const meta = getWalletTransactionMeta(paidExpense.category, "expense");
  const transaction: WalletTransaction = {
    id: createId("wallet-tx"),
    type: "expense",
    title: paidExpense.name,
    amount: paidExpense.amount,
    currency: paidExpense.currency || data.currency || WALLET_DEFAULT_CURRENCY,
    category: paidExpense.category,
    date: paidDate,
    period: data.period || "monthly",
    color: meta.color,
    icon: paidExpense.icon || meta.icon,
    expenseKind: "planned",
    plannedExpenseId: paidExpense.id,
    note: paidExpense.notes || null,
  };
  return {
    wallet: normalizeWallet({
      ...data,
      plannedExpenses: (data.plannedExpenses || []).map((item) => item.id === expenseId ? paidExpense : item),
      transactions: [transaction, ...(data.transactions || [])],
    }),
    transaction,
    expense: paidExpense,
  };
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
  return normalizeWallet({ ...data, goals: [goal, ...(data.goals || []).slice(0, 2)] });
}

export function updateWalletGoalAmount(data: WalletData, goalId: string, nextCurrent: number): WalletData {
  return normalizeWallet({
    ...data,
    goals: (data.goals || []).map((goal) => (
      goal.id === goalId
        ? { ...goal, current: Math.max(0, Math.min(Number(goal.target) || 1, Number(nextCurrent) || 0)) }
        : goal
    )),
  });
}
