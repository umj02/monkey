import Link from "next/link";
import { MonkeyLogo } from "@/components/monkey-logo";

export default function Home() {
  return (
    <main className="safe-screen grid place-items-center px-7">
      <section className="w-full text-center">
        <div className="mx-auto w-fit">
          <MonkeyLogo size={96} />
        </div>
        <h1 className="mt-7 text-5xl font-black tracking-tight text-monkey-green">monkey</h1>
        <p className="mt-3 text-lg">
          Plan. <span className="text-monkey-green">Focus.</span> <span className="text-monkey-yellow">Achieve.</span>
        </p>
        <div className="mt-8 flex justify-center gap-3">
          {["bg-monkey-green", "bg-monkey-purple", "bg-monkey-orange", "bg-monkey-yellow", "bg-monkey-blue", "bg-monkey-pink"].map(c => (
            <span key={c} className={`h-7 w-7 rounded-full ${c}`} />
          ))}
        </div>
        <Link href="/register" className="mt-10 inline-flex h-14 w-full items-center justify-center rounded-full bg-monkey-green font-bold text-white shadow-soft">
          Empezar
        </Link>
        <Link href="/login" className="mt-4 inline-block text-sm font-semibold text-gray-500">
          Ya tengo cuenta
        </Link>
      </section>
    </main>
  );
}
