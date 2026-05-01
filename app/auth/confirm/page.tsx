"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ShieldCheck } from "lucide-react";
import { createOptionalClient } from "@/lib/supabase/client";

type ConfirmState = "checking" | "success" | "error";

export default function ConfirmAccountPage() {
  const router = useRouter();
  const startedRef = useRef(false);
  const [state, setState] = useState<ConfirmState>("checking");
  const [count, setCount] = useState(3);
  const [message, setMessage] = useState("Validando tu correo...");

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    async function confirmAccount() {
      try {
        const supabase = createOptionalClient();
        const currentUrl = typeof window !== "undefined" ? new URL(window.location.href) : null;
        const code = currentUrl?.searchParams.get("code");

        if (supabase && code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) {
            setState("error");
            setMessage("No pudimos validar el enlace. Intentá iniciar sesión o solicitá un nuevo correo.");
            return;
          }

          await supabase.auth.signOut();
        }

        setState("success");
        setMessage("Tu cuenta fue confirmada.");
      } catch {
        setState("error");
        setMessage("Ocurrió un problema al confirmar tu cuenta. Intentá iniciar sesión nuevamente.");
      }
    }

    confirmAccount();
  }, []);

  useEffect(() => {
    if (state !== "success") return;

    const timer = window.setInterval(() => {
      setCount((current) => {
        if (current <= 1) {
          window.clearInterval(timer);
          router.replace("/login");
          return 0;
        }

        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [router, state]);

  return (
    <main className="app-screen relative min-h-dvh overflow-hidden bg-[#F0FDF4] px-5 pb-8 pt-[calc(env(safe-area-inset-top)+34px)] text-monkey-ink">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_24%,rgba(220,252,231,1)_0,rgba(240,253,244,.72)_38%,rgba(255,255,255,.86)_100%)]" />

      <span className="absolute left-10 top-[18%] h-4 w-4 rotate-45 rounded-[4px] bg-monkey-yellow/80" />
      <span className="absolute right-12 top-[22%] h-4 w-4 rotate-12 rounded-[4px] bg-monkey-purple/80" />
      <span className="absolute left-16 top-[38%] h-4 w-4 rotate-45 rounded-[4px] bg-monkey-pink/70" />
      <span className="absolute right-10 top-[41%] h-4 w-4 rotate-12 rounded-[4px] bg-monkey-orange/80" />
      <span className="absolute right-20 top-[14%] h-5 w-3 rotate-[-18deg] rounded-full bg-monkey-green/45" />

      <section className="relative z-10 flex min-h-[calc(100dvh-90px)] flex-col items-center justify-center text-center">
        <div className="grid h-28 w-28 place-items-center rounded-full bg-green-100/80 shadow-[0_0_0_14px_rgba(34,197,94,.10)] animate-pop">
          <div className="grid h-20 w-20 place-items-center rounded-full border-[6px] border-monkey-green bg-white shadow-card">
            <Check className="h-11 w-11 text-monkey-green" strokeWidth={4} />
          </div>
        </div>

        <img
          src="/assets/monkey/success/aprobacion.png"
          alt="Mono celebrando"
          className="mt-8 h-[150px] w-auto object-contain drop-shadow-[0_18px_24px_rgba(17,24,39,.14)] animate-floaty"
        />

        <div className="mt-[-10px] w-full rounded-[28px] bg-white/95 px-6 py-7 shadow-soft backdrop-blur">
          <h1 className="text-[28px] font-black leading-tight tracking-tight">
            {state === "error" ? "Ups, revisemos" : "¡Listo! 💚"}
          </h1>
          <p className="mt-2 text-lg font-extrabold text-monkey-ink">
            {state === "error" ? "No se pudo confirmar tu cuenta" : "Tu cuenta fue confirmada"}
          </p>
          <p className="mx-auto mt-2 max-w-[280px] text-sm leading-6 text-monkey-muted">
            {state === "error" ? message : "Ahora podés iniciar sesión y comenzar a organizar tu día."}
          </p>

          {state === "checking" ? (
            <div className="mx-auto mt-5 grid h-14 w-14 place-items-center rounded-full border-4 border-green-100 border-t-monkey-green text-sm font-black text-monkey-green animate-spin" />
          ) : null}

          {state === "success" ? (
            <>
              <p className="mt-5 text-sm font-bold text-monkey-ink">Redirigiendo al login en</p>
              <div className="mx-auto mt-3 grid h-14 w-14 place-items-center rounded-full border-4 border-monkey-green text-2xl font-black text-monkey-green">
                {count}
              </div>
            </>
          ) : null}

          {state === "error" ? (
            <button
              onClick={() => router.replace("/login")}
              className="mt-6 h-13 w-full rounded-pill bg-monkey-green px-5 py-4 text-sm font-black text-white shadow-float transition active:scale-95"
            >
              Ir al login
            </button>
          ) : null}
        </div>

        <div className="mt-6 flex items-center gap-2 rounded-[18px] bg-green-100 px-4 py-3 text-sm font-bold text-monkey-greenDark">
          <ShieldCheck className="h-5 w-5" />
          Tu cuenta está segura y verificada
        </div>
      </section>
    </main>
  );
}
