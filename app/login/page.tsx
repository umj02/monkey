import Link from "next/link";
import { MonkeyLogo } from "@/components/monkey-logo";

export default function LoginPage() {
  return (
    <main className="safe-screen px-6 py-10">
      <MonkeyLogo size={72} />
      <h1 className="mt-6 text-3xl font-bold">¡Hola de nuevo!</h1>
      <p className="mt-1 text-gray-500">Ingresa para continuar.</p>
      <form className="mt-8 space-y-4">
        <input className="h-14 w-full rounded-2xl border border-gray-200 px-4 outline-none focus:border-monkey-green" placeholder="Email" />
        <input className="h-14 w-full rounded-2xl border border-gray-200 px-4 outline-none focus:border-monkey-green" placeholder="Contraseña" type="password" />
        <Link href="/today" className="flex h-14 w-full items-center justify-center rounded-full bg-monkey-green font-bold text-white shadow-soft">
          Entrar
        </Link>
      </form>
      <p className="mt-6 text-center text-sm text-gray-500">
        ¿No tienes cuenta? <Link href="/register" className="font-bold text-monkey-green">Crear cuenta</Link>
      </p>
    </main>
  );
}
