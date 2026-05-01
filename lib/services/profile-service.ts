import { createOptionalClient } from "@/lib/supabase/client";
import type { Profile, Settings } from "@/types";

export const initialProfile: Profile = { name: "Juan Pérez", email: "juanperez@email.com" };
export const initialSettings: Settings = { darkMode: false, sounds: true, sync: true, theme: "colorful" };

export async function fetchSupabaseProfile(userId: string, fallbackEmail = ""): Promise<Profile | null> {
  const supabase = createOptionalClient() as any;
  if (!supabase) return null;
  const { data, error } = await supabase.from("profiles").select("display_name, email").eq("id", userId).maybeSingle();
  if (error) return null;
  return { name: data?.display_name || "Juan", email: data?.email || fallbackEmail };
}

export async function upsertSupabaseProfile(userId: string, profile: Profile) {
  const supabase = createOptionalClient() as any;
  if (!supabase) return;
  await supabase.from("profiles").upsert({ id: userId, display_name: profile.name, email: profile.email }, { onConflict: "id" });
}
