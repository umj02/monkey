"use client";

import { useMemo, useState } from "react";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, CalendarDays, CheckCircle2, Edit3, Filter, Lightbulb, Plus, RefreshCw, Target, Trash2 } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Field, TextAreaField } from "@/components/field";
import { FormSheet } from "@/components/form-sheet";
import { MonkeyAvatar } from "@/components/monkey-avatar";
import { AssetPicker } from "@/components/asset-picker";
import { AssetThumb } from "@/components/asset-thumb";
import { getWalletAssetsByType } from "@/lib/asset-library";
import { Toast, type ToastState } from "@/components/toast";
import { useWallet } from "@/hooks/use-wallet";
import { useCategoryPreferences } from "@/hooks/use-category-preferences";
import { cn } from "@/lib/utils";
import { getPlannedExpenseDueLabel, getPlannedExpenseStatusForPeriod, getWalletPeriodRange, isPlannedExpenseInPeriod, isTransactionInPeriod, PLANNED_EXPENSE_CATEGORIES, VARIABLE_EXPENSE_CATEGORIES } from "@/lib/services/wallet-service";
import type { WalletGoal, WalletPeriod, WalletPlannedExpense, WalletTransaction, WalletTransactionType } from "@/types";

const periodLabels: Record<WalletPeriod, string> = { monthly: "Mes", biweekly: "Quincena", weekly: "Semana" };
const transactionLabels: Record<WalletTransactionType, string> = { income: "Ingreso", extra: "Extra", expense: "Gasto", saving: "Ahorro" };
const transactionTabs: WalletTransactionType[] = ["income", "extra", "expense", "saving"];
const filterTabs: Array<"all" | WalletTransactionType> = ["all", "income", "extra", "expense", "saving"];
const filterLabels: Record<"all" | WalletTransactionType, string> = { all: "Todos", ...transactionLabels };
const incomeCategories = ["Mesada", "Trabajo", "Regalo", "Venta", "Otro"];
const extraCategories = ["Extra", "Bono", "Regalo", "Venta", "Otro"];
const savingCategories = ["Ahorro", "iPhone 15", "Viaje", "Emergencia", "Otro"];
const frequencyLabels = { monthly: "Mensual", biweekly: "Quincenal", weekly: "Semanal", yearly: "Anual", one_time: "Una sola vez" } as const;
const frequencyOptions = [
  { value: "monthly", label: "Mensual" },
  { value: "biweekly", label: "Quincenal" },
  { value: "weekly", label: "Semanal" },
  { value: "yearly", label: "Anual" },
  { value: "one_time", label: "Una sola vez" },
] as const;
const frequencyHelp: Record<WalletPlannedExpense["frequency"], string> = {
  monthly: "Se reactiva cada mes usando el día de la fecha base.",
  biweekly: "Se activa en la primera y segunda quincena. Ej.: si elegís día 5, también aparece cerca del día 20.",
  weekly: "Se reactiva cada semana el mismo día de la fecha base.",
  yearly: "Se reactiva una vez al año en la misma fecha.",
  one_time: "Solo aparece una vez; al marcarlo pagado no se reactiva.",
};
const statusMap = {
  paid: "bg-green-100 text-monkey-greenDark",
  pending: "bg-yellow-100 text-orange-700",
  overdue: "bg-pink-100 text-monkey-pink",
} as const;
const statusLabel = { paid: "Pagado", pending: "Pendiente", overdue: "Vencido" } as const;
const colorMap = { green: "bg-green-100 text-monkey-greenDark", orange: "bg-orange-100 text-orange-600", purple: "bg-purple-100 text-purple-700", pink: "bg-pink-100 text-monkey-pink", blue: "bg-sky-100 text-sky-700", yellow: "bg-yellow-100 text-orange-600" } as const;
const barMap = { green: "bg-monkey-green", orange: "bg-monkey-orange", purple: "bg-monkey-purple", pink: "bg-monkey-pink", blue: "bg-monkey-blue", yellow: "bg-monkey-yellow" } as const;
const badgeMap = { success: "bg-green-100 text-monkey-greenDark", warning: "bg-yellow-100 text-orange-700", info: "bg-sky-100 text-sky-700" } as const;

function money(value: number, currency = "CRC") {
  return new Intl.NumberFormat("es-CR", { style: "currency", currency, maximumFractionDigits: currency === "CRC" ? 0 : 2 }).format(value);
}
function today() { return new Date().toISOString().slice(0, 10); }
function categoriesForType(type: WalletTransactionType) {
  if (type === "income") return incomeCategories;
  if (type === "extra") return extraCategories;
  if (type === "saving") return savingCategories;
  return VARIABLE_EXPENSE_CATEGORIES;
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
function signFor(type: WalletTransactionType) { return type === "expense" || type === "saving" ? "-" : "+"; }
function toneFor(type: WalletTransactionType) { if (type === "expense") return "text-monkey-pink"; if (type === "saving") return "text-purple-700"; return "text-monkey-greenDark"; }

type SelectOption = string | { value: string; label: string };
function SelectField({ label, value, options, onChange }: { label: string; value: string; options: SelectOption[]; onChange: (value: string) => void }) {
  return <label className="block"><span className="mb-2 block text-xs font-black uppercase tracking-[.08em] text-monkey-muted">{label}</span><select value={value} onChange={(event) => onChange(event.target.value)} className="h-[52px] w-full rounded-[18px] border border-monkey-line bg-white px-4 text-sm font-semibold outline-none transition focus:border-monkey-green focus:ring-4 focus:ring-green-100">{options.map((option) => { const item = typeof option === "string" ? { value: option, label: option } : option; return <option key={item.value} value={item.value}>{item.label}</option>; })}</select></label>;
}
function HistoryFilterSelect({ value, onChange }: { value: "all" | WalletTransactionType; onChange: (value: "all" | WalletTransactionType) => void }) {
  return <label className="mt-3 block"><span className="mb-2 flex items-center gap-1.5 text-[11px] font-black uppercase tracking-[.08em] text-monkey-muted"><Filter className="h-3.5 w-3.5" /> Agrupar historial</span><div className="relative"><select value={value} onChange={(event) => onChange(event.target.value as "all" | WalletTransactionType)} className="h-[48px] w-full appearance-none rounded-[18px] border border-monkey-line bg-gray-50 px-4 pr-10 text-sm font-black text-monkey-ink outline-none transition focus:border-monkey-green focus:bg-white focus:ring-4 focus:ring-green-100">{filterTabs.map((item) => <option key={item} value={item}>{filterLabels[item]}</option>)}</select><ArrowDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-monkey-muted" /></div></label>;
}

export default function WalletPage() {
  const { wallet, changePeriod, updateWallet, addTransaction, deleteTransaction, addGoal, addGoalAmount, addPlannedExpense, savePlannedExpense, removePlannedExpense, payPlannedExpense, refreshWallet, syncing, syncStatus, lastError } = useWallet();
  const { walletExpenseItems } = useCategoryPreferences();
  const [toast, setToast] = useState<ToastState>(null);
  const [movementOpen, setMovementOpen] = useState(false);
  const [budgetOpen, setBudgetOpen] = useState(false);
  const [goalOpen, setGoalOpen] = useState(false);
  const [plannedOpen, setPlannedOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [expenseView, setExpenseView] = useState<"variable" | "planned">("variable");
  const [type, setType] = useState<WalletTransactionType>("expense");
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Comida");
  const [date, setDate] = useState(today());
  const [icon, setIcon] = useState("wallet-food");
  const [note, setNote] = useState("");
  const [editingTransactionId, setEditingTransactionId] = useState<string | null>(null);
  const [budget, setBudget] = useState(String(wallet.budgetLimit));
  const [goalTitle, setGoalTitle] = useState("");
  const [goalTarget, setGoalTarget] = useState("");
  const [goalCurrent, setGoalCurrent] = useState("0");
  const [goalIcon, setGoalIcon] = useState("wallet-savings");
  const [historyFilter, setHistoryFilter] = useState<"all" | WalletTransactionType>("all");
  const [historyPage, setHistoryPage] = useState(0);
  const [goalContributionOpen, setGoalContributionOpen] = useState(false);
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const [goalContributionAmount, setGoalContributionAmount] = useState("");
  const [selectedDetail, setSelectedDetail] = useState<{ kind: "transaction"; item: WalletTransaction } | { kind: "planned"; item: WalletPlannedExpense } | null>(null);
  const [planId, setPlanId] = useState<string | null>(null);
  const [planName, setPlanName] = useState("");
  const [planAmount, setPlanAmount] = useState("");
  const [planCategory, setPlanCategory] = useState("Internet");
  const [planDueDate, setPlanDueDate] = useState(today());
  const [planFrequency, setPlanFrequency] = useState<WalletPlannedExpense["frequency"]>("monthly");
  const [planIcon, setPlanIcon] = useState("wallet-phone");
  const [planNotes, setPlanNotes] = useState("");

  const periodRange = useMemo(() => getWalletPeriodRange(wallet.period), [wallet.period]);
  const periodTransactions = useMemo(() => wallet.transactions.filter((tx) => isTransactionInPeriod(tx, wallet.period)), [wallet.transactions, wallet.period]);
  const filteredTransactions = useMemo(() => periodTransactions.filter((transaction) => historyFilter === "all" || transaction.type === historyFilter).sort((a, b) => `${b.date}-${b.id}`.localeCompare(`${a.date}-${a.id}`)), [periodTransactions, historyFilter]);
  const totalPages = Math.max(1, Math.ceil(filteredTransactions.length / 5));
  const safePage = Math.min(historyPage, totalPages - 1);
  const recentTransactions = filteredTransactions.slice(safePage * 5, safePage * 5 + 5);
  const plannedInPeriod = useMemo(() => wallet.plannedExpenses.filter((expense) => expense.enabled !== false && isPlannedExpenseInPeriod(expense, wallet.period)).sort((a, b) => getPlannedExpenseDueLabel(a, wallet.period).localeCompare(getPlannedExpenseDueLabel(b, wallet.period))), [wallet.plannedExpenses, wallet.period]);
  const plannedTotals = plannedInPeriod.reduce((acc, expense) => { const status = getPlannedExpenseStatusForPeriod(expense, wallet.period, wallet.transactions); acc.total += expense.amount; if (status === "paid") acc.paid += expense.amount; else if (status === "overdue") acc.overdue += expense.amount; else acc.pending += expense.amount; return acc; }, { total: 0, paid: 0, pending: 0, overdue: 0 });
  const budgetPercent = Math.min(100, Math.round((wallet.expenses / wallet.budgetLimit) * 100));
  const visibleGoals = wallet.goals.slice(0, 3);
  const selectedGoal = selectedGoalId ? wallet.goals.find((goal) => goal.id === selectedGoalId) || null : null;
  const enabledExpenseCategories = useMemo(() => walletExpenseItems.filter((item) => item.isEnabled).map((item) => item.label), [walletExpenseItems]);
  const activeCategories = useMemo(() => {
    const base = type === "expense" && enabledExpenseCategories.length > 0 ? enabledExpenseCategories : categoriesForType(type);
    return base.includes(category) ? base : [category, ...base];
  }, [category, enabledExpenseCategories, type]);
  const selectedExpenseCategory = useMemo(() => walletExpenseItems.find((item) => item.label === category || item.key === category) ?? null, [category, walletExpenseItems]);
  const activeWalletAssets = getWalletAssetsByType(type);

  function openMovement(nextType: WalletTransactionType = "expense", transaction?: WalletTransaction) {
    setType(transaction?.type || nextType);
    setTitle(transaction?.title || "");
    setAmount(transaction ? String(transaction.amount) : "");
    setCategory(transaction?.category || walletExpenseItems.find((item) => item.key === transaction?.categoryKey)?.label || defaultCategory(transaction?.type || nextType));
    setIcon(transaction?.icon || defaultIcon(transaction?.type || nextType));
    setDate(transaction?.date || today());
    setNote(transaction?.note || "");
    setEditingTransactionId(transaction?.id || null);
    setMovementOpen(true);
  }
  function changeType(nextType: WalletTransactionType) {
    setType(nextType);
    const nextCategories = nextType === "expense" && enabledExpenseCategories.length > 0 ? enabledExpenseCategories : categoriesForType(nextType);
    setCategory(nextCategories[0] ?? defaultCategory(nextType));
    setIcon(defaultIcon(nextType));
  }
  function submitMovement() {
    const parsedAmount = Number(amount);
    if (title.trim().length < 3) return setToast({ message: "Agregá un nombre de al menos 3 letras.", type: "error" });
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) return setToast({ message: "Ingresá un monto válido mayor a 0.", type: "error" });
    if (editingTransactionId) deleteTransaction(editingTransactionId);
    addTransaction({ type, title: title.trim(), amount: parsedAmount, category, categoryKey: type === "expense" ? (selectedExpenseCategory?.key ?? null) : null, date, period: wallet.period, currency: wallet.currency, icon, expenseKind: type === "expense" ? "variable" : undefined, note: note.trim() || null });
    setHistoryPage(0); setMovementOpen(false); setEditingTransactionId(null); setToast({ message: editingTransactionId ? "Movimiento actualizado." : `${transactionLabels[type]} agregado.`, type: "success" });
  }
  function openPlanned(expense?: WalletPlannedExpense) {
    setPlanId(expense?.id || null); setPlanName(expense?.name || ""); setPlanAmount(expense ? String(expense.amount) : ""); setPlanCategory(expense?.category || "Internet"); setPlanDueDate(expense?.dueDate || today()); setPlanFrequency(expense?.frequency || "monthly"); setPlanIcon(expense?.icon || "wallet-phone"); setPlanNotes(expense?.notes || ""); setPlannedOpen(true);
  }
  function submitPlanned() {
    const parsedAmount = Number(planAmount);
    if (planName.trim().length < 3) return setToast({ message: "Agregá un nombre para el gasto planificado.", type: "error" });
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) return setToast({ message: "Ingresá un monto válido mayor a 0.", type: "error" });
    const payload: WalletPlannedExpense = { id: planId || "", name: planName.trim(), category: planCategory, categoryKey: walletExpenseItems.find((item) => item.label === planCategory || item.key === planCategory)?.key ?? null, amount: parsedAmount, currency: wallet.currency, dueDate: planDueDate, frequency: planFrequency, status: "pending", paidAt: null, icon: planIcon, notes: planNotes.trim() || null, enabled: true };
    if (planId) savePlannedExpense(payload); else addPlannedExpense(payload);
    setPlannedOpen(false); setToast({ message: planId ? "Gasto planificado actualizado." : "Gasto planificado creado.", type: "success" });
  }
  function openDetail(item: WalletTransaction | WalletPlannedExpense, kind: "transaction" | "planned") { setSelectedDetail({ kind, item } as typeof selectedDetail); setDetailOpen(true); }
  function submitBudget() { const parsedBudget = Number(budget); if (!Number.isFinite(parsedBudget) || parsedBudget <= 0) return setToast({ message: "El presupuesto debe ser mayor a 0.", type: "error" }); updateWallet({ budgetLimit: parsedBudget }); setBudgetOpen(false); setToast({ message: "Presupuesto actualizado.", type: "success" }); }
  function submitGoal() { const parsedTarget = Number(goalTarget); const parsedCurrent = Number(goalCurrent); if (wallet.goals.length >= 3) return setToast({ message: "Podés tener hasta 3 metas activas.", type: "error" }); if (goalTitle.trim().length < 3) return setToast({ message: "Agregá un nombre para la meta.", type: "error" }); if (!Number.isFinite(parsedTarget) || parsedTarget <= 0) return setToast({ message: "Ingresá un monto objetivo válido.", type: "error" }); addGoal({ title: goalTitle.trim(), target: parsedTarget, current: Math.max(0, parsedCurrent || 0), currency: wallet.currency, icon: goalIcon }); setGoalOpen(false); setToast({ message: "Meta creada.", type: "success" }); }
  function openGoalContribution(goal: WalletGoal) { setSelectedGoalId(goal.id); setGoalContributionAmount(""); setGoalContributionOpen(true); }
  function submitGoalContribution() { const parsedAmount = Number(goalContributionAmount); if (!selectedGoal) return setToast({ message: "Elegí una meta.", type: "error" }); if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) return setToast({ message: "Ingresá un monto válido.", type: "error" }); const ok = addGoalAmount(selectedGoal.id, parsedAmount); if (!ok) return setToast({ message: "No se pudo actualizar esta meta.", type: "error" }); setGoalContributionOpen(false); setGoalContributionAmount(""); setSelectedGoalId(null); setToast({ message: "Avance agregado a la meta.", type: "success" }); }
  function refreshHistory() { refreshWallet(); setHistoryPage(0); setToast({ message: lastError ? "No se pudo actualizar." : "Historial actualizado.", type: lastError ? "error" : "success" }); }

  return <AppShell><Toast toast={toast} onClose={() => setToast(null)} />
    <section className="page-pad pb-8 pt-8">
      <header className="flex items-center justify-between"><div><p className="text-xl font-black tracking-tight">¡Hola, Juan! 👋</p><p className="mt-1 text-sm font-semibold text-monkey-muted">Así va tu dinero hoy</p></div><MonkeyAvatar size={54} className="rounded-full bg-white shadow-card" /></header>
      <div className="mt-5 grid min-w-0 grid-cols-3 gap-1 rounded-pill bg-gray-100 p-1 text-[11px] font-black">{(["monthly", "biweekly", "weekly"] as WalletPeriod[]).map((period) => <button key={period} onClick={() => { changePeriod(period); setHistoryPage(0); }} className={cn("min-w-0 rounded-pill px-1 py-2 transition", wallet.period === period ? "bg-monkey-green text-white shadow-sm" : "text-monkey-muted")}><span className="block truncate">{periodLabels[period]}</span></button>)}</div>
      <p className="mt-2 flex items-center justify-center gap-1 text-[11px] font-black uppercase tracking-[.08em] text-monkey-muted"><CalendarDays className="h-3.5 w-3.5" />{periodRange.start} · {periodRange.end}</p>
      <p className={cn("mt-1 text-center text-[11px] font-bold", lastError ? "text-monkey-pink" : syncStatus === "saving" || syncing ? "text-monkey-muted" : "text-monkey-greenDark")}>{lastError || (syncStatus === "saving" ? "Guardando cambios..." : syncing ? "Actualizando Wallet..." : syncStatus === "synced" ? "Wallet sincronizada" : "")}</p>

      <section className="mt-5 overflow-hidden rounded-card bg-white p-5 shadow-card"><div className="flex items-center justify-between gap-4"><div><p className="text-sm font-black text-monkey-ink">Balance disponible</p><strong className="mt-2 block text-[34px] font-black tracking-tight text-monkey-ink">{money(wallet.balance, wallet.currency)}</strong><span className="mt-2 inline-flex rounded-pill bg-green-100 px-3 py-1 text-xs font-black text-monkey-greenDark">{wallet.savings > 0 ? `+${money(wallet.savings, wallet.currency)} ahorrado` : "Agregá tu primer ahorro"}</span></div><div className="grid h-20 w-20 place-items-center rounded-[24px] bg-green-50 shadow-sm"><AssetThumb icon="wallet-income" size={62} /></div></div></section>
      <section className="mt-3 grid grid-cols-4 gap-2">{transactionTabs.map((item) => <button key={item} onClick={() => openMovement(item)} className="rounded-[18px] bg-white p-3 text-left shadow-card transition active:scale-[.98]"><p className="truncate text-[10px] font-bold text-monkey-muted">{transactionLabels[item]}</p><strong className="mt-2 block truncate text-xs font-black">{money(item === "income" ? wallet.income : item === "extra" ? wallet.extras || 0 : item === "expense" ? wallet.expenses : wallet.savings, wallet.currency)}</strong>{item === "expense" ? <ArrowDown className="mt-2 h-4 w-4 text-monkey-pink" /> : <ArrowUp className="mt-2 h-4 w-4 text-monkey-green" />}</button>)}</section>
      <section className="mt-4 rounded-card bg-white p-4 shadow-card"><div className="flex items-center justify-between"><h2 className="text-sm font-black">Presupuesto del {periodLabels[wallet.period].toLowerCase()}</h2><button onClick={() => { setBudget(String(wallet.budgetLimit)); setBudgetOpen(true); }} className="rounded-pill bg-gray-100 px-3 py-2 text-xs font-black text-monkey-muted"><Edit3 className="mr-1 inline h-3.5 w-3.5" />Editar</button></div><div className="mt-4 flex items-center justify-between text-sm font-semibold text-monkey-muted"><span>{budgetPercent}% utilizado</span><span>{money(wallet.expenses, wallet.currency)} / {money(wallet.budgetLimit, wallet.currency)}</span></div><div className="mt-3 h-3 overflow-hidden rounded-pill bg-gray-100"><div className={cn("h-full rounded-pill transition-all duration-500", budgetPercent > 85 ? "bg-monkey-pink" : "bg-monkey-green")} style={{ width: `${budgetPercent}%` }} /></div></section>
      <section className="mt-4 rounded-card bg-white p-4 shadow-card"><div className="flex items-center justify-between"><h2 className="text-sm font-black">Badges inteligentes</h2><span className="text-xs font-black text-monkey-muted">Auto</span></div><div className="mt-3 flex flex-wrap gap-2">{wallet.badges.map((badge) => <span key={badge.id} className={cn("inline-flex items-center gap-1.5 rounded-pill px-3 py-2 text-xs font-black", badgeMap[badge.tone])}>{badge.icon} {badge.label}</span>)}</div></section>

      <section className="mt-5"><div className="flex items-center justify-between"><h2 className="text-sm font-black">Gastos</h2><span className="text-xs font-black text-monkey-muted">{periodLabels[wallet.period]}</span></div><div className="mt-3 rounded-card bg-white p-4 shadow-card"><div className="grid grid-cols-2 rounded-pill bg-gray-100 p-1 text-xs font-black"><button onClick={() => setExpenseView("variable")} className={cn("rounded-pill py-2", expenseView === "variable" ? "bg-monkey-green text-white" : "text-monkey-muted")}>Variables</button><button onClick={() => setExpenseView("planned")} className={cn("rounded-pill py-2", expenseView === "planned" ? "bg-monkey-green text-white" : "text-monkey-muted")}>Planificados</button></div>
        {expenseView === "variable" ? <div className="mt-4 space-y-3">{wallet.categories.length > 0 ? wallet.categories.map((category) => <article key={category.id} className="grid grid-cols-[44px_1fr_auto] items-center gap-3"><span className={`${colorMap[category.color]} grid h-11 w-11 place-items-center rounded-[16px]`}><AssetThumb icon={category.icon} size={32} /></span><div><div className="flex items-center justify-between gap-2"><h3 className="text-sm font-black">{category.name}</h3><span className="text-xs font-black">{money(category.amount, wallet.currency)}</span></div><div className="mt-2 h-2 overflow-hidden rounded-pill bg-gray-100"><div className={`${barMap[category.color]} h-full rounded-pill`} style={{ width: `${category.percent}%` }} /></div></div><span className="text-xs font-bold text-monkey-muted">{category.percent}%</span></article>) : <p className="py-3 text-center text-sm font-semibold text-monkey-muted">Aún no hay gastos variables en este periodo.</p>}</div> : <div className="mt-4 space-y-3"><div className="grid grid-cols-3 gap-2 text-center text-[11px] font-black"><span className="rounded-[14px] bg-green-50 p-2 text-monkey-greenDark">Pagado<br />{money(plannedTotals.paid, wallet.currency)}</span><span className="rounded-[14px] bg-yellow-50 p-2 text-orange-700">Pendiente<br />{money(plannedTotals.pending, wallet.currency)}</span><span className="rounded-[14px] bg-pink-50 p-2 text-monkey-pink">Vencido<br />{money(plannedTotals.overdue, wallet.currency)}</span></div>{plannedInPeriod.slice(0, 4).map((expense) => { const status = getPlannedExpenseStatusForPeriod(expense, wallet.period, wallet.transactions); return <article key={expense.id} onClick={() => openDetail(expense, "planned")} className="grid cursor-pointer grid-cols-[44px_1fr_auto] items-center gap-3 rounded-[18px] bg-gray-50 p-2 transition active:scale-[.99]"><span className="grid h-11 w-11 place-items-center rounded-[16px] bg-white"><AssetThumb icon={expense.icon} size={32} /></span><div className="min-w-0"><p className="truncate text-sm font-black">{expense.name}</p><p className="mt-1 truncate text-[11px] font-bold text-monkey-muted">{expense.category} · Vence {getPlannedExpenseDueLabel(expense, wallet.period)}</p></div><div className="text-right"><strong className="block text-xs font-black">{money(expense.amount, wallet.currency)}</strong><span className={cn("mt-1 inline-flex rounded-pill px-2 py-1 text-[10px] font-black", statusMap[status])}>{statusLabel[status]}</span></div></article>; })}{plannedInPeriod.length === 0 ? <p className="py-3 text-center text-sm font-semibold text-monkey-muted">Aún no hay gastos planificados en este periodo.</p> : null}<button type="button" onClick={() => openPlanned()} className="mt-1 w-full rounded-pill bg-green-50 px-4 py-3 text-sm font-black text-monkey-green">+ gasto planificado</button></div>}
      </div></section>
      <section className="mt-4 rounded-card bg-gradient-to-br from-monkey-green to-monkey-greenDark p-4 text-white shadow-float"><div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-[16px] bg-white/20"><Lightbulb className="h-6 w-6" /></span><div className="flex-1"><h2 className="text-sm font-black">Consejo inteligente</h2><p className="mt-1 text-xs leading-5 text-white/90">{plannedTotals.pending || plannedTotals.overdue ? `Tenés ${money(plannedTotals.pending + plannedTotals.overdue, wallet.currency)} en gastos planificados por cubrir este periodo.` : wallet.tip}</p></div><ArrowRight className="h-5 w-5" /></div></section>
      <section className="mt-4 rounded-card bg-white p-4 shadow-card"><div className="flex items-center justify-between gap-3"><div><h2 className="text-sm font-black">Metas de ahorro</h2><p className="mt-1 text-[11px] font-bold text-monkey-muted">Hasta 3 metas activas</p></div><button onClick={() => { if (wallet.goals.length >= 3) return setToast({ message: "Ya tenés 3 metas activas.", type: "info" }); setGoalOpen(true); }} className={cn("rounded-pill px-3 py-2 text-xs font-black", wallet.goals.length >= 3 ? "bg-gray-100 text-monkey-muted" : "bg-green-50 text-monkey-green")}>+ meta</button></div>{visibleGoals.length ? <div className="mt-4 space-y-3">{visibleGoals.map((goal) => { const percent = Math.min(100, Math.round((goal.current / goal.target) * 100)); return <article key={goal.id} className="grid grid-cols-[48px_1fr_auto] items-center gap-3 rounded-[18px] bg-gray-50 p-2"><span className="grid h-12 w-12 place-items-center rounded-[16px] bg-purple-100"><AssetThumb icon={goal.icon} size={34} /></span><div className="min-w-0"><p className="truncate text-sm font-black">{goal.title}</p><div className="mt-2 h-2 overflow-hidden rounded-pill bg-white"><div className="h-full rounded-pill bg-monkey-green" style={{ width: `${percent}%` }} /></div><p className="mt-1 truncate text-[11px] font-bold text-monkey-muted">{money(goal.current, wallet.currency)} / {money(goal.target, wallet.currency)} · {percent}%</p></div><button type="button" onClick={() => openGoalContribution(goal)} className="rounded-full bg-green-50 px-3 py-2 text-xs font-black text-monkey-green transition active:scale-95">+ monto</button></article>; })}</div> : <p className="mt-3 text-sm font-semibold text-monkey-muted">Creá una meta para separar tus ahorros.</p>}</section>
      <section className="mt-4 rounded-card bg-white p-4 shadow-card"><div className="flex items-center justify-between gap-3"><div><h2 className="text-sm font-black">Historial reciente</h2><p className="mt-1 text-[11px] font-bold text-monkey-muted">5 movimientos por página</p></div><button onClick={refreshHistory} disabled={syncing} className="grid h-10 w-10 place-items-center rounded-full bg-green-50 text-monkey-green transition active:scale-95 disabled:opacity-60"><RefreshCw className={cn("h-4 w-4", syncing && "animate-spin")} /></button></div><HistoryFilterSelect value={historyFilter} onChange={(nextFilter) => { setHistoryFilter(nextFilter); setHistoryPage(0); }} /><div className="mt-3 space-y-2">{recentTransactions.length > 0 ? recentTransactions.map((transaction) => <article key={transaction.id} onClick={() => openDetail(transaction, "transaction")} className="grid cursor-pointer grid-cols-[40px_1fr_auto_36px] items-center gap-2 rounded-[16px] bg-gray-50 p-2 transition active:scale-[.99]"><span className={cn("grid h-10 w-10 place-items-center rounded-[14px]", colorMap[transaction.color])}><AssetThumb icon={transaction.icon} size={30} /></span><div className="min-w-0"><p className="truncate text-sm font-black">{transaction.title}</p><p className="truncate text-[11px] font-semibold text-monkey-muted">{transactionLabels[transaction.type]} · {transaction.expenseKind === "planned" ? "Planificado" : transaction.category} · {transaction.date}</p></div><strong className={cn("text-xs", toneFor(transaction.type))}>{signFor(transaction.type)}{money(transaction.amount, wallet.currency)}</strong><button onClick={(event) => { event.stopPropagation(); deleteTransaction(transaction.id); setToast({ message: "Movimiento eliminado.", type: "info" }); }} className="grid h-8 w-8 place-items-center rounded-full bg-pink-50 text-monkey-pink"><Trash2 className="h-4 w-4" /></button></article>) : <p className="py-3 text-center text-sm font-semibold text-monkey-muted">No hay movimientos para este filtro.</p>}</div><div className="mt-3 flex items-center justify-between"><button type="button" disabled={safePage === 0} onClick={() => setHistoryPage((page) => Math.max(0, page - 1))} className="rounded-pill bg-gray-100 px-4 py-2 text-xs font-black text-monkey-muted disabled:opacity-40"><ArrowLeft className="mr-1 inline h-3.5 w-3.5" />Anterior</button><span className="text-xs font-black text-monkey-muted">{safePage + 1} / {totalPages}</span><button type="button" disabled={safePage >= totalPages - 1} onClick={() => setHistoryPage((page) => Math.min(totalPages - 1, page + 1))} className="rounded-pill bg-gray-100 px-4 py-2 text-xs font-black text-monkey-muted disabled:opacity-40">Siguiente<ArrowRight className="ml-1 inline h-3.5 w-3.5" /></button></div></section>
    </section>
    <button onClick={() => openMovement("expense")} className="fixed bottom-[104px] right-[calc(50%-195px)] z-30 grid h-16 w-16 place-items-center rounded-full bg-monkey-green text-white shadow-float transition active:scale-95"><Plus /></button>

    <FormSheet open={movementOpen} title={editingTransactionId ? "Editar movimiento" : "Agregar movimiento"} subtitle="Los gastos variables son los gastos simples u hormiga." submitLabel={editingTransactionId ? "Guardar cambios" : "Guardar movimiento"} onClose={() => setMovementOpen(false)} onSubmit={submitMovement}><div className="grid min-w-0 grid-cols-4 gap-1 rounded-pill bg-gray-100 p-1 text-[10px] font-black">{transactionTabs.map((item) => <button key={item} type="button" onClick={() => changeType(item)} className={cn("min-w-0 rounded-pill px-1 py-2", type === item ? "bg-monkey-green text-white" : "text-monkey-muted")}><span className="block truncate">{transactionLabels[item]}</span></button>)}</div><Field label="Nombre" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Ej. Almuerzo, mesada, bono" /><Field label="Monto" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="0" type="number" min="0" step="1" /><SelectField label="Categoría" value={category} options={activeCategories} onChange={setCategory} />{type === "expense" ? <p className="-mt-2 rounded-[16px] bg-green-50 px-4 py-3 text-xs font-bold leading-relaxed text-monkey-muted">Estas categorías vienen de Configuración › Categorías e iconos.</p> : null}<Field label="Fecha" value={date} onChange={(event) => setDate(event.target.value)} type="date" /><TextAreaField label="Nota opcional" value={note} onChange={(event) => setNote(event.target.value)} placeholder="Detalle del gasto, lugar o motivo" /><AssetPicker label="Ícono del movimiento" assets={activeWalletAssets} value={icon} onChange={setIcon} /></FormSheet>
    <FormSheet open={plannedOpen} title={planId ? "Editar gasto planificado" : "Nuevo gasto planificado"} subtitle="Usá categorías fijas para mantener métricas claras." submitLabel={planId ? "Guardar cambios" : "Guardar gasto"} onClose={() => setPlannedOpen(false)} onSubmit={submitPlanned}><Field label="Nombre" value={planName} onChange={(event) => setPlanName(event.target.value)} placeholder="Ej. Internet casa" /><Field label="Monto esperado" value={planAmount} onChange={(event) => setPlanAmount(event.target.value)} type="number" min="1" step="1" /><SelectField label="Categoría" value={planCategory} options={PLANNED_EXPENSE_CATEGORIES} onChange={setPlanCategory} /><Field label="Fecha base de pago" value={planDueDate} onChange={(event) => setPlanDueDate(event.target.value)} type="date" /><SelectField label="Frecuencia" value={planFrequency} options={[...frequencyOptions]} onChange={(value) => setPlanFrequency(value as WalletPlannedExpense["frequency"])} /><p className="-mt-2 rounded-[16px] bg-green-50 px-4 py-3 text-xs font-bold leading-relaxed text-monkey-muted">{frequencyHelp[planFrequency]}</p><TextAreaField label="Notas" value={planNotes} onChange={(event) => setPlanNotes(event.target.value)} placeholder="Contrato, referencia o detalle" /><AssetPicker label="Ícono previsto" assets={getWalletAssetsByType("expense")} value={planIcon} onChange={setPlanIcon} /></FormSheet>
    <FormSheet open={detailOpen} title={selectedDetail?.kind === "planned" ? "Detalle planificado" : "Detalle del movimiento"} subtitle="Revisá, editá o eliminá la información." submitLabel="Cerrar" onClose={() => setDetailOpen(false)} onSubmit={() => setDetailOpen(false)}>{selectedDetail?.kind === "transaction" ? <div className="space-y-3"><div className="rounded-[20px] bg-gray-50 p-4"><p className="text-lg font-black">{selectedDetail.item.title}</p><p className="mt-1 text-sm font-bold text-monkey-muted">{transactionLabels[selectedDetail.item.type]} · {selectedDetail.item.category}</p><strong className="mt-3 block text-2xl font-black">{money(selectedDetail.item.amount, wallet.currency)}</strong><p className="mt-1 text-xs font-bold text-monkey-muted">Fecha: {selectedDetail.item.date}</p>{selectedDetail.item.note ? <p className="mt-2 text-sm font-semibold text-monkey-muted">{selectedDetail.item.note}</p> : null}</div><button type="button" onClick={() => { openMovement(selectedDetail.item.type, selectedDetail.item); setDetailOpen(false); }} className="h-12 w-full rounded-pill bg-gray-100 text-sm font-black text-monkey-ink"><Edit3 className="mr-1 inline h-4 w-4" />Editar</button><button type="button" onClick={() => { deleteTransaction(selectedDetail.item.id); setDetailOpen(false); setToast({ message: "Movimiento eliminado.", type: "info" }); }} className="h-12 w-full rounded-pill bg-pink-50 text-sm font-black text-monkey-pink"><Trash2 className="mr-1 inline h-4 w-4" />Eliminar</button></div> : selectedDetail?.kind === "planned" ? <div className="space-y-3"><div className="rounded-[20px] bg-gray-50 p-4"><p className="text-lg font-black">{selectedDetail.item.name}</p><p className="mt-1 text-sm font-bold text-monkey-muted">{selectedDetail.item.category} · {frequencyLabels[selectedDetail.item.frequency]}</p><strong className="mt-3 block text-2xl font-black">{money(selectedDetail.item.amount, wallet.currency)}</strong><p className="mt-1 text-xs font-bold text-monkey-muted">Vence en este periodo: {getPlannedExpenseDueLabel(selectedDetail.item, wallet.period)}</p><span className={cn("mt-3 inline-flex rounded-pill px-3 py-2 text-xs font-black", statusMap[getPlannedExpenseStatusForPeriod(selectedDetail.item, wallet.period, wallet.transactions)])}>{statusLabel[getPlannedExpenseStatusForPeriod(selectedDetail.item, wallet.period, wallet.transactions)]}</span></div>{getPlannedExpenseStatusForPeriod(selectedDetail.item, wallet.period, wallet.transactions) !== "paid" ? <button type="button" onClick={() => { payPlannedExpense(selectedDetail.item.id); setDetailOpen(false); setToast({ message: "Gasto marcado como pagado.", type: "success" }); }} className="h-12 w-full rounded-pill bg-green-50 text-sm font-black text-monkey-green"><CheckCircle2 className="mr-1 inline h-4 w-4" />Marcar pagado</button> : null}<button type="button" onClick={() => { openPlanned(selectedDetail.item); setDetailOpen(false); }} className="h-12 w-full rounded-pill bg-gray-100 text-sm font-black text-monkey-ink"><Edit3 className="mr-1 inline h-4 w-4" />Editar</button><button type="button" onClick={() => { removePlannedExpense(selectedDetail.item.id); setDetailOpen(false); setToast({ message: "Gasto planificado eliminado.", type: "info" }); }} className="h-12 w-full rounded-pill bg-pink-50 text-sm font-black text-monkey-pink"><Trash2 className="mr-1 inline h-4 w-4" />Eliminar</button></div> : null}</FormSheet>
    <FormSheet open={budgetOpen} title="Editar presupuesto" subtitle={`Definí tu límite para ${periodLabels[wallet.period].toLowerCase()}.`} submitLabel="Guardar presupuesto" onClose={() => setBudgetOpen(false)} onSubmit={submitBudget}><Field label="Presupuesto" value={budget} onChange={(event) => setBudget(event.target.value)} type="number" min="1" step="1" /></FormSheet>
    <FormSheet open={goalOpen} title="Nueva meta" subtitle="Separá dinero para algo importante." submitLabel="Guardar meta" onClose={() => setGoalOpen(false)} onSubmit={submitGoal}><div className="grid place-items-center rounded-card bg-green-50 p-4 text-monkey-green"><Target className="h-8 w-8" /><span className="mt-2 text-xs font-black">Meta de ahorro</span></div><AssetPicker label="Ícono de la meta" assets={getWalletAssetsByType("saving")} value={goalIcon} onChange={setGoalIcon} /><Field label="Nombre" value={goalTitle} onChange={(event) => setGoalTitle(event.target.value)} placeholder="Ej. Viaje, teléfono, emergencia" /><Field label="Monto objetivo" value={goalTarget} onChange={(event) => setGoalTarget(event.target.value)} type="number" min="1" step="1" /><Field label="Monto actual" value={goalCurrent} onChange={(event) => setGoalCurrent(event.target.value)} type="number" min="0" step="1" /></FormSheet>
    <FormSheet open={goalContributionOpen} title="Agregar avance" subtitle={selectedGoal ? `Sumá dinero a “${selectedGoal.title}” sin crear la meta de nuevo.` : "Sumá dinero a una meta activa."} submitLabel="Agregar monto" onClose={() => { setGoalContributionOpen(false); setGoalContributionAmount(""); setSelectedGoalId(null); }} onSubmit={submitGoalContribution}>{selectedGoal ? <div className="grid grid-cols-[54px_1fr] items-center gap-3 rounded-[20px] bg-green-50 p-3"><span className="grid h-12 w-12 place-items-center rounded-[16px] bg-white"><AssetThumb icon={selectedGoal.icon} size={34} /></span><div className="min-w-0"><p className="truncate text-sm font-black text-monkey-ink">{selectedGoal.title}</p><p className="mt-1 text-xs font-bold text-monkey-muted">Actual: {money(selectedGoal.current, wallet.currency)} / {money(selectedGoal.target, wallet.currency)}</p></div></div> : null}<Field label="Monto a agregar" value={goalContributionAmount} onChange={(event) => setGoalContributionAmount(event.target.value)} type="number" min="1" step="1" placeholder="0" /></FormSheet>
  </AppShell>;
}
