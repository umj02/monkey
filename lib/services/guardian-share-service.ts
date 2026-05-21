import { createOptionalClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/database.types";
import { getUserId } from "@/lib/services/supabase-data-service";

type GuardianShareInsert = Database["public"]["Tables"]["guardian_share_tokens"]["Insert"];

type SecureGuardianShareOptions = {
  childAlias: string;
  guardianLabel: string;
  expiresAt: string;
  includeCalendar: boolean;
  includeAchievements: boolean;
  includeBestDay: boolean;
  includeStreak: boolean;
  includeWallet: boolean;
};

export type SecureGuardianShareRecord = {
  id: string;
  token: string;
  expiresAt: string;
  createdAt: string;
};

export type PublicGuardianShareResult<TPayload> = {
  status: "active" | "expired" | "revoked";
  payload: TPayload;
  expiresAt: string;
  createdAt: string;
};

function randomTokenPart() {
  const bytes = new Uint8Array(18);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(36).padStart(2, "0")).join("").slice(0, 34);
}

export function createGuardianShareTokenValue() {
  return `gsh_${randomTokenPart()}_${Date.now().toString(36)}`;
}

export async function createGuardianShareToken<TPayload extends Record<string, unknown>>(
  snapshot: TPayload,
  options: SecureGuardianShareOptions,
): Promise<SecureGuardianShareRecord | null> {
  const supabase = createOptionalClient() as any;
  const userId = await getUserId();
  if (!supabase || !userId) return null;

  const token = createGuardianShareTokenValue();
  const payload: GuardianShareInsert = {
    user_id: userId,
    token,
    child_alias: options.childAlias,
    guardian_label: options.guardianLabel,
    include_calendar: options.includeCalendar,
    include_achievements: options.includeAchievements,
    include_best_day: options.includeBestDay,
    include_streak: options.includeStreak,
    include_wallet: options.includeWallet,
    snapshot: snapshot as any,
    expires_at: options.expiresAt,
  };

  const { data, error } = await supabase
    .from("guardian_share_tokens")
    .insert(payload)
    .select("id, token, expires_at, created_at")
    .single();

  if (error || !data) return null;
  return {
    id: data.id,
    token: data.token,
    expiresAt: data.expires_at,
    createdAt: data.created_at,
  };
}

export async function revokeGuardianShareToken(id: string): Promise<boolean> {
  const supabase = createOptionalClient() as any;
  const userId = await getUserId();
  if (!supabase || !userId || !id) return false;

  const { error } = await supabase
    .from("guardian_share_tokens")
    .update({ revoked_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", userId);

  return !error;
}

export async function fetchGuardianShareByToken<TPayload>(token: string): Promise<PublicGuardianShareResult<TPayload> | null> {
  const supabase = createOptionalClient() as any;
  if (!supabase || !token) return null;

  const { data, error } = await supabase.rpc("get_guardian_share_by_token", { p_token: token });
  if (error) return null;
  const row = Array.isArray(data) ? data[0] : data;
  if (!row?.snapshot || !row?.status) return null;

  return {
    status: row.status,
    payload: row.snapshot as TPayload,
    expiresAt: row.expires_at,
    createdAt: row.created_at,
  };
}
