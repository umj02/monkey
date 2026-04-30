import Link from "next/link";
import { Apple, Eye } from "lucide-react";
import { MonkeyLogo } from "@/components/monkey-logo";
import { AppInput } from "@/components/app-input";

export default function LoginPage() {
  return (
    <main className="app-screen px-6 py-10">
      <section className="mx-auto max-w-[360px] text-center">
        <div className="mx-auto w-fit"><MonkeyLogo size={72} /></div>
        <h1 className="mt-5 text-2xl font-black tracking-tight">Welcome back!</h1>
        <p className="mt-1 text-sm text-monkey-muted">Login to continue</p>
        <form className="mt-7 space-y-3 text-left">
          <AppInput placeholder="Email" type="email" />
          <div className="relative">
            <AppInput placeholder="Password" type="password" />
            <Eye className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-monkey-muted" />
          </div>
          <div className="text-right"><Link href="#" className="text-xs font-bold text-monkey-green">Forgot password?</Link></div>
          <Link href="/today" className="flex h-14 w-full items-center justify-center rounded-pill bg-monkey-green text-sm font-bold text-white shadow-float transition active:scale-95">
            Login
          </Link>
        </form>
        <div className="my-5 flex items-center gap-4 text-xs text-monkey-muted"><span className="h-px flex-1 bg-gray-200" />or<span className="h-px flex-1 bg-gray-200" /></div>
        <div className="space-y-3">
          <button className="flex h-[52px] w-full items-center justify-center gap-3 rounded-[18px] border border-gray-200 bg-white text-sm font-semibold shadow-sm"><span className="text-lg">G</span>Continue with Google</button>
          <button className="flex h-[52px] w-full items-center justify-center gap-3 rounded-[18px] border border-gray-200 bg-white text-sm font-semibold shadow-sm"><Apple className="h-5 w-5" />Continue with Apple</button>
        </div>
        <p className="mt-6 text-center text-sm text-gray-500">Don't have an account? <Link href="/register" className="font-bold text-monkey-green">Sign Up</Link></p>
      </section>
    </main>
  );
}
