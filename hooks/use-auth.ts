"use client";

import { useEffect, useState } from "react";
import { createOptionalClient } from "@/lib/supabase/client";
import { useLocalStorageState } from "@/lib/local-storage";
import { STORAGE_KEYS } from "@/lib/storage-keys";
import { createMockSession, mapSupabaseUserToSession, signInWithEmail, signOut, signUpWithEmail } from "@/lib/services/auth-service";
import type { AuthSession, Profile } from "@/types";
import type { AuthResult, LoginInput, RegisterInput } from "@/lib/services/auth-service";

export function useAuth() {
  const [localSession, setLocalSession, localReady] = useLocalStorageState<AuthSession | null>(STORAGE_KEYS.authSession, null);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [ready, setReady] = useState(false);
  const [mode, setMode] = useState<"local" | "supabase">("local");

  useEffect(() => {
    const supabase = createOptionalClient();

    if (!supabase) {
      setSession(localSession);
      setMode("local");
      setReady(localReady);
      return;
    }

    setMode("supabase");
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      const next = mapSupabaseUserToSession(data.session?.user ?? null);
      setSession(next);
      setLocalSession(next);
      setReady(true);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, authSession) => {
      const next = mapSupabaseUserToSession(authSession?.user ?? null);
      setSession(next);
      setLocalSession(next);
      setReady(true);
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, [localReady, localSession, setLocalSession]);

  async function login(input: LoginInput): Promise<AuthResult> {
    const result = await signInWithEmail(input);
    if (result.error || !result.session) return result;
    setSession(result.session);
    setLocalSession(result.session);
    setMode(result.mode);
    return result;
  }

  async function register(input: RegisterInput): Promise<AuthResult> {
    const result = await signUpWithEmail(input);
    if (result.error || !result.session) return result;
    setSession(result.session);
    setLocalSession(result.session);
    setMode(result.mode);
    return result;
  }

  async function logout() {
    await signOut();
    setSession(null);
    setLocalSession(null);
  }

  return {
    session,
    ready,
    mode,
    isAuthenticated: Boolean(session),
    login,
    register,
    loginWithProfile: (profile: Profile) => {
      if (mode === "supabase") return;
      const next = createMockSession(profile);
      setSession(next);
      setLocalSession(next);
    },
    loginWithSocial: async (_provider: AuthSession["provider"]): Promise<AuthResult> => ({
      session: null,
      error: "Google/Apple se activan después desde Supabase Auth Providers.",
      mode,
    }),
    logout,
  };
}
