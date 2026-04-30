import Link from "next/link";
import { CalendarDays, Home, StickyNote, UserRound } from "lucide-react";

const items = [
  { href: "/today", label: "Hoy", icon: Home },
  { href: "/calendar", label: "Calendario", icon: CalendarDays },
  { href: "/notes", label: "Notas", icon: StickyNote },
  { href: "/profile", label: "Perfil", icon: UserRound }
];

export function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 mx-auto max-w-[430px] border-t border-black/5 bg-white/95 px-5 pb-5 pt-3 backdrop-blur">
      <div className="grid grid-cols-4 gap-2">
        {items.map((item) => (
          <Link key={item.href} href={item.href} className="flex flex-col items-center gap-1 rounded-2xl px-2 py-1 text-xs text-gray-500">
            <item.icon className="h-5 w-5" />
            <span>{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
