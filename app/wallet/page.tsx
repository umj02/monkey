"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ArrowLeft, Banana, CalendarDays, CheckCircle2, Clock3, Gift, Sparkles, Trophy } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { MonkeyAvatar } from "@/components/monkey-avatar";
import { useChallenges } from "@/hooks/use-challenges";
import { calculateChallengeProgress } from "@/lib/challenges";
import { getBananaRewardIcon, getRewardTrophyIcon } from "@/lib/reward-media";
import { cn } from "@/lib/utils";

function dateLabel(value: string) {
  return new Intl.DateTimeFormat("es-CR", { day: "2-digit", month: "short" }).format(new Date(value));
}

function LedgerRow({ amount, reason, createdAt }: { amount: number; reason: string; createdAt: string }) {
  const positive = amount >= 0;
  return (
    <article className="flex items-center gap-3 rounded-[22px] border border-gray-100 bg-white p-3 shadow-sm">
      <div className={cn("grid h-12 w-12 shrink-0 place-items-center rounded-[18px]", positive ? "bg-yellow-50" : "bg-gray-100")}>
        <img src={getBananaRewardIcon(positive ? "single" : "bunch")} alt="Bananas" className="h-9 w-9 object-contain" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-black text-monkey-ink">{reason}</p>
        <p className="mt-1 text-[11px] font-bold text-monkey-muted">{dateLabel(createdAt)}</p>
      </div>
      <strong className={cn("shrink-0 rounded-full px-3 py-1 text-sm font-black", positive ? "bg-yellow-100 text-orange-700" : "bg-gray-100 text-monkey-muted")}>
        {positive ? "+" : ""}{amount} 🍌
      </strong>
    </article>
  );
}

export default function WalletPage() {
  const { challenges, bananaLedger, summary, syncing, refreshChallenges } = useChallenges();

  const stats = useMemo(() => {
    const active = challenges.filter((challenge) => challenge.status === "active" || challenge.status === "expired");
    const completed = challenges.filter((challenge) => challenge.status === "completed" || Boolean(challenge.claimedAt));
    const progress = challenges.map((challenge) => calculateChallengeProgress(challenge, new Set()));
    const totalBananas = bananaLedger.reduce((sum, item) => sum + item.amount, 0);
    const earnedByChallenges = bananaLedger.filter((item) => item.sourceType === "challenge").reduce((sum, item) => sum + item.amount, 0);
    const available = progress.reduce((sum, item) => sum + item.claimableBananas, 0);
    const lost = progress.reduce((sum, item) => sum + item.lostBananas, 0);
    const totalTasks = progress.reduce((sum, item) => sum + item.total, 0);
    const doneTasks = progress.reduce((sum, item) => sum + item.done, 0);
    const completion = totalTasks ? Math.round((doneTasks / totalTasks) * 100) : 0;
    return { active: active.length, completed: completed.length, totalBananas, earnedByChallenges, available, lost, totalTasks, doneTasks, completion };
  }, [bananaLedger, challenges]);

  const latestLedger = bananaLedger.slice(0, 8);
  const claimableChallenges = challenges
    .map((challenge) => ({ challenge, progress: calculateChallengeProgress(challenge, new Set()) }))
    .filter(({ progress }) => progress.claimableBananas > 0)
    .slice(0, 4);

  return (
    <AppShell>
      <section className="page-pad pt-7">
        <header className="flex items-center justify-between gap-3">
          <Link href="/today" className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white shadow-card transition active:scale-95" aria-label="Volver a Hoy">
            <ArrowLeft className="h-5 w-5 text-monkey-muted" />
          </Link>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-black uppercase tracking-[.12em] text-orange-600">Monedero Monkey</p>
            <h1 className="text-2xl font-black tracking-tight">Tus bananas</h1>
          </div>
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-white shadow-card">
            <MonkeyAvatar size={34} variant="face" />
          </div>
        </header>

        <section className="mt-5 overflow-hidden rounded-[32px] bg-gradient-to-br from-yellow-300 via-orange-300 to-monkey-green p-5 text-lime-950 shadow-soft">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-sm font-black uppercase tracking-[.12em] text-lime-950/65">Saldo disponible</p>
              <h2 className="mt-2 text-[48px] font-black leading-none">{stats.totalBananas} 🍌</h2>
              <p className="mt-2 max-w-[260px] text-sm font-bold leading-6 text-lime-950/75">Este monedero guarda las bananas ganadas dentro de Monkey. No es dinero real.</p>
            </div>
            <div className="grid h-20 w-20 shrink-0 place-items-center rounded-[28px] bg-white/55 shadow-card backdrop-blur">
              <img src={getBananaRewardIcon("bunch")} alt="Bananas" className="h-16 w-16 object-contain" />
            </div>
          </div>
          <div className="mt-5 h-3 overflow-hidden rounded-full bg-white/40">
            <div className="h-full rounded-full bg-lime-950 transition-all" style={{ width: `${Math.min(100, stats.completion)}%` }} />
          </div>
          <div className="mt-3 flex flex-wrap gap-2 text-xs font-black">
            <span className="rounded-full bg-white/50 px-3 py-1.5">{stats.doneTasks}/{stats.totalTasks} checks</span>
            <span className="rounded-full bg-white/50 px-3 py-1.5">{stats.available} listas</span>
            <span className="rounded-full bg-white/50 px-3 py-1.5">{syncing ? "Actualizando" : "En cuenta"}</span>
          </div>
        </section>

        <section className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-[24px] bg-white p-4 shadow-card"><Banana className="h-5 w-5 text-orange-600" /><p className="mt-3 text-2xl font-black">{stats.earnedByChallenges}</p><p className="text-xs font-bold text-monkey-muted">ganadas por retos</p></div>
          <div className="rounded-[24px] bg-white p-4 shadow-card"><Gift className="h-5 w-5 text-monkey-green" /><p className="mt-3 text-2xl font-black">{stats.available}</p><p className="text-xs font-bold text-monkey-muted">listas para cobrar</p></div>
          <div className="rounded-[24px] bg-white p-4 shadow-card"><Trophy className="h-5 w-5 text-monkey-purple" /><p className="mt-3 text-2xl font-black">{stats.completed}</p><p className="text-xs font-bold text-monkey-muted">retos completados</p></div>
          <div className="rounded-[24px] bg-white p-4 shadow-card"><Clock3 className="h-5 w-5 text-monkey-pink" /><p className="mt-3 text-2xl font-black">{stats.lost}</p><p className="text-xs font-bold text-monkey-muted">no ganadas</p></div>
        </section>

        {claimableChallenges.length ? (
          <section className="mt-6 rounded-card bg-white p-4 shadow-card">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[.1em] text-monkey-green">Por reclamar</p>
                <h2 className="text-lg font-black">Bananas listas</h2>
              </div>
              <Link href="/challenges" className="rounded-full bg-monkey-green px-3 py-2 text-[11px] font-black text-white transition active:scale-95">Cobrar</Link>
            </div>
            <div className="mt-4 grid gap-2">
              {claimableChallenges.map(({ challenge, progress }) => (
                <article key={challenge.id} className="flex items-center gap-3 rounded-[20px] bg-yellow-50 p-3">
                  <img src={getRewardTrophyIcon(progress.lostBananas ? "silver" : "gold")} alt="Trofeo" className="h-10 w-10 object-contain" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-black">{challenge.title}</p>
                    <p className="text-[11px] font-bold text-monkey-muted">{progress.done}/{progress.total} checks · {progress.lostBananas} no ganadas</p>
                  </div>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-orange-700">+{progress.claimableBananas}</span>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        <section className="mt-6 rounded-card bg-white p-4 shadow-card">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[.1em] text-orange-600">Historial</p>
              <h2 className="text-lg font-black">Movimientos de bananas</h2>
            </div>
            <button type="button" onClick={() => void refreshChallenges()} className="rounded-full bg-gray-100 px-3 py-2 text-[11px] font-black text-monkey-muted transition active:scale-95">Actualizar</button>
          </div>

          {latestLedger.length ? (
            <div className="mt-4 grid gap-3">
              {latestLedger.map((entry) => <LedgerRow key={entry.id} amount={entry.amount} reason={entry.reason} createdAt={entry.createdAt} />)}
            </div>
          ) : (
            <div className="mt-4 rounded-[24px] border border-dashed border-yellow-200 bg-yellow-50 p-4 text-center">
              <Sparkles className="mx-auto h-7 w-7 text-orange-600" />
              <h3 className="mt-2 text-base font-black">Aún no hay bananas cobradas</h3>
              <p className="mt-1 text-xs font-bold leading-5 text-monkey-muted">Completá retos y cobrá tus bananas desde Retos. Los canjes del padre se integrarán en Parent Mode.</p>
              <Link href="/challenges" className="mt-3 inline-flex rounded-full bg-monkey-green px-4 py-2 text-xs font-black text-white transition active:scale-95">Ir a retos</Link>
            </div>
          )}
        </section>

        <section className="mt-6 rounded-[28px] border border-monkey-green/20 bg-green-50 p-4">
          <div className="flex items-start gap-3">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-[20px] bg-white text-monkey-greenDark shadow-card"><CheckCircle2 className="h-5 w-5" /></div>
            <div>
              <h2 className="text-base font-black">Preparado para Parent</h2>
              <p className="mt-1 text-xs font-bold leading-5 text-monkey-muted">Este monedero queda enfocado en bananas, medallas y canjes internos. Luego el padre podrá definir recompensas y validar evidencias antes de liberar bananas.</p>
            </div>
          </div>
        </section>
      </section>
    </AppShell>
  );
}
