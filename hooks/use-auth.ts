"use client";

import { useEffect, useState } from "react";
import { createOptionalClient } from "@/lib/supabase/client";
import { useLocalStorageState } from "@/lib/local-storage";
import { STORAGE_KEYS } from "@/lib/storage-keys";
import { mapSupabaseUserToSession, signInWithEmail, signInWithOAuthProvider, signOut, signUpWithEmail } from "@/lib/services/auth-service";
import type { AuthSession } from "@/types";
import type { LoginInput, RegisterInput } from "@/lib/services/auth-service";

export function useAuth() {
  const [localSession, setLocalSession, localReady] = useLocalStorageState<AuthSession | null>(STORAGE_KEYS.authSession, null);
  const [session, setSession] = useState<AuthSession | null>(localSession);
  const [ready, setReady] = useState(false);
  const [mode, setMode] = useState<"local" | "supabase">("local");

  useEffect(() => {
    const supabase = createOptionalClient();
    if (!supabase) {
      // No auth mock when Supabase is expected. This prevents false positives in production.
      setSession(null);
      setLocalSession(null);
      setMode("local");
      setReady(localReady);
      return;
    }

    setMode("supabase");
    let mounted = true;
    supabase.auth.getUser().then(({ data }) => {
      if (!mounted) return;
      const next = mapSupabaseUserToSession(data.user);
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
  }, [localReady, setLocalSession]);

  async function login(input: LoginInput) {
    const result = await signInWithEmail(input);
    if (result.error || !result.session) return result;
    setSession(result.session);
    setLocalSession(result.session);
    setMode(result.mode);
    return result;
  }

  async function register(input: RegisterInput) {
    const result = await signUpWithEmail(input);
    if (result.error || !result.session) return result;
    setSession(result.session);
    setLocalSession(result.session);
    setMode(result.mode);
    return result;
  }

  async function loginWithSocial(provider: "google" | "apple") {
    return signInWithOAuthProvider(provider);
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
    loginWithSocial,
    logout
  };
}
