"use client";

import Link from "next/link";
import { Award, BarChart3, ClipboardList, ShieldCheck, Tags } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { useSettings } from "@/hooks/use-settings";

function Toggle({ on, onClick }: { on: boolean; onClick: () => void }) {
  return <button onClick={onClick} className={`relative h-7 w-12 rounded-pill transition ${on ? "bg-monkey-green" : "bg-gray-300"}`} aria-label="Cambiar opción"><span className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${on ? "left-6" : "left-1"}`} /></button>;
}

export default function SettingsPage() {
  const { settings, setSettings } = useSettings();
  const appTone = settings.theme === "soft" ? "bg-white/70" : "bg-white";

  return (
    <AppShell>
      <section className="page-pad pt-8">
        <h1 className="text-2xl font-black">Configuración</h1>
        <p className="mt-1 text-sm font-semibold text-monkey-muted">Preparado para sincronizar estas preferencias con Supabase.</p>
        <div className="mt-6 space-y-5">
          <section>
            <h2 className="mb-2 text-sm font-black">Apariencia</h2>
            <div className={`overflow-hidden rounded-card ${appTone} shadow-card`}>
              <button onClick={() => setSettings((value) => ({ ...value, theme: value.theme === "colorful" ? "soft" : "colorful" }))} className="flex h-14 w-full items-center justify-between border-b border-gray-100 px-4 text-sm font-semibold">
                <span>Tema</span><span className="text-monkey-muted">{settings.theme === "colorful" ? "Colorido" : "Suave"} ›</span>
              </button>
              <div className="flex h-14 w-full items-center justify-between px-4 text-sm font-semibold"><span>Modo oscuro</span><Toggle on={settings.darkMode} onClick={() => setSettings((value) => ({ ...value, darkMode: !value.darkMode }))} /></div>
            </div>
          </section>
          <section>
            <h2 className="mb-2 text-sm font-black">General</h2>
            <div className={`overflow-hidden rounded-card ${appTone} shadow-card`}>
              <button className="flex h-14 w-full items-center justify-between border-b border-gray-100 px-4 text-sm font-semibold"><span>Idioma</span><span className="text-monkey-muted">Español ›</span></button>
              <Link href="/settings/categories" className="flex h-14 w-full items-center justify-between border-b border-gray-100 px-4 text-sm font-semibold"><span className="flex items-center gap-2"><Tags className="h-4 w-4 text-monkey-green" /> Categorías e iconos</span><span className="text-monkey-muted">Editar ›</span></Link>
              <Link href="/analytics" className="flex h-14 w-full items-center justify-between border-b border-gray-100 px-4 text-sm font-semibold"><span className="flex items-center gap-2"><BarChart3 className="h-4 w-4 text-monkey-purple" /> Analítica</span><span className="text-monkey-muted">Ver avances ›</span></Link>
              <Link href="/achievements" className="flex h-14 w-full items-center justify-between border-b border-gray-100 px-4 text-sm font-semibold"><span className="flex items-center gap-2"><Award className="h-4 w-4 text-monkey-yellow" /> Logros</span><span className="text-monkey-muted">Medallas ›</span></Link>
              <Link href="/weekly-summary" className="flex h-14 w-full items-center justify-between border-b border-gray-100 px-4 text-sm font-semibold"><span className="flex items-center gap-2"><ClipboardList className="h-4 w-4 text-monkey-green" /> Resumen semanal</span><span className="text-monkey-muted">Reporte ›</span></Link>
              <Link href="/guardian-share" className="flex h-14 w-full items-center justify-between border-b border-gray-100 px-4 text-sm font-semibold"><span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-monkey-green" /> Vista encargado</span><span className="text-monkey-muted">Compartir ›</span></Link>
              <Link href="/welcome?review=1" className="flex h-14 w-full items-center justify-between border-b border-gray-100 px-4 text-sm font-semibold"><span>Ver guía de uso</span><span className="text-monkey-muted">Aprender ›</span></Link>
              <div className="flex h-14 w-full items-center justify-between border-b border-gray-100 px-4 text-sm font-semibold"><span>Sonidos</span><Toggle on={settings.sounds} onClick={() => setSettings((value) => ({ ...value, sounds: !value.sounds }))} /></div>
              <div className="flex h-14 w-full items-center justify-between px-4 text-sm font-semibold"><span>Sincronización</span><Toggle on={settings.sync} onClick={() => setSettings((value) => ({ ...value, sync: !value.sync }))} /></div>
            </div>
          </section>
          <section>
            <h2 className="mb-2 text-sm font-black">Acerca de</h2>
            <div className={`overflow-hidden rounded-card ${appTone} shadow-card`}><div className="flex h-14 w-full items-center justify-between px-4 text-sm font-semibold"><span>Versión</span><span className="text-monkey-muted">2.27.0</span></div></div>
          </section>
        </div>
      </section>
    </AppShell>
  );
}
