"use client";

import Image from "next/image";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowRight, X } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useProfile } from "@/hooks/use-profile";
import { cn } from "@/lib/utils";

type WelcomeCard = {
  id: string;
  image: string;
  eyebrow?: string;
  titleGreen: string;
  titleDark?: string;
  titleSingle?: string;
  description: string;
  alt: string;
};

const cards: WelcomeCard[] = [
  {
    id: "tu-dia",
    image: "/assets/onboarding/tu-dia-01.png",
    titleGreen: "Tu día en",
    titleDark: "un solo lugar",
    description: "En Hoy vas a ver tus actividades,\nrecordatorios y calendario\nen un solo lugar.",
    alt: "Pantalla de Hoy con actividades, recordatorios y calendario en un solo lugar.",
  },
  {
    id: "actividades",
    image: "/assets/onboarding/actividades-02.png",
    titleGreen: "Creá actividades",
    titleDark: "rápidas",
    description: "Tocá el botón verde + para agregar\nalgo a tu día: estudiar, tomar agua,\nentrenar, dormir o cualquier rutina.",
    alt: "Formulario de nueva actividad con tipo, hora y alerta.",
  },
  {
    id: "calendario",
    image: "/assets/onboarding/calendario-03.png",
    titleGreen: "Planificá",
    titleDark: "por horas",
    description: "En Calendario podés organizar actividades\npor día, repetirlas y ver bloques largos\ncon tareas internas.",
    alt: "Calendario por horas con actividades organizadas en bloques.",
  },
  {
    id: "alertas",
    image: "/assets/onboarding/alertas-04.png",
    titleGreen: "No se te",
    titleDark: "olvida nada",
    description: "Recibí recordatorios aunque no tengas\nla app abierta. En iPhone, agregala\na pantalla de inicio para mejores alertas.",
    alt: "Recordatorios y notificación de Monkey Checks.",
  },
  {
    id: "avances",
    image: "/assets/onboarding/avances-05.png",
    titleGreen: "Marcá",
    titleDark: "avances",
    description: "Cuando completás una actividad,\ndesaparece de Hoy con una animación\ny queda registrada en Calendario.",
    alt: "Actividad completada con opción para deshacer.",
  },
  {
    id: "wallet",
    image: "/assets/onboarding/wallet-06.png",
    titleGreen: "Controlá",
    titleDark: "tu dinero",
    description: "Separá ingresos, gastos variables,\ngastos planificados, ahorros y metas.",
    alt: "Wallet con ingresos, gastos variables, gastos planificados, ahorros y metas.",
  },
  {
    id: "medallas",
    image: "/assets/onboarding/medallas-07.png",
    titleGreen: "Ganate",
    titleDark: "medallas",
    description: "Cumplí rutinas, completá categorías\ny mantené constancia para desbloquear logros.",
    alt: "Pantalla de logros con medallas, rachas y progreso.",
  },
  {
    id: "listo",
    image: "/assets/onboarding/lograste-08.png",
    titleGreen: "¡Todo",
    titleDark: "listo!",
    description: "Empezá con una actividad pequeña.\nMonkey Checks te ayuda a avanzar\npaso a paso.",
    alt: "Mono celebrando con cards de Hoy, Calendario, Wallet y Logros.",
  },
];

function WelcomeTitle({ card }: { card: WelcomeCard }) {
  return (
    <div className="pointer-events-none absolute left-0 right-0 top-[7.2%] z-10 px-7 text-center sm:top-[7.8%]">
      <h1 className="mx-auto max-w-[300px] text-[34px] font-black leading-[.96] tracking-[-.05em] text-monkey-ink drop-shadow-[0_8px_18px_rgba(17,24,39,.07)] sm:max-w-[330px] sm:text-[40px]">
        <span className="block text-monkey-green">{card.titleGreen}</span>
        {card.titleDark ? <span className="block text-monkey-ink">{card.titleDark}</span> : null}
      </h1>
      <p className="mx-auto mt-3 max-w-[278px] whitespace-pre-line text-[13.5px] font-bold leading-[1.38] text-monkey-ink/82 sm:mt-4 sm:max-w-[315px] sm:text-[15px]">
        {card.description}
      </p>
    </div>
  );
}


function WelcomePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reviewMode = searchParams.get("review") === "1";
  const { ready: authReady, isAuthenticated } = useAuth();
  const { profile, setProfile, ready: profileReady } = useProfile();
  const [index, setIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const active = cards[index];
  const isFirst = index === 0;
  const isLast = index === cards.length - 1;

  useEffect(() => {
    if (authReady && !isAuthenticated) {
      router.replace(`/login?next=${encodeURIComponent("/welcome")}`);
    }
  }, [authReady, isAuthenticated, router]);

  const nextLabel = useMemo(() => (isLast ? "Ir a Hoy" : "Siguiente"), [isLast]);

  function finish() {
    if (!profile.hasCompletedOnboarding) {
      setProfile({ ...profile, hasCompletedOnboarding: true });
    }
    router.replace("/today");
  }

  function next() {
    if (isLast) return finish();
    setIndex((value) => Math.min(cards.length - 1, value + 1));
  }

  function back() {
    setIndex((value) => Math.max(0, value - 1));
  }

  function handleTouchEnd(x: number) {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - x;
    touchStartX.current = null;
    if (Math.abs(diff) < 40) return;
    if (diff > 0) next();
    else back();
  }

  if (!authReady || !profileReady || !isAuthenticated) {
    return (
      <main className="app-screen grid place-items-center px-6 text-center">
        <div>
          <div className="mx-auto h-14 w-14 animate-pulse rounded-full bg-monkey-green/20" />
          <p className="mt-4 text-sm font-bold text-monkey-muted">Preparando la guía...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="app-screen overflow-hidden bg-[#F7F9FC] px-4 py-[calc(14px+var(--safe-top))]">
      <section className="relative mx-auto flex min-h-[calc(100dvh-28px-var(--safe-top)-var(--safe-bottom))] max-w-[410px] flex-col items-center justify-center gap-3">
        <div className="flex h-9 w-full items-center justify-end px-1">
          {reviewMode ? (
            <button
              type="button"
              onClick={() => router.replace("/today")}
              className="inline-flex items-center gap-1.5 rounded-full bg-white/90 px-4 py-2 text-[12px] font-black text-monkey-muted shadow-[0_10px_26px_rgba(17,24,39,.08)] backdrop-blur transition hover:-translate-y-0.5 active:scale-95"
            >
              <X className="h-4 w-4" /> Cerrar guía
            </button>
          ) : isFirst ? (
            <button
              type="button"
              onClick={finish}
              className="inline-flex items-center rounded-full bg-white/90 px-4 py-2 text-[12px] font-black text-monkey-muted shadow-[0_10px_26px_rgba(17,24,39,.08)] backdrop-blur transition hover:-translate-y-0.5 active:scale-95"
            >
              Omitir guía
            </button>
          ) : null}
        </div>

        <div
          className="relative w-full overflow-hidden rounded-[30px] bg-white shadow-[0_22px_70px_rgba(17,24,39,.12)] animate-welcomeCard"
          onTouchStart={(event) => { touchStartX.current = event.changedTouches[0]?.clientX ?? null; }}
          onTouchEnd={(event) => handleTouchEnd(event.changedTouches[0]?.clientX ?? 0)}
        >
          <div className="relative aspect-[2/3] w-full min-h-[590px] max-h-[calc(100dvh-116px-var(--safe-top)-var(--safe-bottom))]">
            <Image
              key={active.id}
              src={active.image}
              alt={active.alt}
              fill
              priority={index <= 1}
              sizes="410px"
              className="select-none object-cover animate-welcomeImage"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,.95)_0%,rgba(255,255,255,.72)_22%,rgba(255,255,255,.06)_41%,rgba(255,255,255,0)_68%,rgba(255,255,255,.90)_100%)]" />
            <WelcomeTitle card={active} />
          </div>

          <div className="absolute left-1/2 top-[3.4%] z-30 flex -translate-x-1/2 gap-2.5" aria-label={`Paso ${index + 1} de ${cards.length}`}>
            {cards.map((card, dotIndex) => (
              <button
                key={card.id}
                type="button"
                aria-label={`Ir al paso ${dotIndex + 1}`}
                onClick={() => setIndex(dotIndex)}
                className={cn(
                  "h-3 w-3 rounded-full transition-all duration-300",
                  dotIndex < index
                    ? "bg-monkey-green shadow-[0_6px_16px_rgba(34,197,94,.28)]"
                    : dotIndex === index
                      ? "border-2 border-monkey-green bg-white"
                      : "bg-gray-300/90",
                )}
              />
            ))}
          </div>

          <div className={cn("absolute bottom-[3.2%] left-[6%] right-[6%] z-30 grid gap-3", isFirst ? "grid-cols-1" : "grid-cols-[.62fr_1.38fr]")}> 
            {!isFirst ? (
              <button
                type="button"
                onClick={back}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-[20px] bg-white text-[15px] font-black text-monkey-ink shadow-[0_12px_32px_rgba(17,24,39,.10)] transition hover:-translate-y-0.5 active:scale-95"
              >
                <ArrowLeft className="h-4 w-4" /> Atrás
              </button>
            ) : null}

            <button
              type="button"
              onClick={next}
              className="inline-flex h-12 items-center justify-center gap-3 rounded-[20px] bg-gradient-to-r from-[#55C432] to-[#1CA80B] text-[17px] font-black text-white shadow-[0_18px_36px_rgba(34,197,94,.28)] transition hover:-translate-y-0.5 active:scale-95"
            >
              {nextLabel}
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}

export default function WelcomePage() {
  return (
    <Suspense
      fallback={
        <main className="app-screen grid place-items-center px-6 text-center">
          <div>
            <div className="mx-auto h-14 w-14 animate-pulse rounded-full bg-monkey-green/20" />
            <p className="mt-4 text-sm font-bold text-monkey-muted">Preparando la guía...</p>
          </div>
        </main>
      }
    >
      <WelcomePageContent />
    </Suspense>
  );
}
