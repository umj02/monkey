"use client";

import Image from "next/image";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowRight, X } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useProfile } from "@/hooks/use-profile";
import { cn } from "@/lib/utils";

const cards = [
  {
    id: "tu-dia",
    image: "/assets/onboarding/tu-dia-01.png",
    title: "Tu día en un solo lugar",
  },
  {
    id: "actividades",
    image: "/assets/onboarding/actividades-02.png",
    title: "Creá actividades rápidas",
  },
  {
    id: "calendario",
    image: "/assets/onboarding/calendario-03.png",
    title: "Planificá por horas",
  },
  {
    id: "alertas",
    image: "/assets/onboarding/alertas-04.png",
    title: "No se te olvida nada",
  },
  {
    id: "avances",
    image: "/assets/onboarding/avances-05.png",
    title: "Marcá avances",
  },
  {
    id: "wallet",
    image: "/assets/onboarding/wallet-06.png",
    title: "Controlá tu dinero",
  },
  {
    id: "medallas",
    image: "/assets/onboarding/medallas-07.png",
    title: "Ganate medallas",
  },
  {
    id: "listo",
    image: "/assets/onboarding/lograste-08.png",
    title: "Todo listo",
  },
];

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
    <main className="app-screen bg-[#F7F9FC] px-4 py-[calc(18px+var(--safe-top))]">
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
              alt={active.title}
              fill
              priority={index <= 1}
              sizes="390px"
              className="select-none object-cover animate-welcomeImage"
            />
          </div>

          {isFirst ? (
            <button
              type="button"
              onClick={finish}
              className="absolute right-4 top-4 z-20 rounded-full border border-black/5 bg-white/90 px-4 py-2 text-xs font-black text-monkey-muted shadow-card backdrop-blur transition active:scale-95"
            >
              Omitir
            </button>
          ) : null}

          {!isFirst ? (
            <button
              type="button"
              onClick={back}
              aria-label="Atrás"
              className="absolute bottom-[3.4%] left-[6%] z-20 grid h-[7.3%] w-[24%] place-items-center rounded-full bg-white/0 text-transparent transition active:scale-95"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          ) : null}

          <button
            type="button"
            onClick={next}
            aria-label={nextLabel}
            className={cn(
              "absolute bottom-[3.4%] z-20 grid h-[7.3%] place-items-center rounded-full bg-white/0 text-transparent transition active:scale-95",
              isFirst || isLast ? "left-[6%] w-[88%]" : "right-[6%] w-[55%]",
            )}
          >
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>

        <div className="pointer-events-none absolute left-1/2 top-4 z-30 flex -translate-x-1/2 gap-2" aria-hidden="true">
          {cards.map((card, dotIndex) => (
            <span
              key={card.id}
              className={cn(
                "h-2.5 w-2.5 rounded-full transition-all duration-300",
                dotIndex < index ? "bg-monkey-green" : dotIndex === index ? "w-5 border-2 border-monkey-green bg-white" : "bg-gray-300",
              )}
            />
          ))}
        </div>

        {reviewMode ? (
          <button
            type="button"
            onClick={() => router.replace("/today")}
            className="mt-3 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-black text-monkey-muted shadow-card transition active:scale-95"
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
