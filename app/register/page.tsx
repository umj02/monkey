"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Apple } from "lucide-react";
import { MonkeyLogo } from "@/components/monkey-logo";
import { AppInput } from "@/components/app-input";
import { Toast, ToastState } from "@/components/toast";
import { useAuth } from "@/hooks/use-auth";
import { useProfile } from "@/hooks/use-profile";
import { validateRegister } from "@/lib/services/auth-service";
import { useState } from "react";

export default function RegisterPage() {
  const router = useRouter();
  const { register, loginWithSocial } = useAuth();
  const { setProfile } = useProfile();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string }>({});
  const [toast, setToast] = useState<ToastState>(null);

  async function submit() {
    const nextErrors = validateRegister({ name, email, password });
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    const profile = { name: name.trim(), email: email.trim() };
    setSubmitting(true);
    const result = await register({ name: profile.name, email: profile.email, password });
    setSubmitting(false);
    if (result.error) {
      setErrors({ email: result.error });
      return;
    }
    if (result.needsEmailConfirmation || !result.session) {
      setToast({ message: "Revisá tu correo para confirmar la cuenta antes de entrar.", type: "success" });
      return;
    }
    setProfile(profile);
    router.push("/today");
  }

  async function social(provider: "google" | "apple") {
    const result = await loginWithSocial(provider);
    setToast({ message: result.error || "Proveedor no disponible", type: "error" });
  }

  return (
    <main className="app-screen px-6 py-10">
      <Toast toast={toast} onClose={() => setToast(null)} />
      <section className="mx-auto max-w-[360px] text-center">
        <div className="mx-auto w-fit"><MonkeyLogo size={72} /></div>
        <h1 className="mt-5 text-2xl font-black tracking-tight">Crear cuenta</h1>
        <p className="mt-1 text-sm text-monkey-muted">Creá tu cuenta y guardá tu progreso</p>
        <form className="mt-7 space-y-3 text-left" onSubmit={(event) => { event.preventDefault(); submit(); }}>
          <div><AppInput placeholder="Nombre completo" value={name} onChange={(event) => setName(event.target.value)} /><p className="mt-1 min-h-4 text-xs font-bold text-monkey-pink">{errors.name}</p></div>
          <div><AppInput placeholder="Email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} /><p className="mt-1 min-h-4 text-xs font-bold text-monkey-pink">{errors.email}</p></div>
          <div><AppInput placeholder="Contraseña" type="password" value={password} onChange={(event) => setPassword(event.target.value)} /><p className="mt-1 min-h-4 text-xs font-bold text-monkey-pink">{errors.password}</p></div>
          <button type="submit" disabled={submitting} className="flex h-14 w-full items-center justify-center rounded-pill bg-monkey-green text-sm font-bold text-white shadow-float transition active:scale-95 disabled:opacity-70">{submitting ? "Creando..." : "Crear cuenta"}</button>
        </form>
        <div className="my-5 flex items-center gap-4 text-xs text-monkey-muted"><span className="h-px flex-1 bg-gray-200" />o<span className="h-px flex-1 bg-gray-200" /></div>
        <div className="space-y-3">
          <button onClick={() => social("google")} className="flex h-[52px] w-full items-center justify-center gap-3 rounded-[18px] border border-gray-200 bg-white text-sm font-semibold shadow-sm"><span className="text-lg">G</span>Continuar con Google</button>
          <button onClick={() => social("apple")} className="flex h-[52px] w-full items-center justify-center gap-3 rounded-[18px] border border-gray-200 bg-white text-sm font-semibold shadow-sm"><Apple className="h-5 w-5" />Continuar con Apple</button>
        </div>
        <p className="mt-6 text-center text-sm text-gray-500">¿Ya tenés cuenta? <Link href="/login" className="font-bold text-monkey-green">Entrar</Link></p>
      </section>
    </main>
  );
}
