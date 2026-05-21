import { createOptionalClient } from "@/lib/supabase/client";
import { getUserId } from "@/lib/services/supabase-data-service";

export type CategoryPreferenceScope = "activity" | "wallet_expense" | "wallet_icon";

export type CategoryPreference = {
  id?: string;
  scope: CategoryPreferenceScope;
  key: string;
  label: string;
  iconKey?: string | null;
  imagePath?: string | null;
  isEnabled: boolean;
  sortOrder: number;
  isCustom: boolean;
  createdAt?: string;
  updatedAt?: string;
};

function fromRow(row: any): CategoryPreference {
  return {
    id: row.id,
    scope: row.scope,
    key: row.category_key ?? row.key,
    label: row.label,
    iconKey: row.icon_key,
    imagePath: row.image_path,
    isEnabled: Boolean(row.is_enabled),
    sortOrder: Number(row.sort_order ?? 0),
    isCustom: Boolean(row.is_custom),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function fetchCategoryPreferences(scope?: CategoryPreferenceScope): Promise<CategoryPreference[]> {
  const supabase = createOptionalClient() as any;
  const userId = await getUserId();
  if (!supabase || !userId) return [];

  let query = supabase
    .from("user_category_preferences")
    .select("id, scope, category_key, label, icon_key, image_path, is_enabled, sort_order, is_custom, created_at, updated_at")
    .eq("user_id", userId)
    .order("scope", { ascending: true })
    .order("sort_order", { ascending: true })
    .order("label", { ascending: true });

  if (scope) query = query.eq("scope", scope);
  const { data, error } = await query;
  if (error || !data) return [];
  return data.map(fromRow);
}

export async function upsertCategoryPreference(input: CategoryPreference): Promise<CategoryPreference | null> {
  const supabase = createOptionalClient() as any;
  const userId = await getUserId();
  if (!supabase || !userId) return null;

  const payload = {
    user_id: userId,
    scope: input.scope,
    category_key: input.key,
    label: input.label,
    icon_key: input.iconKey ?? null,
    image_path: input.imagePath ?? null,
    is_enabled: input.isEnabled,
    sort_order: input.sortOrder,
    is_custom: input.isCustom,
  };

  const { data, error } = await supabase
    .from("user_category_preferences")
    .upsert(payload, { onConflict: "user_id,scope,category_key" })
    .select("id, scope, category_key, label, icon_key, image_path, is_enabled, sort_order, is_custom, created_at, updated_at")
    .single();

  if (error || !data) return null;
  return fromRow(data);
}

export async function deleteCategoryPreference(scope: CategoryPreferenceScope, key: string): Promise<boolean> {
  const supabase = createOptionalClient() as any;
  const userId = await getUserId();
  if (!supabase || !userId) return false;
  const { error } = await supabase.from("user_category_preferences").delete().eq("user_id", userId).eq("scope", scope).eq("category_key", key);
  return !error;
}
