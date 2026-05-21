"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocalStorageState } from "@/lib/local-storage";
import { LEGACY_STORAGE_KEYS, STORAGE_KEYS } from "@/lib/storage-keys";
import { useAuth } from "@/hooks/use-auth";
import {
  createBananaLedgerEntry,
  fetchBananaLedgerRemote,
  fetchChallengesRemote,
  upsertBananaLedgerEntryRemote,
  upsertChallengeRemote,
} from "@/lib/services/challenge-service";
import type { BananaLedgerEntry, Challenge, ChallengeSummary } from "@/types";

export function useChallenges() {
  const { session, mode } = useAuth();
  const [challenges, setChallenges, challengesReady] = useLocalStorageState<Challenge[]>(STORAGE_KEYS.challenges, [], [...LEGACY_STORAGE_KEYS.challenges]);
  const [bananaLedger, setBananaLedger, ledgerReady] = useLocalStorageState<BananaLedgerEntry[]>(STORAGE_KEYS.bananaLedger, [], [...LEGACY_STORAGE_KEYS.bananaLedger]);
  const [syncing, setSyncing] = useState(false);

  async function refreshChallenges() {
    if (!session || mode !== "supabase") return false;
    setSyncing(true);
    try {
      const [remoteChallenges, remoteLedger] = await Promise.all([fetchChallengesRemote(), fetchBananaLedgerRemote()]);
      if (remoteChallenges) setChallenges(remoteChallenges);
      if (remoteLedger) setBananaLedger(remoteLedger);
      return Boolean(remoteChallenges || remoteLedger);
    } finally {
      setSyncing(false);
    }
  }

  useEffect(() => {
    if (!session || mode !== "supabase") return;
    void refreshChallenges();
  }, [session?.userId, mode]);

  async function saveChallenge(challenge: Challenge) {
    setChallenges((list) => [challenge, ...list.filter((item) => item.id !== challenge.id)]);
    if (session && mode === "supabase") {
      const remote = await upsertChallengeRemote(challenge);
      if (remote) setChallenges((list) => list.map((item) => (item.id === challenge.id ? { ...remote, tasks: challenge.tasks } : item)));
    }
  }

  async function updateChallenge(challenge: Challenge) {
    setChallenges((list) => list.map((item) => (item.id === challenge.id ? challenge : item)));
    if (session && mode === "supabase") await upsertChallengeRemote(challenge);
  }

  async function claimBananas(challenge: Challenge) {
    if (challenge.claimedAt) return null;
    const entry = createBananaLedgerEntry({
      userId: session?.userId ?? null,
      sourceType: "challenge",
      sourceId: challenge.id,
      amount: challenge.rewardBananas,
      reason: `Reto completado: ${challenge.title}`,
    });
    const completedChallenge: Challenge = {
      ...challenge,
      status: "completed",
      claimedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setChallenges((list) => list.map((item) => (item.id === challenge.id ? completedChallenge : item)));
    setBananaLedger((list) => [entry, ...list.filter((item) => !(item.sourceType === "challenge" && item.sourceId === challenge.id))]);
    if (session && mode === "supabase") {
      await upsertChallengeRemote(completedChallenge);
      const remote = await upsertBananaLedgerEntryRemote(entry);
      if (remote) setBananaLedger((list) => [remote, ...list.filter((item) => item.id !== entry.id)]);
      await refreshChallenges();
    }
    return entry;
  }

  const summary = useMemo<ChallengeSummary>(() => {
    const active = challenges.filter((challenge) => challenge.status === "active").length;
    const completed = challenges.filter((challenge) => challenge.status === "completed").length;
    const bananasEarned = bananaLedger.reduce((sum, item) => sum + item.amount, 0);
    const activeUnclaimed = challenges.filter((challenge) => challenge.status === "active" && !challenge.claimedAt);
    const bananasAvailable = activeUnclaimed
      .filter((challenge) => challenge.tasks.length > 0 && challenge.tasks.every((task) => task.status === "checked" || task.status === "verified"))
      .reduce((sum, challenge) => sum + challenge.rewardBananas, 0);
    const pendingTasks = activeUnclaimed
      .flatMap((challenge) => challenge.tasks)
      .filter((task) => task.status !== "checked" && task.status !== "verified").length;
    return { active, completed, pendingTasks, bananasEarned, bananasAvailable };
  }, [bananaLedger, challenges]);

  return {
    challenges,
    bananaLedger,
    ready: challengesReady && ledgerReady,
    syncing,
    summary,
    setChallenges,
    setBananaLedger,
    saveChallenge,
    updateChallenge,
    claimBananas,
    refreshChallenges,
  };
}
