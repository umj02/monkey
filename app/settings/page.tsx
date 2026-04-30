import { AppShell } from "@/components/app-shell";

const groups = [
  { title: "Apariencia", rows: ["Tema colorido", "Modo oscuro"] },
  { title: "General", rows: ["Idioma · Español", "Sonidos", "Sincronización"] },
  { title: "Acerca de", rows: ["Versión 2.0.0"] }
];

export default function SettingsPage() {
  return (
    <AppShell>
      <section className="page-pad pt-8">
        <h1 className="text-2xl font-black">Configuración</h1>
        <div className="mt-6 space-y-5">
          {groups.map((group) => (
            <section key={group.title}>
              <h2 className="mb-2 text-sm font-black">{group.title}</h2>
              <div className="overflow-hidden rounded-card bg-white shadow-card">
                {group.rows.map((row) => {
                  const toggle = row === "Modo oscuro" || row === "Sonidos" || row === "Sincronización";
                  return (
                    <button key={row} className="flex h-14 w-full items-center justify-between border-b border-gray-100 px-4 text-sm font-semibold last:border-b-0">
                      <span>{row}</span>
                      {toggle ? <span className="relative h-7 w-12 rounded-pill bg-monkey-green"><span className="absolute left-6 top-1 h-5 w-5 rounded-full bg-white" /></span> : <span className="text-monkey-muted">›</span>}
                    </button>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
