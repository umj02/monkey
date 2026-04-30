import type { WalletCurrency, WalletDbBudget, WalletDbGoal, WalletDbTransaction, WalletPeriod } from "@/types";

export type WalletPeriodQuery = {
  userId: string;
  period: WalletPeriod;
  currency?: WalletCurrency;
};

export type WalletRepository = {
  listTransactions(query: WalletPeriodQuery): Promise<WalletDbTransaction[]>;
  createTransaction(input: Omit<WalletDbTransaction, "id" | "createdAt" | "updatedAt">): Promise<WalletDbTransaction>;
  deleteTransaction(userId: string, transactionId: string): Promise<void>;
  getBudget(query: WalletPeriodQuery): Promise<WalletDbBudget | null>;
  upsertBudget(input: Omit<WalletDbBudget, "id" | "createdAt" | "updatedAt">): Promise<WalletDbBudget>;
  listGoals(userId: string, currency?: WalletCurrency): Promise<WalletDbGoal[]>;
  createGoal(input: Omit<WalletDbGoal, "id" | "createdAt" | "updatedAt">): Promise<WalletDbGoal>;
  updateGoal(input: Pick<WalletDbGoal, "id" | "userId"> & Partial<WalletDbGoal>): Promise<WalletDbGoal>;
};

// v2.4.6 keeps localStorage as the active data source.
// v2.5 should implement this contract with Supabase and keep the useWallet hook API stable.
