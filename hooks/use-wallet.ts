"use client";

import { useEffect, useState } from "react";
import { useLocalStorageState } from "@/lib/local-storage";
import { walletSeed } from "@/lib/mock-data";
import { LEGACY_STORAGE_KEYS, STORAGE_KEYS } from "@/lib/storage-keys";
import {
  addWalletGoal,
  addWalletTransaction,
  changeWalletPeriod,
  deleteWalletTransaction,
  normalizeWallet,
  updateWalletData,
  type WalletGoalInput,
  type WalletTransactionInput,
  type WalletUpdateInput
} from "@/lib/services/wallet-service";
import { deleteWalletTransactionRemote, fetchWallet, upsertWalletBudget, upsertWalletGoal, upsertWalletTransaction } from "@/lib/services/supabase-data-service";
import { useAuth } from "@/hooks/use-auth";
import type { WalletData, WalletPeriod } from "@/types";

export function useWallet() {
  const { session, mode } = useAuth();
  const [wallet, setWallet, ready] = useLocalStorageState<WalletData>(STORAGE_KEYS.wallet, normalizeWallet(walletSeed as WalletData), [...LEGACY_STORAGE_KEYS.wallet]);
  const [syncing, setSyncing] = useState(false);
  const normalized = normalizeWallet(wallet);

  function refreshWallet() {
    if (!session || mode !== "supabase") {
      setWallet((current) => normalizeWallet({ ...current }));
      return;
    }
    setSyncing(true);
    void fetchWallet()
      .then((remote) => {
        if (remote) setWallet(remote);
      })
      .finally(() => setSyncing(false));
  }

  useEffect(() => {
    refreshWallet();
  }, [session?.userId, mode]);

  function updateWallet(input: WalletUpdateInput) {
    setWallet((current) => {
      const next = updateWalletData(current, input);
      if (session && mode === "supabase" && typeof input.budgetLimit === "number") void upsertWalletBudget(next.period, input.budgetLimit, next.currency);
      return next;
    });
  }

  function changePeriod(period: WalletPeriod) {
    setWallet((current) => changeWalletPeriod(current, period));
  }

  function addTransaction(input: WalletTransactionInput) {
    setWallet((current) => {
      const next = addWalletTransaction(current, input);
      const created = next.transactions[0];
      if (session && mode === "supabase") void upsertWalletTransaction(created);
      return next;
    });
  }

  function deleteTransaction(transactionId: string) {
    setWallet((current) => deleteWalletTransaction(current, transactionId));
    if (session && mode === "supabase") void deleteWalletTransactionRemote(transactionId);
  }

  function addGoal(input: WalletGoalInput) {
    setWallet((current) => {
      const next = addWalletGoal(current, input);
      const created = next.goals[0];
      if (session && mode === "supabase") void upsertWalletGoal(created);
      return next;
    });
  }

  return { wallet: normalized, setWallet, ready, syncing, refreshWallet, updateWallet, changePeriod, addTransaction, deleteTransaction, addGoal };
}
