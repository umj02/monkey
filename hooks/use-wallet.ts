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
import type { WalletData, WalletPeriod } from "@/types";

export function useWallet() {
  const [wallet, setWallet, ready] = useLocalStorageState<WalletData>(STORAGE_KEYS.wallet, normalizeWallet(walletSeed), [...LEGACY_STORAGE_KEYS.wallet]);

  return {
    wallet: normalizeWallet(wallet),
    setWallet,
    ready,
    updateWallet: (input: WalletUpdateInput) => setWallet((current) => updateWalletData(current, input)),
    changePeriod: (period: WalletPeriod) => setWallet((current) => changeWalletPeriod(current, period)),
    addTransaction: (input: WalletTransactionInput) => setWallet((current) => addWalletTransaction(current, input)),
    deleteTransaction: (transactionId: string) => setWallet((current) => deleteWalletTransaction(current, transactionId)),
    addGoal: (input: WalletGoalInput) => setWallet((current) => addWalletGoal(current, input))
  };
}
