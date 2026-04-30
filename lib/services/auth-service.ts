import { createOptionalClient } from "@/lib/supabase/client";
import type { AuthSession, Profile } from "@/types";

export type LoginInput = { email: string; password: string };
export type RegisterInput = { name: string; email: string; password: string };
export type AuthResult = {
  session: AuthSession | null;
  error: string | null;
  mode: "local" | "supabase";
  needsEmailConfirmation?: boolean;
};

export function createMockSession(profile: Profile): AuthSession {
  return {
    userId: "local-user",
    email: profile.email,
    name: profile.name,
    provider: "email",
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
  const name = typeof user.user_metadata?.display_name === "string" ? user.user_metadata.display_name : typeof user.user_metadata?.name === "string" ? user.user_metadata.name : user.email?.split("@")[0] || "Usuario";
  return {
    userId: user.id,
    email: user.email || "",
    name,
    provider: "email",
    signedInAt: new Date().toISOString()
  };
}

export async function signInWithEmail(input: LoginInput): Promise<AuthResult> {
  const supabase = createOptionalClient();
  if (!supabase) {
    return {
      session: null,
      error: "Faltan variables de Supabase. Revisá NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY.",
      mode: "local"
    };
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email: input.email.trim(), password: input.password });
  if (error) return { session: null, error: error.message, mode: "supabase" };
  if (!data.session || !data.user) {
    return { session: null, error: "No se pudo iniciar sesión. Revisá si el correo está confirmado.", mode: "supabase" };
  }
  return { session: mapSupabaseUserToSession(data.user), error: null, mode: "supabase" };
}

export async function signUpWithEmail(input: RegisterInput): Promise<AuthResult> {
  const supabase = createOptionalClient();
  if (!supabase) {
    return {
      session: null,
      error: "Faltan variables de Supabase. Revisá NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY.",
      mode: "local"
    };
  }

  const { data, error } = await supabase.auth.signUp({
    email: input.email.trim(),
    password: input.password,
    options: { data: { display_name: input.name.trim(), name: input.name.trim() } }
  });

  if (error) return { session: null, error: error.message, mode: "supabase" };

  // Supabase returns user but no session when email confirmation is enabled.
  if (!data.session || !data.user) {
    return {
      session: null,
      error: null,
      mode: "supabase",
      needsEmailConfirmation: true
    };
  }

  return { session: mapSupabaseUserToSession(data.user), error: null, mode: "supabase" };
}

export async function signInWithOAuthProvider(provider: "google" | "apple") {
  const supabase = createOptionalClient();
  if (!supabase) return { error: "Faltan variables de Supabase para iniciar con proveedor externo." };
  const redirectTo = typeof window !== "undefined" ? `${window.location.origin}/today` : undefined;
  const { error } = await supabase.auth.signInWithOAuth({ provider, options: { redirectTo } });
  return { error: error?.message || null };
}

export async function signOut() {
  const supabase = createOptionalClient();
  if (supabase) await supabase.auth.signOut();
}
