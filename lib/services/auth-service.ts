import { createOptionalClient, hasSupabaseEnv } from "@/lib/supabase/client";
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
    signedInAt: new Date().toISOString(),
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


function allowLocalAuthFallback() {
  return process.env.NODE_ENV !== "production" && process.env.NEXT_PUBLIC_ALLOW_LOCAL_AUTH === "true";
}

export function mapSupabaseUserToSession(user: { id: string; email?: string | null; user_metadata?: Record<string, unknown> } | null): AuthSession | null {
  if (!user) return null;
  const metadataName = user.user_metadata?.display_name ?? user.user_metadata?.name;
  const name = typeof metadataName === "string" && metadataName.trim().length > 0 ? metadataName : user.email?.split("@")[0] || "Usuario";
  return {
    userId: user.id,
    email: user.email || "",
    name,
    provider: "email",
    signedInAt: new Date().toISOString(),
  };
}

export async function signInWithEmail(input: LoginInput): Promise<AuthResult> {
  const supabase = createOptionalClient();
  if (!supabase) {
    if (hasSupabaseEnv() || !allowLocalAuthFallback()) return { session: null, error: "Supabase no está configurado para producción. Revisá las variables de entorno.", mode: "supabase" };
    return { session: createMockSession({ name: "Juan", email: input.email.trim() }), error: null, mode: "local" };
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email: input.email.trim(), password: input.password });
  if (error) return { session: null, error: error.message, mode: "supabase" };

  const session = mapSupabaseUserToSession(data.session?.user ?? data.user ?? null);
  if (!session) return { session: null, error: "No se pudo crear una sesión válida.", mode: "supabase" };
  return { session, error: null, mode: "supabase" };
}

export async function signUpWithEmail(input: RegisterInput): Promise<AuthResult> {
  const supabase = createOptionalClient();
  if (!supabase) {
    if (hasSupabaseEnv() || !allowLocalAuthFallback()) return { session: null, error: "Supabase no está configurado para producción. Revisá las variables de entorno.", mode: "supabase" };
    return { session: createMockSession({ name: input.name.trim(), email: input.email.trim() }), error: null, mode: "local" };
  }

  const emailRedirectTo = typeof window !== "undefined" ? `${window.location.origin}/auth/confirm` : undefined;

  const { data, error } = await supabase.auth.signUp({
    email: input.email.trim(),
    password: input.password,
    options: {
      data: { display_name: input.name.trim(), name: input.name.trim() },
      emailRedirectTo,
    },
  });

  if (error) return { session: null, error: error.message, mode: "supabase" };

  if (!data.session) {
    return {
      session: null,
      error: null,
      mode: "supabase",
      needsEmailConfirmation: true,
    };
  }

  const session = mapSupabaseUserToSession(data.session.user);
  if (!session) return { session: null, error: "No se pudo crear una sesión válida.", mode: "supabase" };
  return { session, error: null, mode: "supabase" };
}

export async function resendConfirmationEmail(email: string): Promise<{ error: string | null; mode: "local" | "supabase" }> {
  const supabase = createOptionalClient();
  if (!supabase) {
    if (hasSupabaseEnv() || !allowLocalAuthFallback()) return { error: "Supabase no está configurado para producción.", mode: "supabase" };
    return { error: null, mode: "local" };
  }

  const emailRedirectTo = typeof window !== "undefined" ? `${window.location.origin}/auth/confirm` : undefined;

  const { error } = await supabase.auth.resend({
    type: "signup",
    email: email.trim(),
    options: { emailRedirectTo },
  });

  if (error) return { error: error.message, mode: "supabase" };
  return { error: null, mode: "supabase" };
}

export async function signOut(): Promise<void> {
  const supabase = createOptionalClient();
  if (supabase) await supabase.auth.signOut();
}
