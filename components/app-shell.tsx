import { BottomNav } from "./bottom-nav";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="app-screen pb-[calc(96px+var(--safe-bottom))]">
      {children}
      <BottomNav />
    </main>
  );
}
