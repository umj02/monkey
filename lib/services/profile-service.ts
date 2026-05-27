import { createOptionalClient } from "@/lib/supabase/client";
import type { Profile, Settings } from "@/types";
import { DEFAULT_SOUND_CONTROLS } from "@/lib/sound/sound-settings";

export const initialProfile: Profile = { name: "Juan Pérez", email: "juanperez@email.com", hasCompletedOnboarding: true };
export const initialSettings: Settings = { darkMode: false, sounds: true, sync: true, theme: "colorful", soundControls: DEFAULT_SOUND_CONTROLS };

type ProfileRow = {
  display_name: string | null;
  email: string | null;
  has_completed_onboarding?: boolean | null;
};

export async function fetchSupabaseProfile(userId: string, fallbackEmail = ""): Promise<Profile | null> {
  const supabase = createOptionalClient() as any;
  if (!supabase) return null;
  const { data, error } = await supabase.from("profiles").select("display_name, email, has_completed_onboarding").eq("id", userId).maybeSingle();
  if (error) return null;
  const row = data as ProfileRow | null;
  return { name: row?.display_name || "Juan", email: row?.email || fallbackEmail, hasCompletedOnboarding: Boolean(row?.has_completed_onboarding) };
}

export async function upsertSupabaseProfile(userId: string, profile: Profile): Promise<void> {
  const supabase = createOptionalClient() as any;
  if (!supabase) return;
  await supabase.from("profiles").upsert({ id: userId, display_name: profile.name, email: profile.email, has_completed_onboarding: profile.hasCompletedOnboarding }, { onConflict: "id" });
}
