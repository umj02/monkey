"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { BASE_CATEGORY_DEFINITIONS, type CategoryDefinition, type CategoryScope, categoryLabelFromKey } from "@/lib/category-definitions";
import { deleteCustomCategoryPreference, fetchCategoryPreferences, upsertCategoryPreference, type UserCategoryPreference } from "@/lib/services/category-preferences-service";

export type EditableCategory = CategoryDefinition & {
  id?: string;
  categoryKey: string;
  isEnabled: boolean;
  sortOrder: number;
  isCustom: boolean;
};

function toEditable(definition: CategoryDefinition, index: number): EditableCategory {
  return {
    ...definition,
    categoryKey: definition.key,
    isEnabled: true,
    sortOrder: index,
    isCustom: false,
  };
}

function mergePreference(base: EditableCategory | undefined, pref: UserCategoryPreference): EditableCategory {
  return {
    key: pref.categoryKey,
    categoryKey: pref.categoryKey,
    label: pref.label || base?.label || categoryLabelFromKey(pref.categoryKey),
    iconKey: pref.iconKey || base?.iconKey || "monito-otro",
    scope: pref.scope,
    group: base?.group,
    color: base?.color,
    isEnabled: pref.isEnabled,
    sortOrder: pref.sortOrder,
    isCustom: pref.isCustom,
    isBase: base?.isBase,
    id: pref.id,
  };
}

export function useCategoryPreferences(scope: CategoryScope) {
  const base = useMemo(() => BASE_CATEGORY_DEFINITIONS.filter((item) => item.scope === scope).map(toEditable), [scope]);
  const [items, setItems] = useState<EditableCategory[]>(base);
  const [status, setStatus] = useState<"idle" | "loading" | "saving" | "error" | "synced">("idle");

  const load = useCallback(async () => {
    setStatus("loading");
    const prefs = await fetchCategoryPreferences(scope);
    const byKey = new Map(base.map((item) => [item.categoryKey, item]));
    const merged = base.map((item) => {
      const pref = prefs.find((entry) => entry.categoryKey === item.categoryKey);
      return pref ? mergePreference(item, pref) : item;
    });
    prefs.filter((entry) => !byKey.has(entry.categoryKey)).forEach((pref) => merged.push(mergePreference(undefined, pref)));
    setItems(merged.sort((a, b) => a.sortOrder - b.sortOrder));
    setStatus("synced");
  }, [base, scope]);

  useEffect(() => {
    void load();
  }, [load]);

  async function save(item: EditableCategory) {
    setStatus("saving");
    const saved = await upsertCategoryPreference({
      scope: item.scope,
      categoryKey: item.categoryKey,
      label: item.label,
      iconKey: item.iconKey,
      imagePath: null,
      isEnabled: item.isEnabled,
      sortOrder: item.sortOrder,
      isCustom: item.isCustom,
      metadata: { group: item.group, color: item.color },
    });
    if (!saved) {
      setStatus("error");
      setItems((current) => current.map((entry) => (entry.categoryKey === item.categoryKey ? item : entry)));
      return item;
    }
    const merged = mergePreference(item, saved);
    setItems((current) => {
      const exists = current.some((entry) => entry.categoryKey === merged.categoryKey);
      const next = exists ? current.map((entry) => (entry.categoryKey === merged.categoryKey ? merged : entry)) : [...current, merged];
      return next.sort((a, b) => a.sortOrder - b.sortOrder);
    });
    setStatus("synced");
    return merged;
  }

  async function removeCustom(item: EditableCategory) {
    if (!item.isCustom) return false;
    setStatus("saving");
    const ok = await deleteCustomCategoryPreference(item.scope, item.categoryKey);
    if (ok) setItems((current) => current.filter((entry) => entry.categoryKey !== item.categoryKey));
    setStatus(ok ? "synced" : "error");
    return ok;
  }

  return { items, status, save, removeCustom, reload: load };
}
