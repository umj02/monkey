"use client";

import { useEffect, useRef, useState } from "react";
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
  updateWalletGoalAmount,
  type WalletGoalInput,
  type WalletTransactionInput,
  type WalletUpdateInput
} from "@/lib/services/wallet-service";
import { deleteWalletTransactionRemote, fetchWallet, upsertWalletBudget, upsertWalletGoal, upsertWalletTransaction } from "@/lib/services/supabase-data-service";
import { useAuth } from "@/hooks/use-auth";
import type { WalletData, WalletGoal, WalletPeriod, WalletTransaction } from "@/types";

export type WalletSyncStatus = "idle" | "loading" | "saving" | "synced" | "error";

function isTempWalletTransactionId(id: string) {
  return id.startsWith("wallet-tx-");
}

function isTempWalletGoalId(id: string) {
  return id.startsWith("wallet-goal-");
}

export function useWallet() {
  const { session, mode } = useAuth();
  const [wallet, setWallet, ready] = useLocalStorageState<WalletData>(STORAGE_KEYS.wallet, normalizeWallet(walletSeed as WalletData), [...LEGACY_STORAGE_KEYS.wallet]);
  const [syncing, setSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<WalletSyncStatus>("idle");
  const [lastError, setLastError] = useState<string | null>(null);
  const deletedTempTransactions = useRef<Set<string>>(new Set());
  const deletedTempGoals = useRef<Set<string>>(new Set());
  const normalized = normalizeWallet(wallet);

  function refreshWallet() {
    if (!session || mode !== "supabase") {
      setWallet((current) => normalizeWallet({ ...current }));
      return;
    }
    setSyncing(true);
    setSyncStatus("loading");
    setLastError(null);
    void fetchWallet()
      .then((remote) => {
        if (remote) {
          setWallet(remote);
          setSyncStatus("synced");
        } else {
          setSyncStatus("error");
          setLastError("No se pudo actualizar Wallet desde tu cuenta.");
        }
      })
      .catch(() => {
        setSyncStatus("error");
        setLastError("No se pudo actualizar Wallet desde tu cuenta.");
      })
      .finally(() => setSyncing(false));
  }

  useEffect(() => {
    refreshWallet();
  }, [session?.userId, mode]);

  function updateWallet(input: WalletUpdateInput) {
    setWallet((current) => {
      const next = updateWalletData(current, input);
      if (session && mode === "supabase" && typeof input.budgetLimit === "number") {
        setSyncStatus("saving");
        setLastError(null);
        void upsertWalletBudget(next.period, input.budgetLimit, next.currency)
          .then(() => setSyncStatus("synced"))
          .catch(() => {
            setSyncStatus("error");
            setLastError("No se pudo sincronizar el presupuesto.");
          });
      }
      return next;
    });
  }

  function changePeriod(period: WalletPeriod) {
    setWallet((current) => changeWalletPeriod(current, period));
  }

  function replaceTransaction(tempId: string, remote: WalletTransaction) {
    setWallet((current) => normalizeWallet({
      ...current,
      transactions: current.transactions.map((tx) => (tx.id === tempId ? remote : tx)),
    }));
  }

  function replaceGoal(tempId: string, remote: WalletGoal) {
    setWallet((current) => normalizeWallet({
      ...current,
      goals: current.goals.map((goal) => (goal.id === tempId ? remote : goal)),
    }));
  }

  function addTransaction(input: WalletTransactionInput) {
    let created: WalletTransaction | null = null;
    setWallet((current) => {
      const next = addWalletTransaction(current, input);
      created = next.transactions[0] ?? null;
      return next;
    });

    const createdTransaction = created as WalletTransaction | null;
    if (session && mode === "supabase" && createdTransaction) {
      const tempId = createdTransaction.id;
      setSyncStatus("saving");
      setLastError(null);
      void upsertWalletTransaction(createdTransaction)
        .then((remote) => {
          if (!remote) {
            setSyncStatus("error");
            setLastError("No se pudo sincronizar el movimiento. Intentá refrescar Wallet.");
            return;
          }
          if (deletedTempTransactions.current.has(tempId)) {
            deletedTempTransactions.current.delete(tempId);
            void deleteWalletTransactionRemote(remote.id);
            setSyncStatus("synced");
            return;
          }
          replaceTransaction(tempId, remote);
          setSyncStatus("synced");
        })
        .catch(() => {
          setSyncStatus("error");
          setLastError("No se pudo sincronizar el movimiento. Intentá refrescar Wallet.");
        });
    }
  }

  function deleteTransaction(transactionId: string) {
    setWallet((current) => deleteWalletTransaction(current, transactionId));
    if (!session || mode !== "supabase") return;

    if (isTempWalletTransactionId(transactionId)) {
      deletedTempTransactions.current.add(transactionId);
      return;
    }

    setSyncStatus("saving");
    setLastError(null);
    void deleteWalletTransactionRemote(transactionId)
      .then((ok) => {
        if (!ok) {
          setSyncStatus("error");
          setLastError("No se pudo eliminar el movimiento de tu cuenta. Refrescá para verificar.");
          return;
        }
        setSyncStatus("synced");
      })
      .catch(() => {
        setSyncStatus("error");
        setLastError("No se pudo eliminar el movimiento de tu cuenta. Refrescá para verificar.");
      });
  }

  function addGoal(input: WalletGoalInput) {
    let created: WalletGoal | null = null;
    setWallet((current) => {
      const next = addWalletGoal(current, input);
      created = next.goals[0] ?? null;
      return next;
    });

    const createdGoal = created as WalletGoal | null;
    if (session && mode === "supabase" && createdGoal) {
      const tempId = createdGoal.id;
      setSyncStatus("saving");
      setLastError(null);
      void upsertWalletGoal(createdGoal)
        .then((remote) => {
          if (!remote) {
            setSyncStatus("error");
            setLastError("No se pudo sincronizar la meta. Intentá refrescar Wallet.");
            return;
          }
          if (deletedTempGoals.current.has(tempId)) {
            deletedTempGoals.current.delete(tempId);
            setSyncStatus("synced");
            return;
          }
          replaceGoal(tempId, remote);
          setSyncStatus("synced");
        })
        .catch(() => {
          setSyncStatus("error");
          setLastError("No se pudo sincronizar la meta. Intentá refrescar Wallet.");
        });
    }
  }

  function addGoalAmount(goalId: string, amount: number) {
    const safeAmount = Math.max(0, Number(amount) || 0);
    if (safeAmount <= 0) return false;

    const existing = normalized.goals.find((goal) => goal.id === goalId);
    if (!existing) return false;

    const nextCurrent = Math.min(existing.target, existing.current + safeAmount);
    const updatedGoal: WalletGoal = { ...existing, current: nextCurrent };
    setWallet((current) => updateWalletGoalAmount(current, goalId, nextCurrent));

    if (session && mode === "supabase") {
      setSyncStatus("saving");
      setLastError(null);
      void upsertWalletGoal(updatedGoal)
        .then((remote) => {
          if (remote) replaceGoal(goalId, remote);
          setSyncStatus(remote ? "synced" : "error");
          if (!remote) setLastError("No se pudo sincronizar el avance de la meta.");
        })
        .catch(() => {
          setSyncStatus("error");
          setLastError("No se pudo sincronizar el avance de la meta.");
        });
    }

    return true;
  }

  return { wallet: normalized, setWallet, ready, syncing, syncStatus, lastError, refreshWallet, updateWallet, changePeriod, addTransaction, deleteTransaction, addGoal, addGoalAmount };
}
