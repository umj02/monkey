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
import { compareDateKeys } from "@/lib/calendar/calendar-utils";
import { isChallengeTaskDone, isChallengeTaskMissed, todayDateKey, hydrateChallengeTaskStatuses } from "@/lib/challenges";
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
      if (remoteChallenges) setChallenges(remoteChallenges.map((challenge) => hydrateChallengeTaskStatuses(challenge, new Set())));
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
    const todayKey = todayDateKey();
    const challenge = challenges.find((item) => item.id === input.challengeId);
    const task = challenge?.tasks.find((item) => item.id === input.challengeTaskId);
    if (input.done && task && compareDateKeys(task.scheduledDate, todayKey) > 0) return false;
    const checkedAt = input.done ? new Date().toISOString() : null;
    setChallenges((list) => list.map((item) => {
      if (item.id !== input.challengeId) return item;
      const tasks = item.tasks.map((currentTask) => {
        if (currentTask.id !== input.challengeTaskId) return currentTask;
        const nextStatus = input.done ? "checked" as const : (compareDateKeys(currentTask.scheduledDate, todayKey) < 0 ? "missed" as const : "pending" as const);
        return { ...currentTask, status: nextStatus, checkedAt };
      });
      return { ...item, tasks, updatedAt: new Date().toISOString() };
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
    const normalizedChallenge = hydrateChallengeTaskStatuses(challenge, new Set());
    if (normalizedChallenge.claimedAt) return null;
    if (normalizedChallenge.tasks.some((task) => isChallengeTaskMissed(task))) return null;
    if (!normalizedChallenge.tasks.length || !normalizedChallenge.tasks.every((task) => isChallengeTaskDone(task))) return null;
    const entry = createBananaLedgerEntry({
      userId: session?.userId ?? null,
      sourceType: "challenge",
      sourceId: normalizedChallenge.id,
      amount: normalizedChallenge.rewardBananas,
      reason: `Reto completado: ${normalizedChallenge.title}`,
    });
    const completedChallenge: Challenge = {
      ...normalizedChallenge,
      status: "completed",
      claimedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setChallenges((list) => list.map((item) => (item.id === normalizedChallenge.id ? completedChallenge : item)));
    setBananaLedger((list) => [entry, ...list.filter((item) => !(item.sourceType === "challenge" && item.sourceId === normalizedChallenge.id))]);
    if (session && mode === "supabase") {
      const challengeOk = await upsertChallengeRemote(completedChallenge);
      const remote = await upsertBananaLedgerEntryRemote(entry);
      if (!challengeOk || !remote) return null;
      setBananaLedger((list) => [remote, ...list.filter((item) => item.id !== entry.id)]);
    }
    return entry;
  }

  const summary = useMemo<ChallengeSummary>(() => {
    const trackedChallenges = challenges.filter((challenge) => challenge.status === "active" || challenge.status === "expired");
    const activeChallenges = challenges.filter((challenge) => challenge.status === "active");
    const completed = challenges.filter((challenge) => challenge.status === "completed").length;
    const bananasEarned = bananaLedger.reduce((sum, item) => sum + item.amount, 0);
    const claimableChallenges = activeChallenges.filter((challenge) => {
      if (challenge.claimedAt || !challenge.tasks.length) return false;
      return challenge.tasks.every((task) => isChallengeTaskDone(task));
    });
    const bananasAvailable = claimableChallenges.reduce((sum, challenge) => sum + challenge.rewardBananas, 0);
    const activeTasks = trackedChallenges.flatMap((challenge) => challenge.tasks);
    const missedTasks = activeTasks.filter((task) => isChallengeTaskMissed(task)).length;
    const pendingTasks = activeTasks.filter((task) => !isChallengeTaskDone(task) && !isChallengeTaskMissed(task)).length;
    return { active: activeChallenges.length, completed, pendingTasks, missedTasks, bananasEarned, bananasAvailable };
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
