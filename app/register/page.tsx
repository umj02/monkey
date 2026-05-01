"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCircle2, Eye, EyeOff, MailCheck, RotateCcw } from "lucide-react";
import { MonkeyLogo } from "@/components/monkey-logo";
import { AppInput } from "@/components/app-input";
import { Toast, ToastState } from "@/components/toast";
import { useAuth } from "@/hooks/use-auth";
import { useProfile } from "@/hooks/use-profile";
import { validateRegister } from "@/lib/services/auth-service";
import { useEffect, useState } from "react";

const RESEND_COOLDOWN_SECONDS = 120;
const RATE_LIMIT_COOLDOWN_SECONDS = 180;

function isRateLimitError(message: string) {
  return /rate.?limit|too many|exceeded|over email send rate/i.test(message);
}

export default function RegisterPage() {
  const router = useRouter();
  const { register, loginWithSocial, resendConfirmation } = useAuth();
  const { setProfile } = useProfile();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [pendingConfirmation, setPendingConfirmation] = useState(false);
  const [confirmedEmail, setConfirmedEmail] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const [emailStatus, setEmailStatus] = useState<"idle" | "sent" | "resent" | "rate_limited" | "error">("idle");
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string }>({});
  const [toast, setToast] = useState<ToastState>(null);

  const formLocked = submitting || pendingConfirmation;

  useEffect(() => {
    if (!pendingConfirmation || resendCooldown <= 0) return;
    const timer = window.setInterval(() => {
      setResendCooldown((current) => Math.max(0, current - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [pendingConfirmation, resendCooldown]);

  async function submit() {
    if (pendingConfirmation) return;
    const nextErrors = validateRegister({ name, email, password });
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    const profile = { name: name.trim(), email: email.trim() };
    setSubmitting(true);
    const result = await register({ name: profile.name, email: profile.email, password });
    setSubmitting(false);

    if (result.error) {
      if (isRateLimitError(result.error)) {
        setConfirmedEmail(profile.email);
        setPassword("");
        setShowPassword(false);
        setErrors({});
        setPendingConfirmation(true);
        setEmailStatus("rate_limited");
        setResendCooldown(RATE_LIMIT_COOLDOWN_SECONDS);
        setToast({ message: "No pudimos enviar otro correo ahora. Esperá a que termine el contador.", type: "error" });
        return;
      }
      setErrors({ email: result.error });
      return;
    }

    if (result.needsEmailConfirmation || !result.session) {
      setConfirmedEmail(profile.email);
      setPassword("");
      setShowPassword(false);
      setErrors({});
      setPendingConfirmation(true);
      setEmailStatus("sent");
      setResendCooldown(RESEND_COOLDOWN_SECONDS);
      setToast({ message: "Correo enviado. Revisá tu bandeja antes de pedir otro enlace.", type: "success" });
      return;
    }

    setProfile(profile);
    router.push("/today");
  }

  async function resendEmail() {
    if (!confirmedEmail || resendCooldown > 0 || resending) return;
    setResending(true);
    const result = await resendConfirmation(confirmedEmail);
    setResending(false);

    if (result.error) {
      if (isRateLimitError(result.error)) {
        setEmailStatus("rate_limited");
        setResendCooldown(RATE_LIMIT_COOLDOWN_SECONDS);
        setToast({ message: "No pudimos reenviar el correo todavía. Probá nuevamente cuando termine el contador.", type: "error" });
        return;
      }
      setToast({ message: result.error, type: "error" });
      return;
    }

    setEmailStatus("resent");
    setResendCooldown(RESEND_COOLDOWN_SECONDS);
    setToast({ message: "Te reenviamos el correo de confirmación. Esperá un momento antes de pedir otro.", type: "success" });
  }

  function editEmail() {
    setPendingConfirmation(false);
    setConfirmedEmail("");
    setResendCooldown(0);
    setEmailStatus("idle");
    setToast(null);
  }

  function resendButtonLabel() {
    if (resending) return "Reenviando...";
    if (resendCooldown > 0) {
      return emailStatus === "rate_limited" ? `Reintentar en ${resendCooldown}s` : `Reenviar correo en ${resendCooldown}s`;
    }
    if (emailStatus === "resent") return "Reenviar correo otra vez";
    return "Reenviar correo";
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

        {pendingConfirmation ? (
          <section className={`mt-7 rounded-card border bg-white p-5 text-left shadow-card ${emailStatus === "rate_limited" ? "border-orange-100" : "border-green-100"}`}>
            <div className="flex items-start gap-3">
              <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-full ${emailStatus === "rate_limited" ? "bg-orange-100 text-orange-600" : "bg-green-100 text-monkey-green"}`}>
                {emailStatus === "rate_limited" ? <AlertCircle className="h-6 w-6" /> : <MailCheck className="h-6 w-6" />}
              </span>
              <div className="min-w-0 flex-1">
                <h2 className="text-lg font-black text-monkey-ink">{emailStatus === "rate_limited" ? "Intentá de nuevo en un momento" : "Correo enviado"}</h2>
                <p className="mt-1 text-sm leading-5 text-monkey-muted">
                  {emailStatus === "rate_limited" ? (
                    <>No pudimos enviar otro enlace a <strong className="text-monkey-ink">{confirmedEmail}</strong> porque hubo muchas solicitudes seguidas.</>
                  ) : (
                    <>Enviamos el enlace de confirmación a <strong className="text-monkey-ink">{confirmedEmail}</strong>.</>
                  )}
                </p>
              </div>
            </div>

            <div className={`mt-4 rounded-[18px] p-4 text-sm font-semibold leading-5 ${emailStatus === "rate_limited" ? "bg-orange-50 text-orange-800" : "bg-green-50 text-green-800"}`}>
              <div className="flex gap-2">
                {emailStatus === "rate_limited" ? <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> : <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />}
                <span>
                  {emailStatus === "rate_limited"
                    ? "Estamos recibiendo muchas solicitudes en este momento. Esperá a que termine el contador y volvé a intentarlo."
                    : "Confirmá tu correo para activar tu cuenta. Después vas a poder entrar desde Login."}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={resendEmail}
              disabled={resendCooldown > 0 || resending}
              className="mt-4 flex min-h-12 w-full items-center justify-center gap-2 rounded-pill bg-monkey-green px-4 text-sm font-black text-white shadow-float transition active:scale-95 disabled:bg-gray-200 disabled:text-gray-500 disabled:shadow-none"
            >
              <RotateCcw className="h-4 w-4" />
              {resendButtonLabel()}
            </button>

            <button
              type="button"
              onClick={editEmail}
              className="mt-3 h-11 w-full rounded-pill bg-gray-100 text-sm font-bold text-monkey-muted transition active:scale-95"
            >
              Cambiar datos del registro
            </button>
          </section>
        ) : null}

        <form className="mt-7 space-y-3 text-left" onSubmit={(event) => { event.preventDefault(); submit(); }}>
          <div>
            <AppInput disabled={formLocked} placeholder="Nombre completo" value={name} onChange={(event) => setName(event.target.value)} className={formLocked ? "bg-gray-50 text-gray-500" : undefined} />
            <p className="mt-1 min-h-4 text-xs font-bold text-monkey-pink">{errors.name}</p>
          </div>
          <div>
            <AppInput disabled={formLocked} placeholder="Email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} className={formLocked ? "bg-gray-50 text-gray-500" : undefined} />
            <p className="mt-1 min-h-4 text-xs font-bold text-monkey-pink">{errors.email}</p>
          </div>
          <div>
            <div className="relative">
              <AppInput
                disabled={formLocked}
                placeholder="Contraseña"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className={`pr-12 ${formLocked ? "bg-gray-50 text-gray-500" : ""}`}
              />
              <button
                type="button"
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                onClick={() => setShowPassword((current) => !current)}
                disabled={formLocked}
                className="absolute right-3 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full text-monkey-muted transition hover:bg-gray-100 active:scale-95 disabled:opacity-40"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <p className="mt-1 min-h-4 text-xs font-bold text-monkey-pink">{errors.password}</p>
          </div>
          <button type="submit" disabled={formLocked} className="flex h-14 w-full items-center justify-center rounded-pill bg-monkey-green text-sm font-bold text-white shadow-float transition active:scale-95 disabled:bg-gray-200 disabled:text-gray-500 disabled:shadow-none">{submitting ? "Enviando correo..." : pendingConfirmation ? "Correo enviado" : "Crear cuenta"}</button>
        </form>

        <div className="my-5 flex items-center gap-4 text-xs text-monkey-muted"><span className="h-px flex-1 bg-gray-200" />o<span className="h-px flex-1 bg-gray-200" /></div>
        <div className="space-y-3">
          <button type="button" disabled={pendingConfirmation} onClick={() => social("google")} className="flex h-[52px] w-full items-center justify-center gap-3 rounded-[18px] border border-gray-200 bg-white text-sm font-semibold shadow-sm transition active:scale-[.98] disabled:opacity-45"><img src="/assets/icons/google.png" alt="Google" className="h-5 w-5 object-contain" />Continuar con Google</button>
          <button type="button" disabled={pendingConfirmation} onClick={() => social("apple")} className="flex h-[52px] w-full items-center justify-center gap-3 rounded-[18px] border border-gray-200 bg-white text-sm font-semibold shadow-sm transition active:scale-[.98] disabled:opacity-45"><img src="/assets/icons/apple.png" alt="Apple" className="h-5 w-5 object-contain" />Continuar con Apple</button>
        </div>
        <p className="mt-6 text-center text-sm text-gray-500">¿Ya tenés cuenta? <Link href="/login" className="font-bold text-monkey-green">Entrar</Link></p>
      </section>
    </main>
  );
}
