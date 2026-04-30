import { createOptionalClient } from "@/lib/supabase/client";
import type { CalendarEvent, Note, Reminder, TaskColor, TimeBlock, WalletData, WalletGoal, WalletPeriod, WalletTransaction } from "@/types";
import { normalizeWallet } from "@/lib/services/wallet-service";
import { walletSeed } from "@/lib/mock-data";

export async function getUserId() {
  const supabase = createOptionalClient() as any;
  if (!supabase) return null;
  const { data } = await supabase.auth.getUser();
  return data.user?.id ?? null;
}

export async function fetchTimeBlocks(): Promise<TimeBlock[] | null> {
  const supabase = createOptionalClient() as any;
  const userId = await getUserId();
  if (!supabase || !userId) return null;
  const today = new Date().toISOString().slice(0, 10);
  const { data: blocks, error } = await supabase.from("time_blocks").select("id, block_date, start_time, title, color, icon, sort_order").eq("user_id", userId).eq("block_date", today).order("start_time", { ascending: true });
  if (error) return null;
  const blockIds = (blocks || []).map((b) => b.id);
  const { data: tasks } = blockIds.length
    ? await supabase.from("tasks").select("id, block_id, title, done, reminder_at, sort_order").in("block_id", blockIds).order("sort_order", { ascending: true })
    : { data: [] as any[] };
  return (blocks || []).map((block) => ({
    id: block.id,
    date: block.block_date,
    time: (block.start_time || "09:00").slice(0, 5),
    title: block.title,
    color: (block.color || "green") as TaskColor,
    icon: block.icon || "activity-study",
    tasks: (tasks || []).filter((task) => task.block_id === block.id).map((task) => ({ id: task.id, title: task.title, done: Boolean(task.done), reminderAt: task.reminder_at }))
  })).filter((block) => block.tasks.length > 0);
}

export async function upsertTimeBlocks(blocks: TimeBlock[]) {
  const supabase = createOptionalClient() as any;
  const userId = await getUserId();
  if (!supabase || !userId) return;
  const today = new Date().toISOString().slice(0, 10);
  for (const [index, block] of blocks.entries()) {
    const { data: savedBlock } = await supabase.from("time_blocks").upsert({
      id: block.id.startsWith("block-") ? undefined : block.id,
      user_id: userId,
      block_date: block.date || today,
      start_time: block.time,
      title: block.title,
      color: block.color,
      icon: block.icon,
      sort_order: index
    }).select("id").single();
    const blockId = savedBlock?.id || block.id;
    for (const [taskIndex, task] of block.tasks.entries()) {
      await supabase.from("tasks").upsert({
        id: task.id.startsWith("task-") ? undefined : task.id,
        user_id: userId,
        block_id: blockId,
        title: task.title,
        done: task.done,
        reminder_at: task.reminderAt || null,
        sort_order: taskIndex
      });
    }
  }
}

export async function fetchNotes(): Promise<Note[] | null> {
  const supabase = createOptionalClient() as any;
  const userId = await getUserId();
  if (!supabase || !userId) return null;
  const { data, error } = await supabase.from("notes").select("id,title,body,color,created_at").eq("user_id", userId).order("created_at", { ascending: false });
  if (error) return null;
  return (data || []).map((note) => ({ id: note.id, title: note.title, body: note.body || "", color: (note.color || "yellow") as Note["color"], createdAt: note.created_at || new Date().toISOString() }));
}

export async function upsertNote(note: Note) {
  const supabase = createOptionalClient() as any;
  const userId = await getUserId();
  if (!supabase || !userId) return;
  await supabase.from("notes").upsert({ id: note.id.startsWith("note-") ? undefined : note.id, user_id: userId, title: note.title, body: note.body, color: note.color });
}

export async function deleteNoteRemote(id: string) {
  const supabase = createOptionalClient() as any;
  if (!supabase) return;
  await supabase.from("notes").delete().eq("id", id);
}

export async function fetchCalendarEvents(): Promise<CalendarEvent[] | null> {
  const supabase = createOptionalClient() as any;
  const userId = await getUserId();
  if (!supabase || !userId) return null;
  const { data, error } = await supabase.from("calendar_events").select("id,event_date,start_time,title,color").eq("user_id", userId).order("event_date", { ascending: true }).order("start_time", { ascending: true });
  if (error) return null;
  return (data || []).map((event) => ({ id: event.id, date: event.event_date, time: (event.start_time || "09:00").slice(0, 5), title: event.title, color: (event.color || "green") as CalendarEvent["color"] }));
}

export async function upsertCalendarEvent(event: CalendarEvent) {
  const supabase = createOptionalClient() as any;
  const userId = await getUserId();
  if (!supabase || !userId) return;
  await supabase.from("calendar_events").upsert({ id: event.id.startsWith("event-") ? undefined : event.id, user_id: userId, event_date: event.date, start_time: event.time, title: event.title, color: event.color });
}

export async function deleteCalendarEventRemote(id: string) {
  const supabase = createOptionalClient() as any;
  if (!supabase) return;
  await supabase.from("calendar_events").delete().eq("id", id);
}

export async function fetchReminders(): Promise<Reminder[] | null> {
  const supabase = createOptionalClient() as any;
  const userId = await getUserId();
  if (!supabase || !userId) return null;
  const { data, error } = await supabase.from("reminders").select("id,title,remind_time,repeat_rule,enabled,task_id").eq("user_id", userId).order("remind_time", { ascending: true });
  if (error) return null;
  return (data || []).map((item) => ({ id: item.id, title: item.title, time: (item.remind_time || "09:00").slice(0, 5), repeat: (item.repeat_rule || "daily") as Reminder["repeat"], enabled: Boolean(item.enabled), taskId: item.task_id }));
}

export async function upsertReminder(item: Reminder) {
  const supabase = createOptionalClient() as any;
  const userId = await getUserId();
  if (!supabase || !userId) return;
  await supabase.from("reminders").upsert({ id: item.id.startsWith("reminder-") ? undefined : item.id, user_id: userId, title: item.title, remind_time: item.time, repeat_rule: item.repeat, enabled: item.enabled, task_id: item.taskId || null });
}

export async function deleteReminderRemote(id: string) {
  const supabase = createOptionalClient() as any;
  if (!supabase) return;
  await supabase.from("reminders").delete().eq("id", id);
}

export async function fetchWallet(): Promise<WalletData | null> {
  const supabase = createOptionalClient() as any;
  const userId = await getUserId();
  if (!supabase || !userId) return null;
  const [{ data: transactions }, { data: budgets }, { data: goals }] = await Promise.all([
    supabase.from("wallet_transactions").select("id,type,title,amount,currency,category,transaction_date,period,icon").eq("user_id", userId).order("transaction_date", { ascending: false }),
    supabase.from("wallet_budgets").select("id,period,limit_amount,currency").eq("user_id", userId),
    supabase.from("wallet_goals").select("id,title,target_amount,current_amount,currency,target_date,icon").eq("user_id", userId).order("created_at", { ascending: false })
  ]);
  const seed = normalizeWallet(walletSeed as WalletData);
  const mappedTransactions: WalletTransaction[] = (transactions || []).map((tx) => ({
    id: tx.id,
    type: tx.type as WalletTransaction["type"],
    title: tx.title,
    amount: Number(tx.amount),
    currency: tx.currency as WalletTransaction["currency"],
    category: tx.category,
    date: tx.transaction_date,
    period: tx.period as WalletPeriod,
    color: "green",
    icon: tx.icon || "wallet-income"
  }));
  const mappedGoals: WalletGoal[] = (goals || []).map((goal) => ({ id: goal.id, title: goal.title, target: Number(goal.target_amount), current: Number(goal.current_amount), currency: goal.currency as WalletGoal["currency"], targetDate: goal.target_date, icon: goal.icon || "wallet-savings" }));
  const weeklyBudget = budgets?.find((budget) => budget.period === seed.period);
  return normalizeWallet({ ...seed, transactions: mappedTransactions, goals: mappedGoals.length ? mappedGoals : seed.goals, budgetLimit: weeklyBudget ? Number(weeklyBudget.limit_amount) : seed.budgetLimit });
}

export async function upsertWalletBudget(period: WalletPeriod, limitAmount: number, currency = "CRC") {
  const supabase = createOptionalClient() as any;
  const userId = await getUserId();
  if (!supabase || !userId) return;
  await supabase.from("wallet_budgets").upsert({ user_id: userId, period, limit_amount: limitAmount, currency }, { onConflict: "user_id,period,currency" });
}

export async function upsertWalletTransaction(tx: WalletTransaction) {
  const supabase = createOptionalClient() as any;
  const userId = await getUserId();
  if (!supabase || !userId) return;
  await supabase.from("wallet_transactions").upsert({ id: tx.id.startsWith("wallet-tx-") ? undefined : tx.id, user_id: userId, type: tx.type, title: tx.title, amount: tx.amount, currency: tx.currency, category: tx.category, transaction_date: tx.date, period: tx.period, icon: tx.icon });
}

export async function deleteWalletTransactionRemote(id: string) {
  const supabase = createOptionalClient() as any;
  if (!supabase) return;
  await supabase.from("wallet_transactions").delete().eq("id", id);
}

export async function upsertWalletGoal(goal: WalletGoal) {
  const supabase = createOptionalClient() as any;
  const userId = await getUserId();
  if (!supabase || !userId) return;
  await supabase.from("wallet_goals").upsert({ id: goal.id.startsWith("wallet-goal-") ? undefined : goal.id, user_id: userId, title: goal.title, target_amount: goal.target, current_amount: goal.current, currency: goal.currency || "CRC", target_date: goal.targetDate || null, icon: goal.icon });
}
