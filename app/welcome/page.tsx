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
    <div className="pointer-events-none absolute left-0 right-0 top-[9%] z-10 px-7 text-center">
      <h1 className="mx-auto max-w-[320px] text-[41px] font-black leading-[.98] tracking-[-.045em] text-monkey-ink drop-shadow-[0_10px_22px_rgba(17,24,39,.08)] sm:text-[46px]">
        <span className="block text-monkey-green">{card.titleGreen}</span>
        {card.titleDark ? <span className="block text-monkey-ink">{card.titleDark}</span> : null}
      </h1>
      <p className="mx-auto mt-5 max-w-[310px] whitespace-pre-line text-[16px] font-semibold leading-[1.45] text-monkey-ink/90 sm:text-[17px]">
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
    <main className="app-screen overflow-hidden bg-[#F7F9FC] px-4 py-[calc(18px+var(--safe-top))]">
      <section className="relative mx-auto flex min-h-[calc(100dvh-36px-var(--safe-top)-var(--safe-bottom))] max-w-[390px] flex-col items-center justify-center">
        <div
          className="relative w-full overflow-hidden rounded-[30px] bg-white shadow-[0_22px_70px_rgba(17,24,39,.12)] animate-welcomeCard"
          onTouchStart={(event) => { touchStartX.current = event.changedTouches[0]?.clientX ?? null; }}
          onTouchEnd={(event) => handleTouchEnd(event.changedTouches[0]?.clientX ?? 0)}
        >
          <div className="relative aspect-[2/3] w-full">
            <Image
              key={active.id}
              src={active.image}
              alt={active.alt}
              fill
              priority={index <= 1}
              sizes="390px"
              className="select-none object-cover animate-welcomeImage"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,.92)_0%,rgba(255,255,255,.62)_24%,rgba(255,255,255,0)_43%,rgba(255,255,255,0)_73%,rgba(255,255,255,.86)_100%)]" />
            <WelcomeTitle card={active} />
          </div>

          {isFirst ? (
            <button
              type="button"
              onClick={finish}
              className="absolute right-4 top-4 z-30 rounded-full border border-black/5 bg-white/92 px-4 py-2 text-xs font-black text-monkey-muted shadow-card backdrop-blur transition hover:-translate-y-0.5 active:scale-95"
            >
              Omitir guía
            </button>
          ) : null}

          <div className="absolute left-1/2 top-[4.2%] z-30 flex -translate-x-1/2 gap-2.5" aria-label={`Paso ${index + 1} de ${cards.length}`}>
            {cards.map((card, dotIndex) => (
              <button
                key={card.id}
                type="button"
                aria-label={`Ir al paso ${dotIndex + 1}`}
                onClick={() => setIndex(dotIndex)}
                className={cn(
                  "h-3.5 w-3.5 rounded-full transition-all duration-300",
                  dotIndex < index
                    ? "bg-monkey-green shadow-[0_6px_16px_rgba(34,197,94,.28)]"
                    : dotIndex === index
                      ? "w-3.5 border-2 border-monkey-green bg-white"
                      : "bg-gray-300/90",
                )}
              />
            ))}
          </div>

          <div className={cn("absolute bottom-[3.6%] left-[6%] right-[6%] z-30 grid gap-3", isFirst || isLast ? "grid-cols-1" : "grid-cols-[.68fr_1.32fr]")}> 
            {!isFirst && !isLast ? (
              <button
                type="button"
                onClick={back}
                className="inline-flex h-14 items-center justify-center gap-2 rounded-[22px] bg-white text-base font-black text-monkey-ink shadow-[0_12px_32px_rgba(17,24,39,.10)] transition hover:-translate-y-0.5 active:scale-95"
              >
                <ArrowLeft className="h-5 w-5" /> Atrás
              </button>
            ) : null}

            {!isFirst && isLast ? null : null}

            <button
              type="button"
              onClick={next}
              className={cn(
                "inline-flex h-14 items-center justify-center gap-3 rounded-[22px] bg-gradient-to-r from-[#55C432] to-[#1CA80B] text-lg font-black text-white shadow-[0_18px_36px_rgba(34,197,94,.30)] transition hover:-translate-y-0.5 active:scale-95",
                isFirst || isLast ? "w-full" : "",
              )}
            >
              {nextLabel}
              <ArrowRight className="h-6 w-6" />
            </button>
          </div>

          {isLast && !isFirst ? (
            <button
              type="button"
              onClick={back}
              className="absolute bottom-[12.4%] left-[6%] z-30 inline-flex h-11 items-center justify-center gap-2 rounded-full bg-white px-5 text-sm font-black text-monkey-ink shadow-card transition hover:-translate-y-0.5 active:scale-95"
            >
              <ArrowLeft className="h-4 w-4" /> Atrás
            </button>
          ) : null}
        </div>

        {reviewMode ? (
          <button
            type="button"
            onClick={() => router.replace("/today")}
            className="mt-3 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-black text-monkey-muted shadow-card transition hover:-translate-y-0.5 active:scale-95"
          >
            <X className="h-4 w-4" /> Cerrar guía
          </button>
        ) : null}
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
