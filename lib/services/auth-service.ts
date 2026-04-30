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
