"use client";

import Link from "next/link";
import { Bell, ChevronRight, Lock, Palette, Pencil } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { MonkeyAvatar } from "@/components/monkey-avatar";
import { useLocalStorageState } from "@/lib/local-storage";
import type { Profile } from "@/types";

const initialProfile: Profile = { name: "Juan Pérez", email: "juanperez@email.com" };

export default function ProfilePage() {
  const [profile, setProfile] = useLocalStorageState<Profile>("monkey.profile.v22", initialProfile);

  function editProfile() {
    const name = window.prompt("Nombre", profile.name)?.trim();
    if (!name) return;
    const email = window.prompt("Email", profile.email)?.trim() || profile.email;
    setProfile({ name, email });
  }

  const rows = [
    { label: "Editar información", icon: Pencil, action: editProfile },
    { label: "Cambiar contraseña", icon: Lock, action: () => window.alert("Flujo mock listo. Luego lo conectamos con Supabase Auth.") },
    { label: "Notificaciones", icon: Bell, href: "/reminders" },
    { label: "Tema", icon: Palette, href: "/settings" }
  ];

  return (
    <AppShell>
      <section className="page-pad pt-8">
        <h1 className="text-2xl font-black">Mi Perfil</h1>
        <section className="mt-6 rounded-card bg-gradient-to-br from-monkey-purple to-monkey-green p-5 text-white shadow-soft">
          <div className="mx-auto grid h-24 w-24 place-items-center rounded-full bg-white/25"><MonkeyAvatar size={76} variant="face" /></div>
          <h2 className="mt-3 text-center text-xl font-black">{profile.name}</h2>
          <p className="text-center text-sm text-white/80">{profile.email}</p>
        </section>
        <div className="mt-6 space-y-3">
          {rows.map((row) => {
            const content = <><span className="flex items-center gap-3"><row.icon className="h-4 w-4 text-monkey-muted" />{row.label}</span><ChevronRight className="h-4 w-4 text-monkey-muted" /></>;
            if (row.href) return <Link key={row.label} href={row.href} className="flex h-14 items-center justify-between rounded-[18px] bg-white px-4 text-sm font-bold shadow-card transition active:scale-[.98]">{content}</Link>;
            return <button key={row.label} onClick={row.action} className="flex h-14 w-full items-center justify-between rounded-[18px] bg-white px-4 text-sm font-bold shadow-card transition active:scale-[.98]">{content}</button>;
          })}
        </div>
      </section>
    </AppShell>
  );
}
