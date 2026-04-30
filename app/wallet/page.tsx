"use client";

import { ArrowDown, ArrowRight, ArrowUp, Edit3, Lightbulb, Plus } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { MonkeyAvatar } from "@/components/monkey-avatar";
import { useWallet } from "@/hooks/use-wallet";
import { cn } from "@/lib/utils";
import type { WalletPeriod } from "@/types";

const periodLabels: Record<WalletPeriod, string> = {
  weekly: "Semana",
  biweekly: "Quincena",
  monthly: "Mes"
};

const colorMap = {
  green: "bg-green-100 text-monkey-greenDark",
  orange: "bg-orange-100 text-orange-600",
  purple: "bg-purple-100 text-purple-700",
  pink: "bg-pink-100 text-monkey-pink",
  blue: "bg-sky-100 text-sky-700",
  yellow: "bg-yellow-100 text-orange-600"
} as const;

const barMap = {
  green: "bg-monkey-green",
  orange: "bg-monkey-orange",
  purple: "bg-monkey-purple",
  pink: "bg-monkey-pink",
  blue: "bg-monkey-blue",
  yellow: "bg-monkey-yellow"
} as const;

function money(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(value);
}

export default function WalletPage() {
  const { wallet, changePeriod } = useWallet();
  const budgetPercent = Math.min(100, Math.round((wallet.expenses / wallet.budgetLimit) * 100));
  const firstGoal = wallet.goals[0];
  const goalPercent = firstGoal ? Math.min(100, Math.round((firstGoal.current / firstGoal.target) * 100)) : 0;

  return (
    <AppShell>
      <section className="page-pad pb-8 pt-8">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-xl font-black tracking-tight">¡Hola, Juan! 👋</p>
            <p className="mt-1 text-sm font-semibold text-monkey-muted">Así va tu dinero hoy</p>
          </div>
          <MonkeyAvatar size={54} className="rounded-full bg-white shadow-card" />
        </header>

        <div className="mt-5 grid grid-cols-3 gap-2 rounded-pill bg-gray-100 p-1 text-[12px] font-black">
          {(Object.keys(periodLabels) as WalletPeriod[]).map((period) => (
            <button
              key={period}
              onClick={() => changePeriod(period)}
              className={cn("rounded-pill py-2 transition", wallet.period === period ? "bg-monkey-green text-white shadow-sm" : "text-monkey-muted")}
            >
              {periodLabels[period]}
            </button>
          ))}
        </div>

        <section className="mt-5 overflow-hidden rounded-card bg-white p-5 shadow-card">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-black text-monkey-ink">Balance disponible</p>
              <strong className="mt-2 block text-[34px] font-black tracking-tight text-monkey-ink">{money(wallet.balance)}</strong>
              <span className="mt-2 inline-flex rounded-pill bg-green-100 px-3 py-1 text-xs font-black text-monkey-greenDark">+{money(120)} vs. la semana pasada</span>
            </div>
            <div className="grid h-20 w-20 place-items-center rounded-[24px] bg-green-50 text-[46px] shadow-sm">💵</div>
          </div>
        </section>

        <section className="mt-3 grid grid-cols-3 gap-2">
          <article className="rounded-[18px] bg-white p-3 shadow-card">
            <p className="text-[11px] font-bold text-monkey-muted">Ingresos</p>
            <strong className="mt-2 block text-sm font-black">{money(wallet.income)}</strong>
            <ArrowUp className="mt-2 h-4 w-4 text-monkey-green" />
          </article>
          <article className="rounded-[18px] bg-white p-3 shadow-card">
            <p className="text-[11px] font-bold text-monkey-muted">Gastos</p>
            <strong className="mt-2 block text-sm font-black">{money(wallet.expenses)}</strong>
            <ArrowDown className="mt-2 h-4 w-4 text-monkey-pink" />
          </article>
          <article className="rounded-[18px] bg-white p-3 shadow-card">
            <p className="text-[11px] font-bold text-monkey-muted">Ahorros</p>
            <strong className="mt-2 block text-sm font-black">{money(wallet.savings)}</strong>
            <ArrowUp className="mt-2 h-4 w-4 text-monkey-purple" />
          </article>
        </section>

        <section className="mt-3 rounded-card bg-white p-4 shadow-card">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black">Presupuesto del {periodLabels[wallet.period].toLowerCase()}</h2>
            <button className="rounded-pill bg-gray-100 px-3 py-2 text-xs font-black text-monkey-muted"><Edit3 className="mr-1 inline h-3.5 w-3.5" />Editar</button>
          </div>
          <div className="mt-4 flex items-center justify-between text-sm font-semibold text-monkey-muted">
            <span>{budgetPercent}% utilizado</span>
            <span>{money(wallet.expenses)} / {money(wallet.budgetLimit)}</span>
          </div>
          <div className="mt-3 h-3 overflow-hidden rounded-pill bg-gray-100">
            <div className="h-full rounded-pill bg-monkey-green transition-all duration-500" style={{ width: `${budgetPercent}%` }} />
          </div>
        </section>

        <section className="mt-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black">Categorías de gastos</h2>
            <button className="text-xs font-black text-monkey-green">Ver todas</button>
          </div>
          <div className="mt-3 space-y-3 rounded-card bg-white p-4 shadow-card">
            {wallet.categories.map((category) => (
              <article key={category.id} className="grid grid-cols-[44px_1fr_auto] items-center gap-3">
                <span className={`${colorMap[category.color]} grid h-11 w-11 place-items-center rounded-[16px] text-lg`}>{category.icon}</span>
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-sm font-black">{category.name}</h3>
                    <span className="text-xs font-black">{money(category.amount)}</span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-pill bg-gray-100">
                    <div className={`${barMap[category.color]} h-full rounded-pill`} style={{ width: `${category.percent}%` }} />
                  </div>
                </div>
                <span className="text-xs font-bold text-monkey-muted">{category.percent}%</span>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-4 rounded-card bg-gradient-to-br from-monkey-green to-monkey-greenDark p-4 text-white shadow-float">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-[16px] bg-white/20"><Lightbulb className="h-6 w-6" /></span>
            <div className="flex-1">
              <h2 className="text-sm font-black">Consejo inteligente</h2>
              <p className="mt-1 text-xs leading-5 text-white/90">{wallet.tip}</p>
            </div>
            <ArrowRight className="h-5 w-5" />
          </div>
        </section>

        {firstGoal ? (
          <section className="mt-4 rounded-card bg-white p-4 shadow-card">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-black">Meta de ahorro</h2>
              <button className="text-xs font-black text-monkey-green">Ver metas</button>
            </div>
            <div className="mt-4 grid grid-cols-[48px_1fr_auto] items-center gap-3">
              <span className="grid h-12 w-12 place-items-center rounded-[16px] bg-purple-100 text-xl">{firstGoal.icon}</span>
              <div>
                <p className="text-sm font-black">{firstGoal.title}</p>
                <div className="mt-2 h-2 overflow-hidden rounded-pill bg-gray-100"><div className="h-full rounded-pill bg-monkey-green" style={{ width: `${goalPercent}%` }} /></div>
              </div>
              <div className="text-right text-xs font-black"><p>{money(firstGoal.current)} / {money(firstGoal.target)}</p><p className="mt-1 text-monkey-muted">{goalPercent}%</p></div>
            </div>
          </section>
        ) : null}
      </section>

      <button className="fixed bottom-[104px] right-[calc(50%-195px)] z-30 grid h-16 w-16 place-items-center rounded-full bg-monkey-green text-white shadow-float transition active:scale-95" aria-label="Agregar movimiento">
        <Plus />
      </button>
    </AppShell>
  );
}
