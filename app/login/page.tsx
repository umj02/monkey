"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { MonkeyLogo } from "@/components/monkey-logo";
import { AppInput } from "@/components/app-input";
import { Toast, ToastState } from "@/components/toast";
import { useAuth } from "@/hooks/use-auth";
import { useProfile } from "@/hooks/use-profile";
import { validateLogin } from "@/lib/services/auth-service";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const { login, loginWithSocial } = useAuth();
  const { profile } = useProfile();
  const [email, setEmail] = useState(profile.email);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [toast, setToast] = useState<ToastState>(null);

  async function submit() {
    const nextErrors = validateLogin({ email, password });
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    setSubmitting(true);
    const result = await login({ email, password });
    setSubmitting(false);
    if (result.error || !result.session) {
      setToast({ message: result.error || "No se pudo iniciar sesión.", type: "error" });
      return;
    }
    router.replace("/today");
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
        <h1 className="mt-5 text-2xl font-black tracking-tight">¡Bienvenido de vuelta!</h1>
        <p className="mt-1 text-sm text-monkey-muted">Entrá y seguí organizando tu día</p>
        <form className="mt-7 space-y-3 text-left" onSubmit={(event) => { event.preventDefault(); submit(); }}>
          <div><AppInput placeholder="Email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} /><p className="mt-1 min-h-4 text-xs font-bold text-monkey-pink">{errors.email}</p></div>
          <div>
            <div className="relative">
              <AppInput
                placeholder="Contraseña"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="pr-12"
              />
              <button
                type="button"
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                onClick={() => setShowPassword((current) => !current)}
                className="absolute right-3 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full text-monkey-muted transition hover:bg-gray-100 active:scale-95"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <p className="mt-1 min-h-4 text-xs font-bold text-monkey-pink">{errors.password}</p>
          </div>
          <div className="text-right"><button type="button" onClick={() => setToast({ message: "Luego activamos recuperación de contraseña", type: "success" })} className="text-xs font-bold text-monkey-green">¿Olvidaste tu contraseña?</button></div>
          <button type="submit" disabled={submitting} className="flex h-14 w-full items-center justify-center rounded-pill bg-monkey-green text-sm font-bold text-white shadow-float transition active:scale-95 disabled:opacity-70">{submitting ? "Entrando…" : "Entrar"}</button>
        </form>
        <div className="my-5 flex items-center gap-4 text-xs text-monkey-muted"><span className="h-px flex-1 bg-gray-200" />o<span className="h-px flex-1 bg-gray-200" /></div>
        <div className="space-y-3">
          <button type="button" onClick={() => social("google")} className="flex h-[52px] w-full items-center justify-center gap-3 rounded-[18px] border border-gray-200 bg-white text-sm font-semibold shadow-sm transition active:scale-[.98]"><img src="/assets/icons/google.png" alt="Google" className="h-5 w-5 object-contain" />Continuar con Google</button>
          <button type="button" onClick={() => social("apple")} className="flex h-[52px] w-full items-center justify-center gap-3 rounded-[18px] border border-gray-200 bg-white text-sm font-semibold shadow-sm transition active:scale-[.98]"><img src="/assets/icons/apple.png" alt="Apple" className="h-5 w-5 object-contain" />Continuar con Apple</button>
        </div>
        <p className="mt-6 text-center text-sm text-gray-500">¿No tenés cuenta? <Link href="/register" className="font-bold text-monkey-green">Registrarme</Link></p>
      </section>
    </main>
  );
}
