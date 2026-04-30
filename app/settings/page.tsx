"use client";

import { AppShell } from "@/components/app-shell";
import { useLocalStorageState } from "@/lib/local-storage";
import type { Settings } from "@/types";

const initialSettings: Settings = { darkMode: false, sounds: true, sync: true, theme: "colorful" };

function Toggle({ on, onClick }: { on: boolean; onClick: () => void }) {
  return <button onClick={onClick} className={`relative h-7 w-12 rounded-pill transition ${on ? "bg-monkey-green" : "bg-gray-300"}`} aria-label="Cambiar opción"><span className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${on ? "left-6" : "left-1"}`} /></button>;
}

export default function SettingsPage() {
  const [settings, setSettings] = useLocalStorageState<Settings>("monkey.settings.v22", initialSettings);

  return (
    <AppShell>
      <section className="page-pad pt-8">
        <h1 className="text-2xl font-black">Configuración</h1>
        <div className="mt-6 space-y-5">
          <section>
            <h2 className="mb-2 text-sm font-black">Apariencia</h2>
            <div className="overflow-hidden rounded-card bg-white shadow-card">
              <button onClick={() => setSettings((value) => ({ ...value, theme: value.theme === "colorful" ? "soft" : "colorful" }))} className="flex h-14 w-full items-center justify-between border-b border-gray-100 px-4 text-sm font-semibold">
                <span>Tema</span><span className="text-monkey-muted">{settings.theme === "colorful" ? "Colorido" : "Suave"} ›</span>
              </button>
              <div className="flex h-14 w-full items-center justify-between px-4 text-sm font-semibold"><span>Modo oscuro</span><Toggle on={settings.darkMode} onClick={() => setSettings((value) => ({ ...value, darkMode: !value.darkMode }))} /></div>
            </div>
          </section>
          <section>
            <h2 className="mb-2 text-sm font-black">General</h2>
            <div className="overflow-hidden rounded-card bg-white shadow-card">
              <button className="flex h-14 w-full items-center justify-between border-b border-gray-100 px-4 text-sm font-semibold"><span>Idioma</span><span className="text-monkey-muted">Español ›</span></button>
              <div className="flex h-14 w-full items-center justify-between border-b border-gray-100 px-4 text-sm font-semibold"><span>Sonidos</span><Toggle on={settings.sounds} onClick={() => setSettings((value) => ({ ...value, sounds: !value.sounds }))} /></div>
              <div className="flex h-14 w-full items-center justify-between px-4 text-sm font-semibold"><span>Sincronización</span><Toggle on={settings.sync} onClick={() => setSettings((value) => ({ ...value, sync: !value.sync }))} /></div>
            </div>
          </section>
          <section>
            <h2 className="mb-2 text-sm font-black">Acerca de</h2>
            <div className="overflow-hidden rounded-card bg-white shadow-card"><div className="flex h-14 w-full items-center justify-between px-4 text-sm font-semibold"><span>Versión</span><span className="text-monkey-muted">2.2.0</span></div></div>
          </section>
        </div>
      </section>
    </AppShell>
  );
}
