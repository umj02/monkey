"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { BottomNav } from "./bottom-nav";
import { useAuth } from "@/hooks/use-auth";

export function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { session, ready } = useAuth();

  useEffect(() => {
    if (ready && !session) router.replace("/login");
  }, [ready, session, router]);

  if (!ready) {
    return (
      <main className="app-screen grid min-h-dvh place-items-center px-6 text-center">
        <div>
          <div className="mx-auto h-12 w-12 animate-pulse rounded-full bg-monkey-green/20" />
          <p className="mt-4 text-sm font-bold text-monkey-muted">Validando sesión...</p>
        </div>
      </main>
    );
  }

  if (!session) {
    return (
      <main className="app-screen grid min-h-dvh place-items-center px-6 text-center">
        <div>
          <p className="text-lg font-black text-monkey-ink">Necesitás iniciar sesión</p>
          <button onClick={() => router.replace("/login")} className="mt-4 rounded-pill bg-monkey-green px-6 py-3 text-sm font-bold text-white shadow-float">Ir al login</button>
        </div>
      </main>
    );
  }

  return (
    <main className="app-screen pb-[calc(96px+var(--safe-bottom))]">
      {children}
      <BottomNav />
    </main>
  );
}
