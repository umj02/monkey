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
  syncChallengeTaskCompletionRemote,
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
    if (session && mode === "supabase") {
      const remote = await upsertChallengeRemote(challenge);
      if (!remote) return null;
      const merged = { ...remote, tasks: challenge.tasks };
      setChallenges((list) => [merged, ...list.filter((item) => item.id !== challenge.id)]);
      return merged;
    }
    setChallenges((list) => [challenge, ...list.filter((item) => item.id !== challenge.id)]);
    return challenge;
  }

  async function updateChallenge(challenge: Challenge) {
    if (session && mode === "supabase") {
      const remote = await upsertChallengeRemote(challenge);
      if (!remote) return false;
    }
    setChallenges((list) => list.map((item) => (item.id === challenge.id ? challenge : item)));
    return true;
  }

  async function syncChallengeTaskFromCalendarEvent(input: { challengeId?: string | null; challengeTaskId?: string | null; calendarEventId?: string | null; done: boolean }) {
    if (!input.challengeId || !input.challengeTaskId) return false;
    const checkedAt = input.done ? new Date().toISOString() : null;
    setChallenges((list) => list.map((challenge) => {
      if (challenge.id !== input.challengeId) return challenge;
      const tasks = challenge.tasks.map((task) => task.id === input.challengeTaskId ? { ...task, status: input.done ? "checked" as const : "pending" as const, checkedAt } : task);
      return { ...challenge, tasks, updatedAt: new Date().toISOString() };
    }));
    if (session && mode === "supabase") {
      const ok = await syncChallengeTaskCompletionRemote({
        challengeId: input.challengeId,
        challengeTaskId: input.challengeTaskId,
        calendarEventId: input.calendarEventId ?? null,
        done: input.done,
      });
      if (ok) void refreshChallenges();
      return ok;
    }
    return true;
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
      const challengeOk = await upsertChallengeRemote(completedChallenge);
      const remote = await upsertBananaLedgerEntryRemote(entry);
      if (!challengeOk || !remote) return null;
      setBananaLedger((list) => [remote, ...list.filter((item) => item.id !== entry.id)]);
    }
    return entry;
  }

  const summary = useMemo<ChallengeSummary>(() => {
    const active = challenges.filter((challenge) => challenge.status === "active").length;
    const completed = challenges.filter((challenge) => challenge.status === "completed").length;
    const bananasEarned = bananaLedger.reduce((sum, item) => sum + item.amount, 0);
    const bananasAvailable = challenges.filter((challenge) => challenge.status === "active" && !challenge.claimedAt).reduce((sum, challenge) => sum + challenge.rewardBananas, 0);
    const pendingTasks = challenges.filter((challenge) => challenge.status === "active").flatMap((challenge) => challenge.tasks).length;
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
    syncChallengeTaskFromCalendarEvent,
    refreshChallenges,
  };
}
