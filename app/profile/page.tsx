import { AppShell } from "@/components/app-shell";

export default function ProfilePage() {
  return (
    <AppShell>
      <section className="px-5 pt-8">
        <h1 className="text-2xl font-bold">Mi Perfil</h1>
        <div className="mt-6 rounded-monkey bg-gradient-to-br from-monkey-purple to-monkey-green p-6 text-white shadow-soft">
          <div className="text-6xl">🐵</div>
          <h2 className="mt-3 text-xl font-bold">Juan Pérez</h2>
          <p className="text-white/80">juan@email.com</p>
        </div>
        <div className="mt-6 space-y-3">
          {["Editar información", "Cambiar contraseña", "Notificaciones", "Tema colorido"].map(item => (
            <button key={item} className="flex h-14 w-full items-center justify-between rounded-2xl bg-white px-4 font-semibold shadow-sm">
              {item}
              <span>›</span>
            </button>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
