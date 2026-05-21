"use client";

import { useEffect, useMemo, useState } from "react";
import { buildCategorySnapshot } from "@/lib/category-catalog";
import { fetchCategoryPreferences, type CategoryPreference } from "@/lib/services/category-preferences-service";

export function useCategoryPreferences() {
  const [preferences, setPreferences] = useState<CategoryPreference[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchCategoryPreferences().then((items) => {
      if (cancelled) return;
      setPreferences(items);
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [refreshKey]);

  const items = useMemo(() => buildCategorySnapshot(preferences), [preferences]);

  return {
    preferences,
    setPreferences,
    loading,
    reload: () => setRefreshKey((value) => value + 1),
    activityItems: items.activity,
    walletExpenseItems: items.walletExpense,
    walletIconItems: items.walletIcon,
  };
}
