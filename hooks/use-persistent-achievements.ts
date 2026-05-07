"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { fetchAchievementUnlocks, upsertAchievementUnlocks } from "@/lib/services/supabase-data-service";
import { mergePersistentAchievementUnlocks, type AchievementResult, type PersistentAchievementUnlock } from "@/lib/achievements";

export type AchievementSyncStatus = "local" | "loading" | "saving" | "synced" | "error";

export function usePersistentAchievements(result: AchievementResult) {
  const { session, mode } = useAuth();
  const [persisted, setPersisted] = useState<PersistentAchievementUnlock[]>([]);
  const [syncStatus, setSyncStatus] = useState<AchievementSyncStatus>("local");
  const [lastError, setLastError] = useState<string | null>(null);
  const [recentUnlockIds, setRecentUnlockIds] = useState<string[]>([]);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
  const syncedKeyRef = useRef("");
  const clearTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!session || mode !== "supabase") {
      setPersisted([]);
      setSyncStatus("local");
      setLastError(null);
      setRecentUnlockIds([]);
      setLastSyncedAt(null);
      syncedKeyRef.current = "";
      return;
    }

    let mounted = true;
    syncedKeyRef.current = "";
    setSyncStatus("loading");
    setLastError(null);

    void fetchAchievementUnlocks()
      .then((rows) => {
        if (!mounted) return;
        if (!rows) {
          setSyncStatus("error");
          setLastError("No se pudieron cargar tus medallas guardadas.");
          return;
        }
        setPersisted(rows);
        setSyncStatus("synced");
        setLastSyncedAt(new Date().toISOString());
      })
      .catch(() => {
        if (!mounted) return;
        setSyncStatus("error");
        setLastError("No se pudieron cargar tus medallas guardadas.");
      });

    return () => {
      mounted = false;
    };
  }, [mode, session?.userId]);

  const merged = useMemo(() => mergePersistentAchievementUnlocks(result, persisted), [persisted, result]);

  useEffect(() => {
    if (!session || mode !== "supabase") return;

    const persistedIds = new Set(persisted.map((unlock) => unlock.achievementId));
    const newlyUnlocked = result.achievements.filter((achievement) => achievement.unlocked && !persistedIds.has(achievement.id));
    if (!newlyUnlocked.length) return;

    const syncKey = newlyUnlocked.map((achievement) => achievement.id).sort().join("|");
    if (syncedKeyRef.current === syncKey) return;
    syncedKeyRef.current = syncKey;

    setSyncStatus("saving");
    setLastError(null);

    void upsertAchievementUnlocks(newlyUnlocked)
      .then((rows) => {
        if (!rows) {
          setSyncStatus("error");
          setLastError("Hay medallas nuevas, pero no se pudieron guardar en Supabase.");
          return;
        }
        setPersisted((current) => {
          const next = new Map(current.map((unlock) => [unlock.achievementId, unlock]));
          rows.forEach((unlock) => next.set(unlock.achievementId, unlock));
          return Array.from(next.values()).sort((a, b) => b.unlockedAt.localeCompare(a.unlockedAt));
        });
        const ids = rows.map((unlock) => unlock.achievementId);
        if (ids.length) {
          setRecentUnlockIds(ids);
          if (clearTimerRef.current) clearTimeout(clearTimerRef.current);
          clearTimerRef.current = setTimeout(() => setRecentUnlockIds([]), 7000);
        }
        setLastSyncedAt(new Date().toISOString());
        setSyncStatus("synced");
      })
      .catch(() => {
        setSyncStatus("error");
        setLastError("Hay medallas nuevas, pero no se pudieron guardar en Supabase.");
      });
  }, [mode, persisted, result.achievements, session?.userId]);


  useEffect(() => {
    return () => {
      if (clearTimerRef.current) clearTimeout(clearTimerRef.current);
    };
  }, []);

  const clearRecentUnlocks = useCallback(() => setRecentUnlockIds([]), []);

  return {
    result: merged,
    persistedUnlocks: persisted,
    syncStatus,
    lastError,
    recentUnlockIds,
    lastSyncedAt,
    clearRecentUnlocks,
    isPersistent: Boolean(session && mode === "supabase"),
  };
}
