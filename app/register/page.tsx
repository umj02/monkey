"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Apple } from "lucide-react";
import { MonkeyLogo } from "@/components/monkey-logo";
import { AppInput } from "@/components/app-input";

export default function RegisterPage() {
  const router = useRouter();
  return (
    <main className="app-screen px-6 py-10">
      <section className="mx-auto max-w-[360px] text-center">
        <div className="mx-auto w-fit"><MonkeyLogo size={72} /></div>
        <h1 className="mt-5 text-2xl font-black tracking-tight">Create Account</h1>
        <p className="mt-1 text-sm text-monkey-muted">Let's get you started!</p>
        <form className="mt-7 space-y-3 text-left" onSubmit={(event) => { event.preventDefault(); router.push("/today"); }}>
          <AppInput placeholder="Full Name" required />
          <AppInput placeholder="Email" type="email" required />
          <AppInput placeholder="Password" type="password" required />
          <button type="submit" className="flex h-14 w-full items-center justify-center rounded-pill bg-monkey-green text-sm font-bold text-white shadow-float transition active:scale-95">Sign Up</button>
        </form>
        <div className="my-5 flex items-center gap-4 text-xs text-monkey-muted"><span className="h-px flex-1 bg-gray-200" />or<span className="h-px flex-1 bg-gray-200" /></div>
        <div className="space-y-3">
          <button onClick={() => router.push("/today")} className="flex h-[52px] w-full items-center justify-center gap-3 rounded-[18px] border border-gray-200 bg-white text-sm font-semibold shadow-sm"><span className="text-lg">G</span>Continue with Google</button>
          <button onClick={() => router.push("/today")} className="flex h-[52px] w-full items-center justify-center gap-3 rounded-[18px] border border-gray-200 bg-white text-sm font-semibold shadow-sm"><Apple className="h-5 w-5" />Continue with Apple</button>
        </div>
        <p className="mt-6 text-center text-sm text-gray-500">Already have an account? <Link href="/login" className="font-bold text-monkey-green">Login</Link></p>
      </section>
    </main>
  );
}
