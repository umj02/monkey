"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { BottomNav } from "./bottom-nav";
import { useAuth } from "@/hooks/use-auth";
import { useProfile } from "@/hooks/use-profile";
import { BrowserAlertEngine } from "@/components/browser-alert-engine";
import { AchievementRewardEngine } from "@/components/achievement-reward-engine";
import { SoundQuickControls } from "@/components/sound-quick-controls";

export function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { ready, isAuthenticated } = useAuth();
  const { profile, ready: profileReady } = useProfile();

  useEffect(() => {
    if (ready && !isAuthenticated) {
      router.replace("/");
    }
  }, [ready, isAuthenticated, router]);

  useEffect(() => {
    if (!ready || !profileReady || !isAuthenticated) return;
    if (!profile.hasCompletedOnboarding) {
      router.replace("/welcome");
    }
  }, [ready, profileReady, isAuthenticated, profile.hasCompletedOnboarding, router]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Service worker requerido para PWA y push en segundo plano.
    });
  }, []);

  if (!ready || (isAuthenticated && !profileReady)) {
    return (
      <main className="app-screen grid place-items-center px-6 text-center">
        <div>
          <div className="mx-auto h-14 w-14 animate-pulse rounded-full bg-monkey-green/20" />
          <p className="mt-4 text-sm font-bold text-monkey-muted">Preparando Monkey Checks…</p>
        </div>
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <main className="app-screen grid place-items-center px-6 text-center">
        <p className="text-sm font-bold text-monkey-muted">Volviendo al inicio…</p>
      </main>
    );
  }

  if (!profile.hasCompletedOnboarding) {
    return (
      <main className="app-screen grid place-items-center px-6 text-center">
        <div>
          <div className="mx-auto h-14 w-14 animate-pulse rounded-full bg-monkey-green/20" />
          <p className="mt-4 text-sm font-bold text-monkey-muted">Preparando tu bienvenida…</p>
        </div>
      </main>
    );
  }

  return (
    <main className="app-screen pb-[calc(96px+var(--safe-bottom))]">
      {children}
      <SoundQuickControls />
      <BrowserAlertEngine />
      <AchievementRewardEngine />
      <BottomNav />
    </main>
  );
}
