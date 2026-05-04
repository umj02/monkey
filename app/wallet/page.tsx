"use client";

import { useMemo, useState } from "react";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, CalendarDays, Edit3, Filter, Lightbulb, Plus, RefreshCw, Target, Trash2 } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Field } from "@/components/field";
import { FormSheet } from "@/components/form-sheet";
import { MonkeyAvatar } from "@/components/monkey-avatar";
import { AssetPicker } from "@/components/asset-picker";
import { AssetThumb } from "@/components/asset-thumb";
import { getWalletAssetsByType } from "@/lib/asset-library";
import { Toast, type ToastState } from "@/components/toast";
import { useWallet } from "@/hooks/use-wallet";
import { cn } from "@/lib/utils";
import { getWalletPeriodRange, isTransactionInPeriod } from "@/lib/services/wallet-service";
import type { WalletPeriod, WalletTransaction, WalletTransactionType } from "@/types";

const periodLabels: Record<WalletPeriod, string> = {
  monthly: "Mes",
  biweekly: "Quincena",
  weekly: "Semana"
};

const transactionLabels: Record<WalletTransactionType, string> = {
  income: "Ingreso",
  extra: "Extra",
  expense: "Gasto",
  saving: "Ahorro"
};

const transactionTabs: WalletTransactionType[] = ["income", "extra", "expense", "saving"];
const filterTabs: Array<"all" | WalletTransactionType> = ["all", "income", "extra", "expense", "saving"];
const filterLabels: Record<"all" | WalletTransactionType, string> = { all: "Todos", ...transactionLabels };

const expenseCategories = ["Comida", "Transporte", "Entretenimiento", "Compras", "Escuela", "Otro"];
const incomeCategories = ["Mesada", "Trabajo", "Regalo", "Venta", "Otro"];
const extraCategories = ["Extra", "Bono", "Regalo", "Venta", "Otro"];
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

function money(value: number, currency = "CRC") {
  return new Intl.NumberFormat("es-CR", { style: "currency", currency, maximumFractionDigits: currency === "CRC" ? 0 : 2 }).format(value);
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

function categoriesForType(type: WalletTransactionType) {
  if (type === "income") return incomeCategories;
  if (type === "extra") return extraCategories;
  if (type === "saving") return savingCategories;
  return expenseCategories;
}

function defaultCategory(type: WalletTransactionType) {
  if (type === "income") return "Mesada";
  if (type === "extra") return "Extra";
  if (type === "saving") return "Ahorro";
  return "Comida";
}

function defaultIcon(type: WalletTransactionType) {
  if (type === "income") return "wallet-income";
  if (type === "extra") return "wallet-extras";
  if (type === "saving") return "wallet-savings";
  return "wallet-food";
}

function signFor(type: WalletTransactionType) {
  return type === "expense" || type === "saving" ? "-" : "+";
}

function toneFor(type: WalletTransactionType) {
  if (type === "expense") return "text-monkey-pink";
  if (type === "saving") return "text-purple-700";
  return "text-monkey-greenDark";
}

export default function WalletPage() {
  const { wallet, changePeriod, updateWallet, addTransaction, addGoal, deleteTransaction, refreshWallet, syncing, syncStatus, lastError } = useWallet();
  const [toast, setToast] = useState<ToastState>(null);
  const [movementOpen, setMovementOpen] = useState(false);
  const [budgetOpen, setBudgetOpen] = useState(false);
  const [goalOpen, setGoalOpen] = useState(false);
  const [type, setType] = useState<WalletTransactionType>("expense");
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Comida");
  const [date, setDate] = useState(today());
  const [icon, setIcon] = useState("wallet-food");
  const [budget, setBudget] = useState(String(wallet.budgetLimit));
  const [goalTitle, setGoalTitle] = useState("");
  const [goalTarget, setGoalTarget] = useState("");
  const [goalCurrent, setGoalCurrent] = useState("0");
  const [goalIcon, setGoalIcon] = useState("wallet-savings");
  const [historyFilter, setHistoryFilter] = useState<"all" | WalletTransactionType>("all");
  const [historyPage, setHistoryPage] = useState(0);

  const periodRange = useMemo(() => getWalletPeriodRange(wallet.period), [wallet.period]);
  const filteredTransactions = useMemo(() => {
    return wallet.transactions
      .filter((transaction) => isTransactionInPeriod(transaction, wallet.period))
      .filter((transaction) => historyFilter === "all" || transaction.type === historyFilter)
      .sort((a, b) => `${b.date}-${b.id}`.localeCompare(`${a.date}-${a.id}`));
  }, [wallet.transactions, wallet.period, historyFilter]);
  const totalPages = Math.max(1, Math.ceil(filteredTransactions.length / 5));
  const safePage = Math.min(historyPage, totalPages - 1);
  const recentTransactions = filteredTransactions.slice(safePage * 5, safePage * 5 + 5);

  const budgetPercent = Math.min(100, Math.round((wallet.expenses / wallet.budgetLimit) * 100));
  const firstGoal = wallet.goals[0];
  const goalPercent = firstGoal ? Math.min(100, Math.round((firstGoal.current / firstGoal.target) * 100)) : 0;
  const activeCategories = categoriesForType(type);
  const activeWalletAssets = getWalletAssetsByType(type);

  function openMovement(nextType: WalletTransactionType = "expense") {
    setType(nextType);
    setTitle("");
    setAmount("");
    setCategory(defaultCategory(nextType));
    setIcon(defaultIcon(nextType));
    setDate(today());
    setMovementOpen(true);
  }

  function changeType(nextType: WalletTransactionType) {
    setType(nextType);
    setCategory(defaultCategory(nextType));
    setIcon(defaultIcon(nextType));
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
    addTransaction({ type, title: title.trim(), amount: parsedAmount, category, date, period: wallet.period, currency: wallet.currency, icon });
    setHistoryPage(0);
    setMovementOpen(false);
    setToast({ message: `${transactionLabels[type]} agregado y actualizado.`, type: "success" });
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
    addGoal({ title: goalTitle.trim(), target: parsedTarget, current: Number.isFinite(parsedCurrent) ? parsedCurrent : 0, currency: wallet.currency, icon: goalIcon });
    setGoalOpen(false);
    setGoalTitle("");
    setGoalTarget("");
    setGoalCurrent("0");
    setGoalIcon("wallet-savings");
    setToast({ message: "Meta de ahorro creada.", type: "success" });
  }

  function removeTransaction(id: string) {
    deleteTransaction(id);
    setToast({ message: "Movimiento eliminado.", type: "info" });
  }

  function refreshHistory() {
    refreshWallet();
    setHistoryPage(0);
    setToast({ message: lastError ? "No se pudo actualizar. Revisá tu conexión." : "Historial actualizado.", type: lastError ? "error" : "success" });
  }

  function setPeriod(period: WalletPeriod) {
    changePeriod(period);
    setHistoryPage(0);
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

        <div className="mt-5 grid min-w-0 grid-cols-3 gap-1 rounded-pill bg-gray-100 p-1 text-[11px] font-black">
          {(["monthly", "biweekly", "weekly"] as WalletPeriod[]).map((period) => (
            <button
              key={period}
              onClick={() => setPeriod(period)}
              className={cn("min-w-0 rounded-pill px-1 py-2 transition", wallet.period === period ? "bg-monkey-green text-white shadow-sm" : "text-monkey-muted")}
            >
              <span className="block truncate">{periodLabels[period]}</span>
            </button>
          ))}
        </div>
        <p className="mt-2 flex items-center justify-center gap-1 text-[11px] font-black uppercase tracking-[.08em] text-monkey-muted"><CalendarDays className="h-3.5 w-3.5" />{periodRange.start} · {periodRange.end}</p>
        <p className={cn("mt-1 text-center text-[11px] font-bold", lastError ? "text-monkey-pink" : syncStatus === "saving" || syncing ? "text-monkey-muted" : "text-monkey-greenDark")}>
          {lastError || (syncStatus === "saving" ? "Guardando cambios..." : syncing ? "Actualizando Wallet..." : syncStatus === "synced" ? "Wallet sincronizada" : "")}
        </p>

        <section className="mt-5 overflow-hidden rounded-card bg-white p-5 shadow-card">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-black text-monkey-ink">Balance disponible</p>
              <strong className="mt-2 block text-[34px] font-black tracking-tight text-monkey-ink">{money(wallet.balance, wallet.currency)}</strong>
              <span className="mt-2 inline-flex rounded-pill bg-green-100 px-3 py-1 text-xs font-black text-monkey-greenDark">{wallet.savings > 0 ? `+${money(wallet.savings, wallet.currency)} ahorrado` : "Agregá tu primer ahorro"}</span>
            </div>
            <div className="grid h-20 w-20 place-items-center rounded-[24px] bg-green-50 shadow-sm"><AssetThumb icon="wallet-income" size={62} /></div>
          </div>
        </section>

        <section className="mt-3 grid grid-cols-4 gap-2">
          {transactionTabs.map((item) => (
            <button key={item} onClick={() => openMovement(item)} className="rounded-[18px] bg-white p-3 text-left shadow-card transition active:scale-[.98]">
              <p className="truncate text-[10px] font-bold text-monkey-muted">{transactionLabels[item]}</p>
              <strong className="mt-2 block truncate text-xs font-black">{money(item === "income" ? wallet.income : item === "extra" ? wallet.extras || 0 : item === "expense" ? wallet.expenses : wallet.savings, wallet.currency)}</strong>
              {item === "expense" ? <ArrowDown className="mt-2 h-4 w-4 text-monkey-pink" /> : <ArrowUp className="mt-2 h-4 w-4 text-monkey-green" />}
            </button>
          ))}
        </section>

        <section className="mt-4 rounded-card bg-white p-4 shadow-card">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black">Presupuesto del {periodLabels[wallet.period].toLowerCase()}</h2>
            <button onClick={() => { setBudget(String(wallet.budgetLimit)); setBudgetOpen(true); }} className="rounded-pill bg-gray-100 px-3 py-2 text-xs font-black text-monkey-muted"><Edit3 className="mr-1 inline h-3.5 w-3.5" />Editar</button>
          </div>
          <div className="mt-4 flex items-center justify-between text-sm font-semibold text-monkey-muted">
            <span>{budgetPercent}% utilizado</span>
            <span>{money(wallet.expenses, wallet.currency)} / {money(wallet.budgetLimit, wallet.currency)}</span>
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
            <span className="text-xs font-black text-monkey-muted">{periodLabels[wallet.period]}</span>
          </div>
          <div className="mt-3 space-y-3 rounded-card bg-white p-4 shadow-card">
            {wallet.categories.length > 0 ? wallet.categories.map((category) => (
              <article key={category.id} className="grid grid-cols-[44px_1fr_auto] items-center gap-3">
                <span className={`${colorMap[category.color]} grid h-11 w-11 place-items-center rounded-[16px]`}><AssetThumb icon={category.icon} size={32} /></span>
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-sm font-black">{category.name}</h3>
                    <span className="text-xs font-black">{money(category.amount, wallet.currency)}</span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-pill bg-gray-100"><div className={`${barMap[category.color]} h-full rounded-pill`} style={{ width: `${category.percent}%` }} /></div>
                </div>
                <span className="text-xs font-bold text-monkey-muted">{category.percent}%</span>
              </article>
            )) : <p className="py-3 text-center text-sm font-semibold text-monkey-muted">Aún no hay gastos en este periodo.</p>}
          </div>
        </section>

        <section className="mt-4 rounded-card bg-gradient-to-br from-monkey-green to-monkey-greenDark p-4 text-white shadow-float">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-[16px] bg-white/20"><Lightbulb className="h-6 w-6" /></span>
            <div className="flex-1"><h2 className="text-sm font-black">Consejo inteligente</h2><p className="mt-1 text-xs leading-5 text-white/90">{wallet.tip}</p></div>
            <ArrowRight className="h-5 w-5" />
          </div>
        </section>

        <section className="mt-4 rounded-card bg-white p-4 shadow-card">
          <div className="flex items-center justify-between"><h2 className="text-sm font-black">Meta de ahorro</h2><button onClick={() => setGoalOpen(true)} className="text-xs font-black text-monkey-green">+ meta</button></div>
          {firstGoal ? (
            <div className="mt-4 grid grid-cols-[48px_1fr_auto] items-center gap-3">
              <span className="grid h-12 w-12 place-items-center rounded-[16px] bg-purple-100"><AssetThumb icon={firstGoal.icon} size={34} /></span>
              <div><p className="text-sm font-black">{firstGoal.title}</p><div className="mt-2 h-2 overflow-hidden rounded-pill bg-gray-100"><div className="h-full rounded-pill bg-monkey-green" style={{ width: `${goalPercent}%` }} /></div></div>
              <div className="text-right text-xs font-black"><p>{money(firstGoal.current, wallet.currency)} / {money(firstGoal.target, wallet.currency)}</p><p className="mt-1 text-monkey-muted">{goalPercent}%</p></div>
            </div>
          ) : <p className="mt-3 text-sm font-semibold text-monkey-muted">Creá una meta para separar tus ahorros.</p>}
        </section>

        <section className="mt-4 rounded-card bg-white p-4 shadow-card">
          <div className="flex items-center justify-between gap-3">
            <div><h2 className="text-sm font-black">Historial reciente</h2><p className="mt-1 text-[11px] font-bold text-monkey-muted">5 movimientos por página</p></div>
            <button onClick={refreshHistory} disabled={syncing} className="grid h-10 w-10 place-items-center rounded-full bg-green-50 text-monkey-green transition active:scale-95 disabled:opacity-60" aria-label="Refrescar historial"><RefreshCw className={cn("h-4 w-4", syncing && "animate-spin")} /></button>
          </div>
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
            {filterTabs.map((item) => (
              <button key={item} type="button" onClick={() => { setHistoryFilter(item); setHistoryPage(0); }} className={cn("shrink-0 rounded-pill px-3 py-2 text-[11px] font-black", historyFilter === item ? "bg-monkey-green text-white" : "bg-gray-100 text-monkey-muted")}><Filter className="mr-1 inline h-3 w-3" />{filterLabels[item]}</button>
            ))}
          </div>
          <div className="mt-3 space-y-2">
            {recentTransactions.length > 0 ? recentTransactions.map((transaction: WalletTransaction) => (
              <article key={transaction.id} className="grid grid-cols-[40px_1fr_auto_36px] items-center gap-2 rounded-[16px] bg-gray-50 p-2">
                <span className={cn("grid h-10 w-10 place-items-center rounded-[14px]", colorMap[transaction.color])}><AssetThumb icon={transaction.icon} size={30} /></span>
                <div className="min-w-0"><p className="truncate text-sm font-black">{transaction.title}</p><p className="truncate text-[11px] font-semibold text-monkey-muted">{transactionLabels[transaction.type]} · {transaction.category} · {transaction.date}</p></div>
                <strong className={cn("text-xs", toneFor(transaction.type))}>{signFor(transaction.type)}{money(transaction.amount, wallet.currency)}</strong>
                <button onClick={() => removeTransaction(transaction.id)} className="grid h-8 w-8 place-items-center rounded-full bg-pink-50 text-monkey-pink" aria-label="Eliminar movimiento"><Trash2 className="h-4 w-4" /></button>
              </article>
            )) : <p className="py-3 text-center text-sm font-semibold text-monkey-muted">No hay movimientos para este filtro.</p>}
          </div>
          <div className="mt-3 flex items-center justify-between">
            <button type="button" disabled={safePage === 0} onClick={() => setHistoryPage((page) => Math.max(0, page - 1))} className="rounded-pill bg-gray-100 px-4 py-2 text-xs font-black text-monkey-muted disabled:opacity-40"><ArrowLeft className="mr-1 inline h-3.5 w-3.5" />Anterior</button>
            <span className="text-xs font-black text-monkey-muted">{safePage + 1} / {totalPages}</span>
            <button type="button" disabled={safePage >= totalPages - 1} onClick={() => setHistoryPage((page) => Math.min(totalPages - 1, page + 1))} className="rounded-pill bg-gray-100 px-4 py-2 text-xs font-black text-monkey-muted disabled:opacity-40">Siguiente<ArrowRight className="ml-1 inline h-3.5 w-3.5" /></button>
          </div>
        </section>
      </section>

      <button onClick={() => openMovement("expense")} className="fixed bottom-[104px] right-[calc(50%-195px)] z-30 grid h-16 w-16 place-items-center rounded-full bg-monkey-green text-white shadow-float transition active:scale-95" aria-label="Agregar movimiento"><Plus /></button>

      <FormSheet open={movementOpen} title="Agregar movimiento" subtitle="Registrá ingresos, extras, gastos o ahorros. El periodo se calcula por fecha." submitLabel="Guardar movimiento" onClose={() => setMovementOpen(false)} onSubmit={submitMovement}>
        <div className="grid min-w-0 grid-cols-4 gap-1 rounded-pill bg-gray-100 p-1 text-[10px] font-black">
          {transactionTabs.map((item) => (
            <button key={item} type="button" onClick={() => changeType(item)} className={cn("min-w-0 rounded-pill px-1 py-2", type === item ? "bg-monkey-green text-white" : "text-monkey-muted")}><span className="block truncate">{transactionLabels[item]}</span></button>
          ))}
        </div>
        <Field label="Nombre" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Ej. Almuerzo, mesada, bono" />
        <Field label="Monto" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="0" type="number" min="0" step="1" />
        <SelectField label="Categoría" value={category} options={activeCategories} onChange={setCategory} />
        <Field label="Fecha" value={date} onChange={(event) => setDate(event.target.value)} type="date" />
        <AssetPicker label="Ícono del movimiento" assets={activeWalletAssets} value={icon} onChange={setIcon} />
      </FormSheet>

      <FormSheet open={budgetOpen} title="Editar presupuesto" subtitle={`Definí tu límite para ${periodLabels[wallet.period].toLowerCase()}.`} submitLabel="Guardar presupuesto" onClose={() => setBudgetOpen(false)} onSubmit={submitBudget}>
        <Field label="Presupuesto" value={budget} onChange={(event) => setBudget(event.target.value)} type="number" min="1" step="1" />
      </FormSheet>

      <FormSheet open={goalOpen} title="Nueva meta" subtitle="Separá dinero para algo importante." submitLabel="Guardar meta" onClose={() => setGoalOpen(false)} onSubmit={submitGoal}>
        <div className="grid place-items-center rounded-card bg-green-50 p-4 text-monkey-green"><Target className="h-8 w-8" /><span className="mt-2 text-xs font-black">Meta de ahorro</span></div>
        <AssetPicker label="Ícono de la meta" assets={getWalletAssetsByType("saving")} value={goalIcon} onChange={setGoalIcon} />
        <Field label="Nombre" value={goalTitle} onChange={(event) => setGoalTitle(event.target.value)} placeholder="Ej. Viaje, teléfono, emergencia" />
        <Field label="Monto objetivo" value={goalTarget} onChange={(event) => setGoalTarget(event.target.value)} type="number" min="1" step="1" />
        <Field label="Monto actual" value={goalCurrent} onChange={(event) => setGoalCurrent(event.target.value)} type="number" min="0" step="1" />
      </FormSheet>
    </AppShell>
  );
}
