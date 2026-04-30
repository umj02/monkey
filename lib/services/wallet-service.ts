import type { WalletData, WalletPeriod } from "@/types";

export type WalletUpdateInput = Partial<Pick<WalletData, "income" | "expenses" | "savings" | "budgetLimit" | "balance" | "tip">>;

export function normalizeWallet(data: WalletData): WalletData {
  const income = Number.isFinite(data.income) ? data.income : 0;
  const expenses = Number.isFinite(data.expenses) ? data.expenses : 0;
  const savings = Number.isFinite(data.savings) ? data.savings : Math.max(income - expenses, 0);
  const balance = Number.isFinite(data.balance) ? data.balance : Math.max(income - expenses, 0);
  const budgetLimit = Number.isFinite(data.budgetLimit) && data.budgetLimit > 0 ? data.budgetLimit : 1;

  return {
    ...data,
    income,
    expenses,
    savings,
    balance,
    budgetLimit,
    categories: data.categories.map((category) => ({
      ...category,
      amount: Number.isFinite(category.amount) ? category.amount : 0,
      percent: Math.max(0, Math.min(100, Number.isFinite(category.percent) ? category.percent : 0))
    })),
    goals: data.goals.map((goal) => ({
      ...goal,
      current: Math.max(0, Number.isFinite(goal.current) ? goal.current : 0),
      target: Math.max(1, Number.isFinite(goal.target) ? goal.target : 1)
    }))
  };
}

export function updateWalletData(data: WalletData, input: WalletUpdateInput): WalletData {
  return normalizeWallet({ ...data, ...input });
}

export function changeWalletPeriod(data: WalletData, period: WalletPeriod): WalletData {
  return { ...data, period };
}
