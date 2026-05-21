import { createOptionalClient } from "@/lib/supabase/client";
import { getUserId } from "@/lib/services/supabase-data-service";
import type { CategoryScope } from "@/lib/category-definitions";

export type UserCategoryPreference = {
  id?: string;
  userId?: string;
  scope: CategoryScope;
  categoryKey: string;
  label: string;
  iconKey: string;
  imagePath?: string | null;
  isEnabled: boolean;
  sortOrder: number;
  isCustom: boolean;
  metadata?: Record<string, unknown>;
};

type DbRow = {
  id: string;
  user_id: string;
  scope: CategoryScope;
  category_key: string;
  label: string;
  icon_key: string;
  image_path: string | null;
  is_enabled: boolean;
  sort_order: number;
  is_custom: boolean;
  metadata: Record<string, unknown> | null;
};

function fromRow(row: DbRow): UserCategoryPreference {
  return {
    id: row.id,
    userId: row.user_id,
    scope: row.scope,
    categoryKey: row.category_key,
    label: row.label,
    iconKey: row.icon_key,
    imagePath: row.image_path,
    isEnabled: row.is_enabled,
    sortOrder: row.sort_order,
    isCustom: row.is_custom,
    metadata: row.metadata ?? {},
  };
}

function toPayload(pref: UserCategoryPreference, userId: string) {
  return {
    user_id: userId,
    scope: pref.scope,
    category_key: pref.categoryKey,
    label: pref.label,
    icon_key: pref.iconKey,
    image_path: pref.imagePath ?? null,
    is_enabled: pref.isEnabled,
    sort_order: pref.sortOrder,
    is_custom: pref.isCustom,
    metadata: pref.metadata ?? {},
  };
}

export async function fetchCategoryPreferences(scope?: CategoryScope): Promise<UserCategoryPreference[]> {
  const supabase = createOptionalClient() as any;
  const userId = await getUserId();
  if (!supabase || !userId) return [];

  let query = supabase
    .from("user_category_preferences")
    .select("id,user_id,scope,category_key,label,icon_key,image_path,is_enabled,sort_order,is_custom,metadata")
    .eq("user_id", userId)
    .order("scope", { ascending: true })
    .order("sort_order", { ascending: true });

  if (scope) query = query.eq("scope", scope);
  const { data, error } = await query;
  if (error || !data) return [];
  return (data as DbRow[]).map(fromRow);
}

export async function upsertCategoryPreference(pref: UserCategoryPreference): Promise<UserCategoryPreference | null> {
  const supabase = createOptionalClient() as any;
  const userId = await getUserId();
  if (!supabase || !userId) return null;

  const { data, error } = await supabase
    .from("user_category_preferences")
    .upsert(toPayload(pref, userId), { onConflict: "user_id,scope,category_key" })
    .select("id,user_id,scope,category_key,label,icon_key,image_path,is_enabled,sort_order,is_custom,metadata")
    .single();

  if (error || !data) return null;
  return fromRow(data as DbRow);
}

export async function deleteCustomCategoryPreference(scope: CategoryScope, categoryKey: string): Promise<boolean> {
  const supabase = createOptionalClient() as any;
  const userId = await getUserId();
  if (!supabase || !userId || !categoryKey.startsWith("custom:")) return false;

  const { error } = await supabase
    .from("user_category_preferences")
    .delete()
    .eq("user_id", userId)
    .eq("scope", scope)
    .eq("category_key", categoryKey)
    .eq("is_custom", true);

  return !error;
}
