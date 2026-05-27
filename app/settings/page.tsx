"use client";

import Link from "next/link";
import { Award, Banana, BarChart3, Bell, ClipboardList, ShieldCheck, SlidersHorizontal, Tags, Volume2 } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { useSettings } from "@/hooks/use-settings";
import { useSoundSettings } from "@/hooks/use-sound-settings";

function Toggle({ on, onClick }: { on: boolean; onClick: () => void }) {
  return <button onClick={onClick} className={`relative h-7 w-12 rounded-pill transition ${on ? "bg-monkey-green" : "bg-gray-300"}`} aria-label="Cambiar opción"><span className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${on ? "left-6" : "left-1"}`} /></button>;
}

export default function SettingsPage() {
  const { settings, setSettings } = useSettings();
  const { soundControls, updateSoundControls } = useSoundSettings();
  const appTone = settings.theme === "soft" ? "bg-white/70" : "bg-white";

  return (
    <AppShell>
      <section className="page-pad pt-8">
        <h1 className="text-2xl font-black">Configuración</h1>
        <p className="mt-1 text-sm font-semibold text-monkey-muted">Ajustá la app a tu estilo y mantené tus preferencias al día.</p>
        <div className="mt-6 space-y-5">
          <section>
            <h2 className="mb-2 text-sm font-black">Apariencia</h2>
            <div className={`overflow-hidden rounded-card ${appTone} shadow-card`}>
              <button onClick={() => setSettings((value) => ({ ...value, theme: value.theme === "colorful" ? "soft" : "colorful" }))} className="flex h-14 w-full items-center justify-between border-b border-gray-100 px-4 text-sm font-semibold">
                <span className="flex items-center gap-2"><SlidersHorizontal className="h-4 w-4 text-monkey-purple" /> Configuración</span><span className="text-monkey-muted">{settings.theme === "colorful" ? "Colorido" : "Suave"} ›</span>
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
              <Link href="/challenges" className="flex h-14 w-full items-center justify-between border-b border-gray-100 px-4 text-sm font-semibold"><span className="flex items-center gap-2"><Banana className="h-4 w-4 text-orange-600" /> Retos y bananas</span><span className="text-monkey-muted">Motivación ›</span></Link>
              <Link href="/weekly-summary" className="flex h-14 w-full items-center justify-between border-b border-gray-100 px-4 text-sm font-semibold"><span className="flex items-center gap-2"><ClipboardList className="h-4 w-4 text-monkey-green" /> Resumen semanal</span><span className="text-monkey-muted">Reporte ›</span></Link>
              <Link href="/guardian-share" className="flex h-14 w-full items-center justify-between border-b border-gray-100 px-4 text-sm font-semibold"><span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-monkey-green" /> Vista encargado</span><span className="text-monkey-muted">Compartir ›</span></Link>
              <Link href="/welcome?review=1" className="flex h-14 w-full items-center justify-between border-b border-gray-100 px-4 text-sm font-semibold"><span>Ver guía de uso</span><span className="text-monkey-muted">Aprender ›</span></Link>
              <div id="sounds" className="scroll-mt-6 border-b border-gray-100 px-4 py-4">
                <div className="flex items-center justify-between gap-3 text-sm font-semibold">
                  <span className="flex items-center gap-2"><Volume2 className="h-4 w-4 text-monkey-purple" /> Sonidos</span>
                  <Toggle on={soundControls.master} onClick={() => updateSoundControls({ master: !soundControls.master })} />
                </div>
                <p className="mt-1 text-xs font-bold text-monkey-muted">Controlá música interna, alertas y efectos de la app.</p>
                <div className="mt-4 space-y-3 rounded-[20px] bg-gray-50 p-3">
                  <div className="flex items-center justify-between gap-3 text-xs font-black"><span className="flex items-center gap-2"><Volume2 className="h-4 w-4 text-monkey-blue" /> Música ambiente</span><Toggle on={soundControls.ambientMusic} onClick={() => updateSoundControls({ ambientMusic: !soundControls.ambientMusic })} /></div>
                  <div className="flex items-center justify-between gap-3 text-xs font-black"><span>Efectos de acciones</span><Toggle on={soundControls.actionEffects} onClick={() => updateSoundControls({ actionEffects: !soundControls.actionEffects })} /></div>
                  <div className="flex items-center justify-between gap-3 text-xs font-black"><span className="flex items-center gap-2"><Bell className="h-4 w-4 text-monkey-pink" /> Alertas</span><Toggle on={soundControls.alerts} onClick={() => updateSoundControls({ alerts: !soundControls.alerts })} /></div>
                  <div className="flex items-center justify-between gap-3 text-xs font-black"><span>Recompensas y logros</span><Toggle on={soundControls.rewards} onClick={() => updateSoundControls({ rewards: !soundControls.rewards })} /></div>
                  <div className="flex items-center justify-between gap-3 text-xs font-black"><span>Notificaciones del sistema</span><Toggle on={soundControls.systemNotifications} onClick={() => updateSoundControls({ systemNotifications: !soundControls.systemNotifications })} /></div>
                  <div className="flex items-center justify-between gap-3 text-xs font-black"><span>Silencio rápido</span><Toggle on={soundControls.quickMute} onClick={() => updateSoundControls({ quickMute: !soundControls.quickMute })} /></div>
                  <label className="block text-xs font-black text-monkey-muted">
                    Volumen general · ambiente al 60%
                    <input type="range" min="0" max="1" step="0.05" value={soundControls.volume} onChange={(event) => updateSoundControls({ volume: Number(event.target.value) })} className="mt-2 w-full accent-green-500" />
                  </label>
                </div>
              </div>
              <div className="flex h-14 w-full items-center justify-between px-4 text-sm font-semibold"><span>Guardar avances</span><Toggle on={settings.sync} onClick={() => setSettings((value) => ({ ...value, sync: !value.sync }))} /></div>
            </div>
          </section>
          <section>
            <h2 className="mb-2 text-sm font-black">Acerca de</h2>
            <div className={`overflow-hidden rounded-card ${appTone} shadow-card`}><div className="flex h-14 w-full items-center justify-between px-4 text-sm font-semibold"><span>Versión</span><span className="text-monkey-muted">2.28.1</span></div></div>
          </section>
        </div>
      </section>
    </AppShell>
  );
}
