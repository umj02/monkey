import { BottomNav } from "./bottom-nav";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="safe-screen relative pb-24">
      {children}
      <BottomNav />
    </main>
  );
}
