"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Banana, CalendarDays, Home, StickyNote, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/today", label: "Hoy", icon: Home },
  { href: "/calendar", label: "Calendario", icon: CalendarDays },
  { href: "/notes", label: "Notas", icon: StickyNote },
  { href: "/wallet", label: "Bananas", icon: Banana },
  { href: "/profile", label: "Cuenta", icon: UserRound }
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-[430px] border-t border-black/5 bg-white/95 px-4 pb-[calc(14px+var(--safe-bottom))] pt-3 backdrop-blur-xl">
      <div className="grid grid-cols-5 gap-1">
        {items.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex flex-col items-center gap-1 rounded-2xl px-1 py-1 text-[10px] font-semibold transition active:scale-95",
                active ? "text-monkey-green" : "text-gray-500"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
