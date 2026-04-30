import { createOptionalClient } from "@/lib/supabase/client";
import type { AuthSession, Profile } from "@/types";

export type LoginInput = { email: string; password: string };
export type RegisterInput = { name: string; email: string; password: string };

export function createMockSession(profile: Profile): AuthSession {
  return {
    userId: "local-user",
    email: profile.email,
    name: profile.name,
    provider: "email",
    signedInAt: new Date().toISOString()
  };
}

export function createSocialMockSession(provider: AuthSession["provider"]): AuthSession {
  return {
    userId: `local-${provider}`,
    email: `${provider}@monkeychecks.local`,
    name: provider === "google" ? "Google User" : "Apple User",
    provider,
    signedInAt: new Date().toISOString()
  };
}

export function validateEmail(email: string) {
  return /^\S+@\S+\.\S+$/.test(email.trim());
}

export function validateLogin(input: LoginInput) {
  const errors: Partial<Record<keyof LoginInput, string>> = {};
  if (!validateEmail(input.email)) errors.email = "Agregá un email válido.";
  if (input.password.trim().length < 6) errors.password = "La contraseña debe tener al menos 6 caracteres.";
  return errors;
}

export function validateRegister(input: RegisterInput) {
  const errors: Partial<Record<keyof RegisterInput, string>> = {};
  if (input.name.trim().length < 2) errors.name = "Agregá tu nombre.";
  if (!validateEmail(input.email)) errors.email = "Agregá un email válido.";
  if (input.password.trim().length < 6) errors.password = "Usá al menos 6 caracteres.";
  return errors;
}

export function mapSupabaseUserToSession(user: { id: string; email?: string | null; user_metadata?: Record<string, unknown> } | null): AuthSession | null {
  if (!user) return null;
  const name = typeof user.user_metadata?.display_name === "string" ? user.user_metadata.display_name : typeof user.user_metadata?.name === "string" ? user.user_metadata.name : "Juan";
  return {
    userId: user.id,
    email: user.email || "",
    name,
    provider: "email",
    signedInAt: new Date().toISOString()
  };
}

export async function signInWithEmail(input: LoginInput) {
  const supabase = createOptionalClient();
  if (!supabase) return { session: createMockSession({ name: "Juan", email: input.email.trim() }), error: null, mode: "local" as const };
  const { data, error } = await supabase.auth.signInWithPassword({ email: input.email.trim(), password: input.password });
  return { session: mapSupabaseUserToSession(data.user), error: error?.message || null, mode: "supabase" as const };
}

export async function signUpWithEmail(input: RegisterInput) {
  const supabase = createOptionalClient();
  if (!supabase) return { session: createMockSession({ name: input.name.trim(), email: input.email.trim() }), error: null, mode: "local" as const };
  const { data, error } = await supabase.auth.signUp({
    email: input.email.trim(),
    password: input.password,
    options: { data: { display_name: input.name.trim(), name: input.name.trim() } }
  });
  return { session: mapSupabaseUserToSession(data.user), error: error?.message || null, mode: "supabase" as const };
}

export async function signOut() {
  const supabase = createOptionalClient();
  if (supabase) await supabase.auth.signOut();
}
