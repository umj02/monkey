import Link from "next/link";

export default function IntroPage() {
  return (
    <main className="app-screen grid min-h-dvh grid-rows-[1fr_auto] overflow-hidden">
      <section className="relative grid place-items-center bg-gradient-to-br from-[#91D36D] to-[#4FC947] px-6">
        <div className="absolute left-8 top-12 h-3 w-3 rounded-full bg-monkey-orange" />
        <div className="absolute right-12 top-20 h-4 w-2 rotate-12 rounded bg-monkey-yellow" />
        <div className="absolute left-12 top-24 h-5 w-2 -rotate-12 rounded bg-white/70" />
        <div className="absolute right-16 bottom-40 h-3 w-3 rounded bg-monkey-blue" />
        <div className="text-center text-white">
          <p className="text-sm font-semibold opacity-90">Welcome to</p>
          <h1 className="mt-1 text-5xl font-black tracking-tight">monkey</h1>
          <div className="mt-8 animate-floaty text-[150px] leading-none">🐵</div>
        </div>
      </section>
      <section className="-mt-12 rounded-t-[32px] bg-white px-7 pb-8 pt-7 text-center shadow-soft">
        <h2 className="text-xl font-bold text-monkey-ink">Plan your day, build good habits</h2>
        <p className="mx-auto mt-3 max-w-[260px] text-sm leading-6 text-monkey-muted">
          Create colorful checklists, organize your hours and celebrate small wins.
        </p>
        <Link href="/register" className="mt-7 flex h-14 items-center justify-center rounded-pill bg-monkey-green text-sm font-bold text-white shadow-float transition active:scale-95">
          Get Started
        </Link>
        <div className="mt-5 flex justify-center gap-2">
          <span className="h-2 w-5 rounded-pill bg-monkey-green" />
          <span className="h-2 w-2 rounded-full bg-gray-200" />
          <span className="h-2 w-2 rounded-full bg-gray-200" />
        </div>
      </section>
    </main>
  );
}
