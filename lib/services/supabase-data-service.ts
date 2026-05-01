import { createOptionalClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/database.types";
import type {
  CalendarEvent,
  Note,
  Reminder,
  TaskColor,
  TimeBlock,
  WalletData,
  WalletGoal,
  WalletPeriod,
  WalletTransaction,
} from "@/types";
import { normalizeWallet } from "@/lib/services/wallet-service";
import { walletSeed } from "@/lib/mock-data";

type TableRow<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Row"];

type TimeBlockRow = Pick<TableRow<"time_blocks">, "id" | "block_date" | "start_time" | "title" | "color" | "icon" | "sort_order">;
type TaskRow = Pick<TableRow<"tasks">, "id" | "block_id" | "title" | "done" | "reminder_at" | "sort_order">;
type NoteRow = Pick<TableRow<"notes">, "id" | "title" | "body" | "color" | "created_at">;
type CalendarEventRow = Pick<TableRow<"calendar_events">, "id" | "event_date" | "start_time" | "title" | "color">;
type ReminderRow = Pick<TableRow<"reminders">, "id" | "title" | "remind_time" | "repeat_rule" | "enabled" | "task_id">;
type WalletTransactionRow = Pick<TableRow<"wallet_transactions">, "id" | "type" | "title" | "amount" | "currency" | "category" | "transaction_date" | "period" | "icon">;
type WalletBudgetRow = Pick<TableRow<"wallet_budgets">, "id" | "period" | "limit_amount" | "currency">;
type WalletGoalRow = Pick<TableRow<"wallet_goals">, "id" | "title" | "target_amount" | "current_amount" | "currency" | "target_date" | "icon">;

function isTemporaryId(id: string, prefix: string) {
  return id.startsWith(prefix);
}

export async function getUserId(): Promise<string | null> {
  const supabase = createOptionalClient() as any;
  if (!supabase) return null;
  const { data, error } = await supabase.auth.getUser();
  if (error) return null;
  return data.user?.id ?? null;
}

export async function fetchTimeBlocks(): Promise<TimeBlock[] | null> {
  const supabase = createOptionalClient() as any;
  const userId = await getUserId();
  if (!supabase || !userId) return null;

  const today = new Date().toISOString().slice(0, 10);
  const { data: blockData, error } = await supabase
    .from("time_blocks")
    .select("id, block_date, start_time, title, color, icon, sort_order")
    .eq("user_id", userId)
    .eq("block_date", today)
    .order("start_time", { ascending: true });

  if (error) return null;

  const blocks: TimeBlockRow[] = blockData ?? [];
  const blockIds = blocks.map((block: TimeBlockRow) => block.id);

  let tasks: TaskRow[] = [];
  if (blockIds.length > 0) {
    const { data: taskData } = await supabase
      .from("tasks")
      .select("id, block_id, title, done, reminder_at, sort_order")
      .in("block_id", blockIds)
      .order("sort_order", { ascending: true });
    tasks = taskData ?? [];
  }

  return blocks
    .map((block: TimeBlockRow): TimeBlock => ({
      id: block.id,
      date: block.block_date,
      time: (block.start_time || "09:00").slice(0, 5),
      title: block.title,
      color: (block.color || "green") as TaskColor,
      icon: block.icon || "activity-study",
      tasks: tasks
        .filter((task: TaskRow) => task.block_id === block.id)
        .map((task: TaskRow) => ({
          id: task.id,
          title: task.title,
          done: Boolean(task.done),
          reminderAt: task.reminder_at,
        })),
    }))
    .filter((block: TimeBlock) => block.tasks.length > 0);
}

export async function upsertTimeBlocks(blocks: TimeBlock[]): Promise<void> {
  const supabase = createOptionalClient() as any;
  const userId = await getUserId();
  if (!supabase || !userId) return;

  const today = new Date().toISOString().slice(0, 10);

  for (const [index, block] of blocks.entries()) {
    const blockPayload: Database["public"]["Tables"]["time_blocks"]["Insert"] = {
      user_id: userId,
      block_date: block.date || today,
      start_time: block.time,
      title: block.title,
      color: block.color,
      icon: block.icon,
      sort_order: index,
    };

    if (!isTemporaryId(block.id, "block-")) blockPayload.id = block.id;

    const { data: savedBlock } = await supabase.from("time_blocks").upsert(blockPayload).select("id").single();
    const blockId = savedBlock?.id || block.id;

    for (const [taskIndex, task] of block.tasks.entries()) {
      const taskPayload: Database["public"]["Tables"]["tasks"]["Insert"] = {
        user_id: userId,
        block_id: blockId,
        title: task.title,
        done: task.done,
        reminder_at: task.reminderAt || null,
        sort_order: taskIndex,
      };

      if (!isTemporaryId(task.id, "task-")) taskPayload.id = task.id;
      await supabase.from("tasks").upsert(taskPayload);
    }
  }
}

export async function fetchNotes(): Promise<Note[] | null> {
  const supabase = createOptionalClient() as any;
  const userId = await getUserId();
  if (!supabase || !userId) return null;

  const { data, error } = await supabase
    .from("notes")
    .select("id,title,body,color,created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) return null;

  const notes: NoteRow[] = data ?? [];
  return notes.map((note: NoteRow): Note => ({
    id: note.id,
    title: note.title,
    body: note.body || "",
    color: (note.color || "yellow") as Note["color"],
    createdAt: note.created_at || new Date().toISOString(),
  }));
}

export async function upsertNote(note: Note): Promise<void> {
  const supabase = createOptionalClient() as any;
  const userId = await getUserId();
  if (!supabase || !userId) return;

  const payload: Database["public"]["Tables"]["notes"]["Insert"] = {
    user_id: userId,
    title: note.title,
    body: note.body,
    color: note.color,
  };

  if (!isTemporaryId(note.id, "note-")) payload.id = note.id;
  await supabase.from("notes").upsert(payload);
}

export async function deleteNoteRemote(id: string): Promise<void> {
  const supabase = createOptionalClient() as any;
  if (!supabase) return;
  await supabase.from("notes").delete().eq("id", id);
}

export async function fetchCalendarEvents(): Promise<CalendarEvent[] | null> {
  const supabase = createOptionalClient() as any;
  const userId = await getUserId();
  if (!supabase || !userId) return null;

  const { data, error } = await supabase
    .from("calendar_events")
    .select("id,event_date,start_time,title,color")
    .eq("user_id", userId)
    .order("event_date", { ascending: true })
    .order("start_time", { ascending: true });

  if (error) return null;

  const events: CalendarEventRow[] = data ?? [];
  return events.map((event: CalendarEventRow): CalendarEvent => ({
    id: event.id,
    date: event.event_date,
    time: (event.start_time || "09:00").slice(0, 5),
    title: event.title,
    color: (event.color || "green") as CalendarEvent["color"],
  }));
}

export async function upsertCalendarEvent(event: CalendarEvent): Promise<void> {
  const supabase = createOptionalClient() as any;
  const userId = await getUserId();
  if (!supabase || !userId) return;

  const payload: Database["public"]["Tables"]["calendar_events"]["Insert"] = {
    user_id: userId,
    event_date: event.date,
    start_time: event.time,
    title: event.title,
    color: event.color,
  };

  if (!isTemporaryId(event.id, "event-")) payload.id = event.id;
  await supabase.from("calendar_events").upsert(payload);
}

export async function deleteCalendarEventRemote(id: string): Promise<void> {
  const supabase = createOptionalClient() as any;
  if (!supabase) return;
  await supabase.from("calendar_events").delete().eq("id", id);
}

export async function fetchReminders(): Promise<Reminder[] | null> {
  const supabase = createOptionalClient() as any;
  const userId = await getUserId();
  if (!supabase || !userId) return null;

  const { data, error } = await supabase
    .from("reminders")
    .select("id,title,remind_time,repeat_rule,enabled,task_id")
    .eq("user_id", userId)
    .order("remind_time", { ascending: true });

  if (error) return null;

  const reminders: ReminderRow[] = data ?? [];
  return reminders.map((item: ReminderRow): Reminder => ({
    id: item.id,
    title: item.title,
    time: (item.remind_time || "09:00").slice(0, 5),
    repeat: (item.repeat_rule || "daily") as Reminder["repeat"],
    enabled: Boolean(item.enabled),
    taskId: item.task_id,
  }));
}

export async function upsertReminder(item: Reminder): Promise<void> {
  const supabase = createOptionalClient() as any;
  const userId = await getUserId();
  if (!supabase || !userId) return;

  const payload: Database["public"]["Tables"]["reminders"]["Insert"] = {
    user_id: userId,
    title: item.title,
    remind_time: item.time,
    repeat_rule: item.repeat,
    enabled: item.enabled,
    task_id: item.taskId || null,
  };

  if (!isTemporaryId(item.id, "reminder-")) payload.id = item.id;
  await supabase.from("reminders").upsert(payload);
}

export async function deleteReminderRemote(id: string): Promise<void> {
  const supabase = createOptionalClient() as any;
  if (!supabase) return;
  await supabase.from("reminders").delete().eq("id", id);
}

export async function fetchWallet(): Promise<WalletData | null> {
  const supabase = createOptionalClient() as any;
  const userId = await getUserId();
  if (!supabase || !userId) return null;

  const [{ data: transactionData }, { data: budgetData }, { data: goalData }] = await Promise.all([
    supabase
      .from("wallet_transactions")
      .select("id,type,title,amount,currency,category,transaction_date,period,icon")
      .eq("user_id", userId)
      .order("transaction_date", { ascending: false }),
    supabase.from("wallet_budgets").select("id,period,limit_amount,currency").eq("user_id", userId),
    supabase
      .from("wallet_goals")
      .select("id,title,target_amount,current_amount,currency,target_date,icon")
      .eq("user_id", userId)
      .order("created_at", { ascending: false }),
  ]);

  const seed = normalizeWallet(walletSeed as WalletData);
  const transactions: WalletTransactionRow[] = transactionData ?? [];
  const budgets: WalletBudgetRow[] = budgetData ?? [];
  const goals: WalletGoalRow[] = goalData ?? [];

  const mappedTransactions: WalletTransaction[] = transactions.map((tx: WalletTransactionRow): WalletTransaction => ({
    id: tx.id,
    type: tx.type as WalletTransaction["type"],
    title: tx.title,
    amount: Number(tx.amount),
    currency: tx.currency as WalletTransaction["currency"],
    category: tx.category,
    date: tx.transaction_date,
    period: tx.period as WalletPeriod,
    color: "green",
    icon: tx.icon || "wallet-income",
  }));

  const mappedGoals: WalletGoal[] = goals.map((goal: WalletGoalRow): WalletGoal => ({
    id: goal.id,
    title: goal.title,
    target: Number(goal.target_amount),
    current: Number(goal.current_amount),
    currency: goal.currency as WalletGoal["currency"],
    targetDate: goal.target_date,
    icon: goal.icon || "wallet-savings",
  }));

  const activeBudget = budgets.find((budget: WalletBudgetRow) => budget.period === seed.period && budget.currency === seed.currency);

  return normalizeWallet({
    ...seed,
    transactions: mappedTransactions,
    goals: mappedGoals.length ? mappedGoals : seed.goals,
    budgetLimit: activeBudget ? Number(activeBudget.limit_amount) : seed.budgetLimit,
  });
}

export async function upsertWalletBudget(period: WalletPeriod, limitAmount: number, currency: WalletTransaction["currency"] = "CRC"): Promise<void> {
  const supabase = createOptionalClient() as any;
  const userId = await getUserId();
  if (!supabase || !userId) return;

  await supabase
    .from("wallet_budgets")
    .upsert({ user_id: userId, period, limit_amount: limitAmount, currency }, { onConflict: "user_id,period,currency" });
}

export async function upsertWalletTransaction(tx: WalletTransaction): Promise<void> {
  const supabase = createOptionalClient() as any;
  const userId = await getUserId();
  if (!supabase || !userId) return;

  const payload: Database["public"]["Tables"]["wallet_transactions"]["Insert"] = {
    user_id: userId,
    type: tx.type,
    title: tx.title,
    amount: tx.amount,
    currency: tx.currency,
    category: tx.category,
    transaction_date: tx.date,
    period: tx.period,
    icon: tx.icon,
  };

  if (!isTemporaryId(tx.id, "wallet-tx-")) payload.id = tx.id;
  await supabase.from("wallet_transactions").upsert(payload);
}

export async function deleteWalletTransactionRemote(id: string): Promise<void> {
  const supabase = createOptionalClient() as any;
  if (!supabase) return;
  await supabase.from("wallet_transactions").delete().eq("id", id);
}

export async function upsertWalletGoal(goal: WalletGoal): Promise<void> {
  const supabase = createOptionalClient() as any;
  const userId = await getUserId();
  if (!supabase || !userId) return;

  const payload: Database["public"]["Tables"]["wallet_goals"]["Insert"] = {
    user_id: userId,
    title: goal.title,
    target_amount: goal.target,
    current_amount: goal.current,
    currency: goal.currency || "CRC",
    target_date: goal.targetDate || null,
    icon: goal.icon,
  };

  if (!isTemporaryId(goal.id, "wallet-goal-")) payload.id = goal.id;
  await supabase.from("wallet_goals").upsert(payload);
}
