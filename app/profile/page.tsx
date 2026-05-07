"use client";

import Link from "next/link";
import { Award, BarChart3, Bell, ChevronRight, Lock, LogOut, Palette, Pencil } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Field } from "@/components/field";
import { FormSheet } from "@/components/form-sheet";
import { MonkeyAvatar } from "@/components/monkey-avatar";
import { Toast, ToastState } from "@/components/toast";
import { useAuth } from "@/hooks/use-auth";
import { useProfile } from "@/hooks/use-profile";
import { validateEmail } from "@/lib/services/auth-service";
import { useState } from "react";

export default function ProfilePage() {
  const { profile, setProfile } = useProfile();
  const { session, logout } = useAuth();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});
  const [toast, setToast] = useState<ToastState>(null);

  function notify(message: string) { setToast({ message, type: "success" }); window.setTimeout(() => setToast(null), 2200); }
  function openEdit() { setName(profile.name); setEmail(profile.email); setErrors({}); setSheetOpen(true); }
  function submit() {
    const nextErrors: { name?: string; email?: string } = {};
    if (name.trim().length < 2) nextErrors.name = "Agregá un nombre válido.";
    if (!validateEmail(email)) nextErrors.email = "Agregá un email válido.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    setProfile({ ...profile, name: name.trim(), email: email.trim() });
    setSheetOpen(false);
    notify("Perfil actualizado");
  }

  const rows = [
    { label: "Editar información", icon: Pencil, action: openEdit },
    { label: "Cambiar contraseña", icon: Lock, action: () => notify("Función lista para activar recuperación con Supabase Auth") },
    { label: "Analítica", icon: BarChart3, href: "/analytics" },
    { label: "Logros y medallas", icon: Award, href: "/achievements" },
    { label: "Notificaciones", icon: Bell, href: "/reminders" },
    { label: "Tema", icon: Palette, href: "/settings" },
    { label: session ? "Cerrar sesión" : "Sesión inactiva", icon: LogOut, action: () => { logout(); notify("Sesión cerrada"); } }
  ];

  return (
    <AppShell>
      <Toast toast={toast} onClose={() => setToast(null)} />
      <section className="page-pad pt-8">
        <h1 className="text-2xl font-black">Mi Perfil</h1>
        <section className="mt-6 rounded-card bg-gradient-to-br from-monkey-purple to-monkey-green p-5 text-white shadow-soft">
          <div className="mx-auto grid h-24 w-24 place-items-center rounded-full bg-white/25"><MonkeyAvatar size={76} variant="face" /></div>
          <h2 className="mt-3 text-center text-xl font-black">{profile.name}</h2>
          <p className="text-center text-sm text-white/80">{profile.email}</p>
          <p className="mt-2 text-center text-xs font-bold text-white/70">{session ? `Sesión activa: ${session.provider}` : "Sin sesión activa"}</p>
        </section>
        <div className="mt-6 space-y-3">
          {rows.map((row) => {
            const content = <><span className="flex items-center gap-3"><row.icon className="h-4 w-4 text-monkey-muted" />{row.label}</span><ChevronRight className="h-4 w-4 text-monkey-muted" /></>;
            if (row.href) return <Link key={row.label} href={row.href} className="flex h-14 items-center justify-between rounded-[18px] bg-white px-4 text-sm font-bold shadow-card transition active:scale-[.98]">{content}</Link>;
            return <button key={row.label} onClick={row.action} className="flex h-14 w-full items-center justify-between rounded-[18px] bg-white px-4 text-sm font-bold shadow-card transition active:scale-[.98]">{content}</button>;
          })}
        </div>
      </section>
      <FormSheet open={sheetOpen} title="Editar perfil" subtitle="Estos datos se sincronizan con Supabase cuando hay sesión activa." onClose={() => setSheetOpen(false)} onSubmit={submit} submitLabel="Guardar perfil">
        <Field label="Nombre" value={name} onChange={(e) => setName(e.target.value)} placeholder="Tu nombre" error={errors.name} />
        <Field label="Email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@email.com" error={errors.email} />
      </FormSheet>
    </AppShell>
  );
}
