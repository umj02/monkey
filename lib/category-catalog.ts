import { ACTIVITY_TYPES, getActivityTypeByKey, normalizeActivityTypeKey, type ActivityColor, type ActivityType } from "@/lib/activity-types";
import { getWalletAssetsByType } from "@/lib/asset-library";
import { VARIABLE_EXPENSE_CATEGORIES } from "@/lib/services/wallet-service";
import type { CategoryPreference, CategoryPreferenceScope } from "@/lib/services/category-preferences-service";

export type EditableCategory = CategoryPreference & { baseLabel: string };

export const categoryTabs: { scope: CategoryPreferenceScope; label: string; helper: string }[] = [
  { scope: "activity", label: "Actividades", helper: "Monitos para Calendario, Hoy y Nueva tarea." },
  { scope: "wallet_expense", label: "Wallet", helper: "Categorías de gasto variable para análisis." },
  { scope: "wallet_icon", label: "Iconos", helper: "Iconos rápidos para movimientos y gastos fijos." },
];

export const defaultIconByScope: Record<CategoryPreferenceScope, string> = {
  activity: "monito-otro",
  wallet_expense: "wallet-otro",
  wallet_icon: "wallet-otro",
};

const walletCategoryIconMap: Record<string, string> = {
  Comida: "wallet-comida",
  Transporte: "wallet-transporte",
  Entretenimiento: "wallet-entretenimiento",
  Compras: "wallet-compras",
  Escuela: "wallet-escuela",
  Café: "wallet-cafe",
  Uber: "wallet-uber",
  Pagos: "wallet-pagos",
  Alquiler: "wallet-alquiler",
  "Cuidado personal": "wallet-cuidado-personal",
  Buses: "wallet-buses",
  Vehículo: "wallet-vehiculo",
};

export function slugifyCategory(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "") || "categoria";
}

export function buildBaseCategoryItems(scope: CategoryPreferenceScope): EditableCategory[] {
  if (scope === "activity") {
    return ACTIVITY_TYPES.map((type, index) => ({
      scope,
      key: type.key,
      label: type.label,
      baseLabel: type.label,
      iconKey: type.iconKey,
      imagePath: null,
      isEnabled: true,
      sortOrder: index,
      isCustom: false,
    }));
  }

  if (scope === "wallet_expense") {
    return VARIABLE_EXPENSE_CATEGORIES.map((label, index) => ({
      scope,
      key: slugifyCategory(label),
      label,
      baseLabel: label,
      iconKey: walletCategoryIconMap[label] ?? "wallet-otro",
      imagePath: null,
      isEnabled: true,
      sortOrder: index,
      isCustom: false,
    }));
  }

  return getWalletAssetsByType("expense")
    .filter((asset) => asset.group === "movement")
    .map((asset, index) => ({
      scope,
      key: asset.key.replace(/^wallet-/, ""),
      label: asset.label,
      baseLabel: asset.label,
      iconKey: asset.key,
      imagePath: asset.src,
      isEnabled: true,
      sortOrder: index,
      isCustom: false,
    }));
}

export function mergeCategoryPreferences(baseItems: EditableCategory[], preferences: CategoryPreference[], scope: CategoryPreferenceScope) {
  const byKey = new Map(preferences.filter((item) => item.scope === scope).map((item) => [item.key, item]));
  const merged = baseItems.map((item) => ({ ...item, ...(byKey.get(item.key) ?? {}), baseLabel: item.baseLabel }));
  const custom = preferences
    .filter((item) => item.scope === scope && item.isCustom && !baseItems.some((baseItem) => baseItem.key === item.key))
    .map((item) => ({ ...item, baseLabel: item.label }));
  return [...merged, ...custom].sort((a, b) => a.sortOrder - b.sortOrder || a.label.localeCompare(b.label));
}

export function buildCategorySnapshot(preferences: CategoryPreference[]) {
  const activity = mergeCategoryPreferences(buildBaseCategoryItems("activity"), preferences, "activity");
  const walletExpense = mergeCategoryPreferences(buildBaseCategoryItems("wallet_expense"), preferences, "wallet_expense");
  const walletIcon = mergeCategoryPreferences(buildBaseCategoryItems("wallet_icon"), preferences, "wallet_icon");
  return { activity, walletExpense, walletIcon };
}


export type ResolvedActivityCategoryMeta = ActivityType & {
  imagePath?: string | null;
  isCustom?: boolean;
};

function categoryToActivityMeta(item: EditableCategory): ResolvedActivityCategoryMeta {
  const base = getActivityTypeByKey(item.key) ?? getActivityTypeByKey(item.iconKey) ?? getActivityTypeByKey("otro");
  return {
    ...base,
    key: item.key,
    label: item.label,
    iconKey: item.iconKey ?? base.iconKey,
    imagePath: item.imagePath ?? null,
    isCustom: item.isCustom,
  };
}

export function resolveActivityCategoryMeta(
  input: { key?: string | null; iconKey?: string | null; title?: string | null },
  activityItems: EditableCategory[] = buildBaseCategoryItems("activity"),
): ResolvedActivityCategoryMeta {
  const byKey = new Map(activityItems.map((item) => [normalizeActivityTypeKey(item.key), item]));
  const byIcon = new Map(activityItems.map((item) => [item.iconKey, item]));

  const normalizedKey = normalizeActivityTypeKey(input.key);
  const byDirectKey = input.key ? byKey.get(normalizedKey) : null;
  if (byDirectKey) return categoryToActivityMeta(byDirectKey);

  const byDirectIcon = input.iconKey ? byIcon.get(input.iconKey) : null;
  if (byDirectIcon) return categoryToActivityMeta(byDirectIcon);

  if (input.title) {
    const title = input.title.toLowerCase();
    const byTitle = activityItems.find((item) => title.includes(item.label.toLowerCase()) || title.includes(item.key.replace(/-/g, " ")));
    if (byTitle) return categoryToActivityMeta(byTitle);
  }

  const fallback = activityItems.find((item) => item.key === "otro") ?? activityItems[0];
  return fallback ? categoryToActivityMeta(fallback) : getActivityTypeByKey("otro");
}

export type ResolvedWalletCategoryMeta = {
  key: string;
  label: string;
  iconKey: string;
  imagePath?: string | null;
  isCustom?: boolean;
};

export function resolveWalletCategoryMeta(
  input: { key?: string | null; label?: string | null; iconKey?: string | null },
  walletExpenseItems: EditableCategory[] = buildBaseCategoryItems("wallet_expense"),
): ResolvedWalletCategoryMeta {
  const byKey = new Map(walletExpenseItems.map((item) => [item.key, item]));
  const byLabel = new Map(walletExpenseItems.map((item) => [item.label.toLowerCase(), item]));
  const normalizedLabelKey = input.label ? slugifyCategory(input.label) : null;
  const match = (input.key ? byKey.get(input.key) : null)
    ?? (normalizedLabelKey ? byKey.get(normalizedLabelKey) : null)
    ?? (input.label ? byLabel.get(input.label.toLowerCase()) : null);

  if (match) {
    return {
      key: match.key,
      label: match.label,
      iconKey: match.iconKey ?? defaultIconByScope.wallet_expense,
      imagePath: match.imagePath ?? null,
      isCustom: match.isCustom,
    };
  }

  const label = input.label || "Otro";
  return {
    key: input.key || slugifyCategory(label),
    label,
    iconKey: input.iconKey || walletCategoryIconMap[label] || defaultIconByScope.wallet_expense,
    imagePath: null,
    isCustom: false,
  };
}
