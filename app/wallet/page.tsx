"use client";

import { useMemo, useState } from "react";
import { ArrowDown, ArrowRight, ArrowUp, Edit3, Lightbulb, Plus, Target, Trash2 } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Field } from "@/components/field";
import { FormSheet } from "@/components/form-sheet";
import { MonkeyAvatar } from "@/components/monkey-avatar";
import { Toast, type ToastState } from "@/components/toast";
import { useWallet } from "@/hooks/use-wallet";
import { cn } from "@/lib/utils";
import type { WalletPeriod, WalletTransactionType } from "@/types";

const periodLabels: Record<WalletPeriod, string> = {
  weekly: "Semana",
  biweekly: "Quincena",
  monthly: "Mes"
};

const transactionLabels: Record<WalletTransactionType, string> = {
  income: "Ingreso",
  expense: "Gasto",
  saving: "Ahorro"
};

const expenseCategories = ["Comida", "Transporte", "Entretenimiento", "Compras", "Escuela", "Otro"];
const incomeCategories = ["Mesada", "Trabajo", "Regalo", "Venta", "Otro"];
const savingCategories = ["Ahorro", "iPhone 15", "Viaje", "Emergencia", "Otro"];

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

const badgeMap = {
  success: "bg-green-100 text-monkey-greenDark",
  warning: "bg-yellow-100 text-orange-700",
  info: "bg-sky-100 text-sky-700"
} as const;

function money(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(value);
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function SelectField({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-black uppercase tracking-[.08em] text-monkey-muted">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-[52px] w-full rounded-[18px] border border-monkey-line bg-white px-4 text-sm font-semibold outline-none transition focus:border-monkey-green focus:ring-4 focus:ring-green-100"
      >
        {options.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
    </label>
  );
}

export default function WalletPage() {
  const { wallet, changePeriod, updateWallet, addTransaction, addGoal, deleteTransaction } = useWallet();
  const [toast, setToast] = useState<ToastState>(null);
  const [movementOpen, setMovementOpen] = useState(false);
  const [budgetOpen, setBudgetOpen] = useState(false);
  const [goalOpen, setGoalOpen] = useState(false);
  const [type, setType] = useState<WalletTransactionType>("expense");
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Comida");
  const [date, setDate] = useState(today());
  const [budget, setBudget] = useState(String(wallet.budgetLimit));
  const [goalTitle, setGoalTitle] = useState("");
  const [goalTarget, setGoalTarget] = useState("");
  const [goalCurrent, setGoalCurrent] = useState("0");

  const budgetPercent = Math.min(100, Math.round((wallet.expenses / wallet.budgetLimit) * 100));
  const firstGoal = wallet.goals[0];
  const goalPercent = firstGoal ? Math.min(100, Math.round((firstGoal.current / firstGoal.target) * 100)) : 0;
  const recentTransactions = useMemo(() => wallet.transactions.slice(0, 4), [wallet.transactions]);
  const activeCategories = type === "income" ? incomeCategories : type === "saving" ? savingCategories : expenseCategories;

  function openMovement(nextType: WalletTransactionType = "expense") {
    setType(nextType);
    setTitle("");
    setAmount("");
    setCategory(nextType === "income" ? "Mesada" : nextType === "saving" ? "Ahorro" : "Comida");
    setDate(today());
    setMovementOpen(true);
  }

  function submitMovement() {
    const parsedAmount = Number(amount);
    if (title.trim().length < 3) {
      setToast({ message: "Agregá un nombre de al menos 3 letras.", type: "error" });
      return;
    }
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setToast({ message: "Ingresá un monto válido mayor a 0.", type: "error" });
      return;
    }
    addTransaction({ type, title: title.trim(), amount: parsedAmount, category, date, period: wallet.period });
    setMovementOpen(false);
    setToast({ message: `${transactionLabels[type]} agregado correctamente.`, type: "success" });
  }

  function submitBudget() {
    const parsedBudget = Number(budget);
    if (!Number.isFinite(parsedBudget) || parsedBudget <= 0) {
      setToast({ message: "El presupuesto debe ser mayor a 0.", type: "error" });
      return;
    }
    updateWallet({ budgetLimit: parsedBudget });
    setBudgetOpen(false);
    setToast({ message: "Presupuesto actualizado.", type: "success" });
  }

  function submitGoal() {
    const parsedTarget = Number(goalTarget);
    const parsedCurrent = Number(goalCurrent);
    if (goalTitle.trim().length < 3) {
      setToast({ message: "Agregá un nombre para la meta.", type: "error" });
      return;
    }
    if (!Number.isFinite(parsedTarget) || parsedTarget <= 0) {
      setToast({ message: "La meta necesita un monto objetivo mayor a 0.", type: "error" });
      return;
    }
    addGoal({ title: goalTitle.trim(), target: parsedTarget, current: Number.isFinite(parsedCurrent) ? parsedCurrent : 0, icon: "🎯" });
    setGoalOpen(false);
    setGoalTitle("");
    setGoalTarget("");
    setGoalCurrent("0");
    setToast({ message: "Meta de ahorro creada.", type: "success" });
  }

  function removeTransaction(id: string) {
    deleteTransaction(id);
    setToast({ message: "Movimiento eliminado.", type: "info" });
  }

  return (
    <AppShell>
      <Toast toast={toast} onClose={() => setToast(null)} />
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
              <span className="mt-2 inline-flex rounded-pill bg-green-100 px-3 py-1 text-xs font-black text-monkey-greenDark">{wallet.savings > 0 ? `+${money(wallet.savings)} ahorrado` : "Agregá tu primer ahorro"}</span>
            </div>
            <div className="grid h-20 w-20 place-items-center rounded-[24px] bg-green-50 text-[46px] shadow-sm">💵</div>
          </div>
        </section>

        <section className="mt-3 grid grid-cols-3 gap-2">
          <button onClick={() => openMovement("income")} className="rounded-[18px] bg-white p-3 text-left shadow-card transition active:scale-[.98]">
            <p className="text-[11px] font-bold text-monkey-muted">Ingresos</p>
            <strong className="mt-2 block text-sm font-black">{money(wallet.income)}</strong>
            <ArrowUp className="mt-2 h-4 w-4 text-monkey-green" />
          </button>
          <button onClick={() => openMovement("expense")} className="rounded-[18px] bg-white p-3 text-left shadow-card transition active:scale-[.98]">
            <p className="text-[11px] font-bold text-monkey-muted">Gastos</p>
            <strong className="mt-2 block text-sm font-black">{money(wallet.expenses)}</strong>
            <ArrowDown className="mt-2 h-4 w-4 text-monkey-pink" />
          </button>
          <button onClick={() => openMovement("saving")} className="rounded-[18px] bg-white p-3 text-left shadow-card transition active:scale-[.98]">
            <p className="text-[11px] font-bold text-monkey-muted">Ahorros</p>
            <strong className="mt-2 block text-sm font-black">{money(wallet.savings)}</strong>
            <ArrowUp className="mt-2 h-4 w-4 text-monkey-purple" />
          </button>
        </section>

        <section className="mt-3 rounded-card bg-white p-4 shadow-card">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black">Presupuesto del {periodLabels[wallet.period].toLowerCase()}</h2>
            <button onClick={() => { setBudget(String(wallet.budgetLimit)); setBudgetOpen(true); }} className="rounded-pill bg-gray-100 px-3 py-2 text-xs font-black text-monkey-muted"><Edit3 className="mr-1 inline h-3.5 w-3.5" />Editar</button>
          </div>
          <div className="mt-4 flex items-center justify-between text-sm font-semibold text-monkey-muted">
            <span>{budgetPercent}% utilizado</span>
            <span>{money(wallet.expenses)} / {money(wallet.budgetLimit)}</span>
          </div>
          <div className="mt-3 h-3 overflow-hidden rounded-pill bg-gray-100">
            <div className={cn("h-full rounded-pill transition-all duration-500", budgetPercent > 85 ? "bg-monkey-pink" : "bg-monkey-green")} style={{ width: `${budgetPercent}%` }} />
          </div>
        </section>

        <section className="mt-4 rounded-card bg-white p-4 shadow-card">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black">Badges inteligentes</h2>
            <span className="text-xs font-black text-monkey-muted">Auto</span>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {wallet.badges.map((badge) => (
              <span key={badge.id} className={cn("inline-flex items-center gap-1.5 rounded-pill px-3 py-2 text-xs font-black", badgeMap[badge.tone])}>{badge.icon} {badge.label}</span>
            ))}
          </div>
        </section>

        <section className="mt-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black">Categorías de gastos</h2>
            <button onClick={() => openMovement("expense")} className="text-xs font-black text-monkey-green">+ gasto</button>
          </div>
          <div className="mt-3 space-y-3 rounded-card bg-white p-4 shadow-card">
            {wallet.categories.length > 0 ? wallet.categories.map((category) => (
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
            )) : <p className="py-3 text-center text-sm font-semibold text-monkey-muted">Aún no hay gastos en este periodo.</p>}
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

        <section className="mt-4 rounded-card bg-white p-4 shadow-card">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black">Meta de ahorro</h2>
            <button onClick={() => setGoalOpen(true)} className="text-xs font-black text-monkey-green">+ meta</button>
          </div>
          {firstGoal ? (
            <div className="mt-4 grid grid-cols-[48px_1fr_auto] items-center gap-3">
              <span className="grid h-12 w-12 place-items-center rounded-[16px] bg-purple-100 text-xl">{firstGoal.icon}</span>
              <div>
                <p className="text-sm font-black">{firstGoal.title}</p>
                <div className="mt-2 h-2 overflow-hidden rounded-pill bg-gray-100"><div className="h-full rounded-pill bg-monkey-green" style={{ width: `${goalPercent}%` }} /></div>
              </div>
              <div className="text-right text-xs font-black"><p>{money(firstGoal.current)} / {money(firstGoal.target)}</p><p className="mt-1 text-monkey-muted">{goalPercent}%</p></div>
            </div>
          ) : <p className="mt-3 text-sm font-semibold text-monkey-muted">Creá una meta para separar tus ahorros.</p>}
        </section>

        <section className="mt-4 rounded-card bg-white p-4 shadow-card">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black">Historial reciente</h2>
            <button onClick={() => openMovement("expense")} className="text-xs font-black text-monkey-green">+ movimiento</button>
          </div>
          <div className="mt-3 space-y-2">
            {recentTransactions.length > 0 ? recentTransactions.map((transaction) => (
              <article key={transaction.id} className="grid grid-cols-[40px_1fr_auto_36px] items-center gap-2 rounded-[16px] bg-gray-50 p-2">
                <span className={cn("grid h-10 w-10 place-items-center rounded-[14px] text-lg", colorMap[transaction.color])}>{transaction.icon}</span>
                <div>
                  <p className="text-sm font-black">{transaction.title}</p>
                  <p className="text-[11px] font-semibold text-monkey-muted">{transaction.category} · {transaction.date}</p>
                </div>
                <strong className={cn("text-xs", transaction.type === "expense" ? "text-monkey-pink" : "text-monkey-greenDark")}>{transaction.type === "expense" ? "-" : "+"}{money(transaction.amount)}</strong>
                <button onClick={() => removeTransaction(transaction.id)} className="grid h-8 w-8 place-items-center rounded-full bg-pink-50 text-monkey-pink" aria-label="Eliminar movimiento"><Trash2 className="h-4 w-4" /></button>
              </article>
            )) : <p className="py-3 text-center text-sm font-semibold text-monkey-muted">No hay movimientos todavía.</p>}
          </div>
        </section>
      </section>

      <button onClick={() => openMovement("expense")} className="fixed bottom-[104px] right-[calc(50%-195px)] z-30 grid h-16 w-16 place-items-center rounded-full bg-monkey-green text-white shadow-float transition active:scale-95" aria-label="Agregar movimiento">
        <Plus />
      </button>

      <FormSheet open={movementOpen} title="Agregar movimiento" subtitle="Registrá un ingreso, gasto o ahorro en segundos." submitLabel="Guardar movimiento" onClose={() => setMovementOpen(false)} onSubmit={submitMovement}>
        <div className="grid grid-cols-3 gap-2 rounded-pill bg-gray-100 p-1 text-xs font-black">
          {(["income", "expense", "saving"] as WalletTransactionType[]).map((item) => (
            <button key={item} type="button" onClick={() => { setType(item); setCategory(item === "income" ? "Mesada" : item === "saving" ? "Ahorro" : "Comida"); }} className={cn("rounded-pill py-2", type === item ? "bg-monkey-green text-white" : "text-monkey-muted")}>{transactionLabels[item]}</button>
          ))}
        </div>
        <Field label="Nombre" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Ej. Almuerzo, mesada, ahorro" />
        <Field label="Monto" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="0.00" type="number" min="0" step="0.01" />
        <SelectField label="Categoría" value={category} options={activeCategories} onChange={setCategory} />
        <Field label="Fecha" value={date} onChange={(event) => setDate(event.target.value)} type="date" />
      </FormSheet>

      <FormSheet open={budgetOpen} title="Editar presupuesto" subtitle={`Definí tu límite para ${periodLabels[wallet.period].toLowerCase()}.`} submitLabel="Guardar presupuesto" onClose={() => setBudgetOpen(false)} onSubmit={submitBudget}>
        <Field label="Presupuesto" value={budget} onChange={(event) => setBudget(event.target.value)} type="number" min="1" step="0.01" />
      </FormSheet>

      <FormSheet open={goalOpen} title="Nueva meta" subtitle="Separá dinero para algo importante." submitLabel="Guardar meta" onClose={() => setGoalOpen(false)} onSubmit={submitGoal}>
        <div className="grid place-items-center rounded-card bg-green-50 p-4 text-monkey-green"><Target className="h-8 w-8" /><span className="mt-2 text-xs font-black">Meta de ahorro</span></div>
        <Field label="Nombre" value={goalTitle} onChange={(event) => setGoalTitle(event.target.value)} placeholder="Ej. Viaje, teléfono, emergencia" />
        <Field label="Monto objetivo" value={goalTarget} onChange={(event) => setGoalTarget(event.target.value)} type="number" min="1" step="0.01" />
        <Field label="Monto actual" value={goalCurrent} onChange={(event) => setGoalCurrent(event.target.value)} type="number" min="0" step="0.01" />
      </FormSheet>
    </AppShell>
  );
}
