"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { BottomNav } from "./bottom-nav";
import { useAuth } from "@/hooks/use-auth";
import { BrowserAlertEngine } from "@/components/browser-alert-engine";

export function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { ready, isAuthenticated } = useAuth();

  useEffect(() => {
    if (ready && !isAuthenticated) {
      router.replace(`/login?next=${encodeURIComponent(pathname || "/today")}`);
    }
  }, [ready, isAuthenticated, pathname, router]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Push real se configura en v2.16; este registro prepara PWA/notificaciones.
    });
  }, []);

  if (!ready) {
    return (
      <main className="app-screen grid place-items-center px-6 text-center">
        <div>
          <div className="mx-auto h-14 w-14 animate-pulse rounded-full bg-monkey-green/20" />
          <p className="mt-4 text-sm font-bold text-monkey-muted">Cargando Monkey Checks...</p>
        </div>
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <main className="app-screen grid place-items-center px-6 text-center">
        <p className="text-sm font-bold text-monkey-muted">Redirigiendo al inicio de sesión...</p>
      </main>
    );
  }

  return (
    <main className="app-screen pb-[calc(96px+var(--safe-bottom))]">
      {children}
      <BrowserAlertEngine />
      <BottomNav />
    </main>
  );
}
