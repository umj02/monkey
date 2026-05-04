import { createOptionalClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/database.types";
import type {
  CalendarEvent,
  CalendarEventCompletion,
  Note,
  Reminder,
  ReminderPanelItem,
  ReminderStatus,
  TaskColor,
  TimeBlock,
  WalletData,
  WalletGoal,
  WalletPeriod,
  WalletTransaction,
} from "@/types";
import { getWalletTransactionMeta, normalizeWallet } from "@/lib/services/wallet-service";
import { walletSeed } from "@/lib/mock-data";

type TableRow<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];

type TimeBlockRow = Pick<
  TableRow<"time_blocks">,
  "id" | "block_date" | "start_time" | "title" | "color" | "icon" | "sort_order"
>;
type TaskRow = Pick<
  TableRow<"tasks">,
  "id" | "block_id" | "title" | "done" | "reminder_at" | "sort_order"
>;
type TaskReminderRow = Pick<
  TableRow<"tasks">,
  "id" | "block_id" | "title" | "done" | "reminder_at"
>;
type TimeBlockLookupRow = Pick<
  TableRow<"time_blocks">,
  "id" | "block_date" | "start_time" | "title" | "icon"
>;
type NoteRow = Pick<
  TableRow<"notes">,
  "id" | "title" | "body" | "color" | "created_at"
>;
type CalendarEventRow = Pick<
  TableRow<"calendar_events">,
  "id" | "event_date" | "start_time" | "end_time" | "title" | "icon_key" | "color" | "recurrence_type" | "recurrence_days" | "recurrence_until" | "recurrence_group_id" | "done"
>;
type CalendarEventCompletionRow = Pick<
  TableRow<"calendar_event_completions">,
  "id" | "calendar_event_id" | "occurrence_date" | "done"
>;

type ReminderRow = Pick<
  TableRow<"reminders">,
  "id" | "title" | "remind_time" | "repeat_rule" | "enabled" | "task_id" | "calendar_event_id"
>;
type WalletTransactionRow = Pick<
  TableRow<"wallet_transactions">,
  | "id"
  | "type"
  | "title"
  | "amount"
  | "currency"
  | "category"
  | "transaction_date"
  | "period"
  | "icon"
>;
type WalletBudgetRow = Pick<
  TableRow<"wallet_budgets">,
  "id" | "period" | "limit_amount" | "currency"
>;
type WalletGoalRow = Pick<
  TableRow<"wallet_goals">,
  | "id"
  | "title"
  | "target_amount"
  | "current_amount"
  | "currency"
  | "target_date"
  | "icon"
>;

function mapWalletTransactionRow(tx: WalletTransactionRow): WalletTransaction {
  const type = tx.type as WalletTransaction["type"];
  const category = tx.category || (type === "expense" ? "Otro" : type === "saving" ? "Ahorro" : type === "extra" ? "Extra" : "Mesada");
  const meta = getWalletTransactionMeta(category, type);
  return {
    id: tx.id,
    type,
    title: tx.title,
    amount: Number(tx.amount),
    currency: tx.currency as WalletTransaction["currency"],
    category,
    date: tx.transaction_date,
    period: tx.period as WalletPeriod,
    color: meta.color,
    icon: tx.icon || meta.icon,
  };
}

function isTemporaryId(id: string, prefix: string) {
  return id.startsWith(prefix);
}

function isUuid(id: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    id,
  );
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function normalizeTime(value: string | null | undefined) {
  return (value || "09:00").slice(0, 5);
}

function normalizeTitle(value: string) {
  return value.trim().replace(/\s+/g, " ");
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
    .map(
      (block: TimeBlockRow): TimeBlock => ({
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
      }),
    )
    .filter((block: TimeBlock) => block.tasks.length > 0);
}

export async function upsertTimeBlocks(
  blocks: TimeBlock[],
): Promise<TimeBlock[] | null> {
  const supabase = createOptionalClient() as any;
  const userId = await getUserId();
  if (!supabase || !userId) return null;

  const today = todayKey();
  const savedBlocks: TimeBlock[] = [];

  for (const [index, block] of blocks.entries()) {
    const savedBlock = await saveTimeBlockRemote(block, index, today);
    if (!savedBlock) continue;

    const savedTasks: TimeBlock["tasks"] = [];
    for (const [taskIndex, task] of block.tasks.entries()) {
      const savedTask = await saveTaskRemote(savedBlock.id, task, taskIndex);
      if (savedTask) savedTasks.push(savedTask);
    }

    savedBlocks.push({
      ...block,
      id: savedBlock.id,
      date: savedBlock.block_date,
      tasks: savedTasks,
    });
  }

  return savedBlocks;
}

async function saveTimeBlockRemote(
  block: TimeBlock,
  index = 0,
  fallbackDate = todayKey(),
): Promise<TimeBlockRow | null> {
  const supabase = createOptionalClient() as any;
  const userId = await getUserId();
  if (!supabase || !userId) return null;

  const blockDate = block.date || fallbackDate;
  const startTime = normalizeTime(block.time);
  const title = normalizeTitle(block.title || "Nuevo bloque");

  const payload: Database["public"]["Tables"]["time_blocks"]["Insert"] = {
    user_id: userId,
    block_date: blockDate,
    start_time: startTime,
    title,
    color: block.color,
    icon: block.icon,
    sort_order: index,
  };

  if (isUuid(block.id)) {
    payload.id = block.id;
    const { data, error } = await supabase
      .from("time_blocks")
      .upsert(payload, { onConflict: "id" })
      .select("id, block_date, start_time, title, color, icon, sort_order")
      .single();
    return error ? null : (data as TimeBlockRow);
  }

  const { data: existing } = await supabase
    .from("time_blocks")
    .select("id, block_date, start_time, title, color, icon, sort_order")
    .eq("user_id", userId)
    .eq("block_date", blockDate)
    .eq("start_time", startTime)
    .ilike("title", title)
    .limit(1)
    .maybeSingle();

  if (existing?.id) return existing as TimeBlockRow;

  const { data, error } = await supabase
    .from("time_blocks")
    .insert(payload)
    .select("id, block_date, start_time, title, color, icon, sort_order")
    .single();

  return error ? null : (data as TimeBlockRow);
}

async function saveTaskRemote(
  blockId: string,
  task: TimeBlock["tasks"][number],
  sortOrder = 0,
): Promise<TimeBlock["tasks"][number] | null> {
  const supabase = createOptionalClient() as any;
  const userId = await getUserId();
  if (!supabase || !userId) return null;

  const title = normalizeTitle(task.title);
  const payload: Database["public"]["Tables"]["tasks"]["Insert"] = {
    user_id: userId,
    block_id: blockId,
    title,
    done: task.done,
    reminder_at: task.reminderAt || null,
    sort_order: sortOrder,
  };

  if (isUuid(task.id)) {
    payload.id = task.id;
    const { data, error } = await supabase
      .from("tasks")
      .upsert(payload, { onConflict: "id" })
      .select("id,title,done,reminder_at")
      .single();
    if (error) return null;
    return {
      id: data.id,
      title: data.title,
      done: Boolean(data.done),
      reminderAt: data.reminder_at,
    };
  }

  const { data: existing } = await supabase
    .from("tasks")
    .select("id,title,done,reminder_at")
    .eq("user_id", userId)
    .eq("block_id", blockId)
    .ilike("title", title)
    .limit(1)
    .maybeSingle();

  if (existing?.id) {
    const { data } = await supabase
      .from("tasks")
      .update({
        done: task.done,
        reminder_at: task.reminderAt || null,
        sort_order: sortOrder,
      })
      .eq("id", existing.id)
      .select("id,title,done,reminder_at")
      .single();
    const saved = data || existing;
    return {
      id: saved.id,
      title: saved.title,
      done: Boolean(saved.done),
      reminderAt: saved.reminder_at,
    };
  }

  const { data, error } = await supabase
    .from("tasks")
    .insert(payload)
    .select("id,title,done,reminder_at")
    .single();
  if (error) return null;
  return {
    id: data.id,
    title: data.title,
    done: Boolean(data.done),
    reminderAt: data.reminder_at,
  };
}

export async function createTaskRemote(
  block: TimeBlock,
  task: TimeBlock["tasks"][number],
  blockIndex = 0,
  taskIndex = 0,
): Promise<{ block: TimeBlock; task: TimeBlock["tasks"][number] } | null> {
  const savedBlock = await saveTimeBlockRemote(
    block,
    blockIndex,
    block.date || todayKey(),
  );
  if (!savedBlock) return null;
  const savedTask = await saveTaskRemote(savedBlock.id, task, taskIndex);
  if (!savedTask) return null;

  return {
    block: {
      ...block,
      id: savedBlock.id,
      date: savedBlock.block_date,
      time: normalizeTime(savedBlock.start_time),
      title: savedBlock.title,
      color: (savedBlock.color || block.color) as TaskColor,
      icon: savedBlock.icon || block.icon,
      tasks: [],
    },
    task: savedTask,
  };
}

export async function updateTaskRemote(
  taskId: string,
  updates: Partial<
    Pick<TimeBlock["tasks"][number], "title" | "done" | "reminderAt">
  >,
): Promise<void> {
  if (!isUuid(taskId)) return;
  const supabase = createOptionalClient() as any;
  if (!supabase) return;
  const payload: Database["public"]["Tables"]["tasks"]["Update"] = {};
  if (typeof updates.title === "string")
    payload.title = normalizeTitle(updates.title);
  if (typeof updates.done === "boolean") payload.done = updates.done;
  if ("reminderAt" in updates) payload.reminder_at = updates.reminderAt || null;
  await supabase.from("tasks").update(payload).eq("id", taskId);
}

export async function deleteTaskRemote(taskId: string): Promise<void> {
  if (!isUuid(taskId)) return;
  const supabase = createOptionalClient() as any;
  if (!supabase) return;
  await supabase.from("tasks").delete().eq("id", taskId);
}

export async function deleteTimeBlockRemote(blockId: string): Promise<void> {
  if (!isUuid(blockId)) return;
  const supabase = createOptionalClient() as any;
  if (!supabase) return;
  await supabase.from("time_blocks").delete().eq("id", blockId);
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
  return notes.map(
    (note: NoteRow): Note => ({
      id: note.id,
      title: note.title,
      body: note.body || "",
      color: (note.color || "yellow") as Note["color"],
      createdAt: note.created_at || new Date().toISOString(),
    }),
  );
}

export async function upsertNote(note: Note): Promise<Note | null> {
  const supabase = createOptionalClient() as any;
  const userId = await getUserId();
  if (!supabase || !userId) return null;

  const payload: Database["public"]["Tables"]["notes"]["Insert"] = {
    user_id: userId,
    title: normalizeTitle(note.title),
    body: note.body.trim(),
    color: note.color,
  };

  if (isUuid(note.id)) {
    payload.id = note.id;
    const { data, error } = await supabase
      .from("notes")
      .upsert(payload, { onConflict: "id" })
      .select("id,title,body,color,created_at")
      .single();
    if (error) return null;
    return {
      id: data.id,
      title: data.title,
      body: data.body || "",
      color: data.color as Note["color"],
      createdAt: data.created_at || note.createdAt,
    };
  }

  const { data, error } = await supabase
    .from("notes")
    .insert(payload)
    .select("id,title,body,color,created_at")
    .single();

  if (error) return null;
  return {
    id: data.id,
    title: data.title,
    body: data.body || "",
    color: data.color as Note["color"],
    createdAt: data.created_at || note.createdAt,
  };
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
    .select("id,event_date,start_time,end_time,title,icon_key,color,recurrence_type,recurrence_days,recurrence_until,recurrence_group_id,done")
    .eq("user_id", userId)
    .order("event_date", { ascending: true })
    .order("start_time", { ascending: true });

  if (error) return null;

  const events: CalendarEventRow[] = data ?? [];
  return events.map(
    (event: CalendarEventRow): CalendarEvent => ({
      id: event.id,
      date: event.event_date,
      time: (event.start_time || "09:00").slice(0, 5),
      endTime: event.end_time ? event.end_time.slice(0, 5) : null,
      title: event.title,
      iconKey: event.icon_key ?? null,
      color: (event.color || "green") as CalendarEvent["color"],
      recurrenceType: (event.recurrence_type || "none") as CalendarEvent["recurrenceType"],
      recurrenceDays: event.recurrence_days ?? null,
      recurrenceUntil: event.recurrence_until ?? null,
      recurrenceGroupId: event.recurrence_group_id ?? null,
      done: Boolean(event.done),
    }),
  );
}

export async function upsertCalendarEvent(
  event: CalendarEvent,
): Promise<CalendarEvent | null> {
  const supabase = createOptionalClient() as any;
  const userId = await getUserId();
  if (!supabase || !userId) return null;

  const payload: Database["public"]["Tables"]["calendar_events"]["Insert"] = {
    user_id: userId,
    event_date: event.date,
    start_time: normalizeTime(event.time),
    end_time: event.endTime ? normalizeTime(event.endTime) : null,
    title: normalizeTitle(event.title),
    icon_key: event.iconKey ?? null,
    color: event.color,
    recurrence_type: event.recurrenceType ?? "none",
    recurrence_days: event.recurrenceType === "custom_days" ? event.recurrenceDays ?? [] : null,
    recurrence_until: event.recurrenceUntil ?? null,
    recurrence_group_id: event.recurrenceGroupId ?? null,
    done: Boolean(event.done),
  };

  if (isUuid(event.id)) {
    payload.id = event.id;
    const { data, error } = await supabase
      .from("calendar_events")
      .upsert(payload, { onConflict: "id" })
      .select("id,event_date,start_time,end_time,title,icon_key,color,recurrence_type,recurrence_days,recurrence_until,recurrence_group_id,done")
      .single();
    if (error) return null;
    return {
      id: data.id,
      date: data.event_date,
      time: normalizeTime(data.start_time),
      endTime: data.end_time ? normalizeTime(data.end_time) : null,
      title: data.title,
      iconKey: data.icon_key ?? null,
      color: data.color as CalendarEvent["color"],
      recurrenceType: (data.recurrence_type || "none") as CalendarEvent["recurrenceType"],
      recurrenceDays: data.recurrence_days ?? null,
      recurrenceUntil: data.recurrence_until ?? null,
      recurrenceGroupId: data.recurrence_group_id ?? null,
      done: Boolean(data.done),
    };
  }

  const { data: existing } = await supabase
    .from("calendar_events")
    .select("id,event_date,start_time,end_time,title,icon_key,color,recurrence_type,recurrence_days,recurrence_until,recurrence_group_id,done")
    .eq("user_id", userId)
    .eq("event_date", event.date)
    .eq("start_time", normalizeTime(event.time))
    .ilike("title", normalizeTitle(event.title))
    .limit(1)
    .maybeSingle();

  if (existing?.id) {
    const { data, error } = await supabase
      .from("calendar_events")
      .update(payload)
      .eq("id", existing.id)
      .select("id,event_date,start_time,end_time,title,icon_key,color,recurrence_type,recurrence_days,recurrence_until,recurrence_group_id,done")
      .single();
    if (error) return null;
    return {
      id: data.id,
      date: data.event_date,
      time: normalizeTime(data.start_time),
      endTime: data.end_time ? normalizeTime(data.end_time) : null,
      title: data.title,
      iconKey: data.icon_key ?? null,
      color: data.color as CalendarEvent["color"],
      recurrenceType: (data.recurrence_type || "none") as CalendarEvent["recurrenceType"],
      recurrenceDays: data.recurrence_days ?? null,
      recurrenceUntil: data.recurrence_until ?? null,
      recurrenceGroupId: data.recurrence_group_id ?? null,
      done: Boolean(data.done),
    };
  }

  const { data, error } = await supabase
    .from("calendar_events")
    .insert(payload)
    .select("id,event_date,start_time,end_time,title,icon_key,color,recurrence_type,recurrence_days,recurrence_until,recurrence_group_id,done")
    .single();

  if (error) return null;
  return {
    id: data.id,
    date: data.event_date,
    time: normalizeTime(data.start_time),
    endTime: data.end_time ? normalizeTime(data.end_time) : null,
    title: data.title,
    iconKey: data.icon_key ?? null,
    color: data.color as CalendarEvent["color"],
    recurrenceType: (data.recurrence_type || "none") as CalendarEvent["recurrenceType"],
    recurrenceDays: data.recurrence_days ?? null,
    recurrenceUntil: data.recurrence_until ?? null,
    recurrenceGroupId: data.recurrence_group_id ?? null,
    done: Boolean(data.done),
  };
}

export async function fetchCalendarEventCompletions(): Promise<CalendarEventCompletion[] | null> {
  const supabase = createOptionalClient() as any;
  const userId = await getUserId();
  if (!supabase || !userId) return null;

  const { data, error } = await supabase
    .from("calendar_event_completions")
    .select("id,calendar_event_id,occurrence_date,done")
    .eq("user_id", userId);

  if (error) return null;

  const rows: CalendarEventCompletionRow[] = data ?? [];
  return rows.map((row: CalendarEventCompletionRow): CalendarEventCompletion => ({
    id: row.id,
    calendarEventId: row.calendar_event_id,
    occurrenceDate: row.occurrence_date,
    done: Boolean(row.done),
  }));
}

export async function upsertCalendarEventCompletion(
  completion: Omit<CalendarEventCompletion, "id"> & { id?: string },
): Promise<CalendarEventCompletion | null> {
  const supabase = createOptionalClient() as any;
  const userId = await getUserId();
  if (!supabase || !userId) return null;

  const payload: Database["public"]["Tables"]["calendar_event_completions"]["Insert"] = {
    user_id: userId,
    calendar_event_id: completion.calendarEventId,
    occurrence_date: completion.occurrenceDate,
    done: completion.done,
  };

  const { data, error } = await supabase
    .from("calendar_event_completions")
    .upsert(payload, { onConflict: "user_id,calendar_event_id,occurrence_date" })
    .select("id,calendar_event_id,occurrence_date,done")
    .single();

  if (error) return null;
  return {
    id: data.id,
    calendarEventId: data.calendar_event_id,
    occurrenceDate: data.occurrence_date,
    done: Boolean(data.done),
  };
}

export async function deleteCalendarEventCompletionRemote(calendarEventId: string, occurrenceDate: string): Promise<boolean> {
  const supabase = createOptionalClient() as any;
  const userId = await getUserId();
  if (!supabase || !userId) return false;
  const { error } = await supabase
    .from("calendar_event_completions")
    .delete()
    .eq("user_id", userId)
    .eq("calendar_event_id", calendarEventId)
    .eq("occurrence_date", occurrenceDate);
  return !error;
}

export async function deleteCalendarEventRemote(id: string): Promise<void> {
  const supabase = createOptionalClient() as any;
  if (!supabase) return;
  await supabase.from("calendar_events").delete().eq("id", id);
}

export async function fetchTaskReminderItems(): Promise<ReminderPanelItem[] | null> {
  const supabase = createOptionalClient() as any;
  const userId = await getUserId();
  if (!supabase || !userId) return null;

  const { data: taskData, error } = await supabase
    .from("tasks")
    .select("id,block_id,title,done,reminder_at")
    .eq("user_id", userId)
    .not("reminder_at", "is", null)
    .order("reminder_at", { ascending: true });

  if (error) return null;

  const tasks: TaskReminderRow[] = taskData ?? [];
  const blockIds = Array.from(
    new Set(
      tasks
        .map((task: TaskReminderRow) => task.block_id)
        .filter((id: string | null): id is string => Boolean(id)),
    ),
  );

  let blocks: TimeBlockLookupRow[] = [];
  if (blockIds.length > 0) {
    const { data: blockData } = await supabase
      .from("time_blocks")
      .select("id,block_date,start_time,title,icon")
      .in("id", blockIds);
    blocks = blockData ?? [];
  }

  const blockById = new Map<string, TimeBlockLookupRow>(
    blocks.map((block: TimeBlockLookupRow) => [block.id, block]),
  );

  return tasks.map((task: TaskReminderRow): ReminderPanelItem => {
    const block = task.block_id ? blockById.get(task.block_id) : null;
    const reminderAt = task.reminder_at;
    const date = reminderAt ? new Date(reminderAt) : null;
    const isInvalidDate = !date || Number.isNaN(date.getTime());
    const now = new Date();
    const dateKey = isInvalidDate ? "" : date.toISOString().slice(0, 10);
    const today = now.toISOString().slice(0, 10);
    const status: ReminderStatus = isInvalidDate
      ? "upcoming"
      : date.getTime() < now.getTime()
        ? "overdue"
        : dateKey === today
          ? "today"
          : "upcoming";
    const time = isInvalidDate
      ? "09:00"
      : date.toLocaleTimeString("es-CR", { hour: "2-digit", minute: "2-digit", hour12: false });
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowKey = tomorrow.toISOString().slice(0, 10);
    const dateLabel = isInvalidDate
      ? "Fecha pendiente"
      : dateKey === today
        ? "Hoy"
        : dateKey === tomorrowKey
          ? "Mañana"
          : new Intl.DateTimeFormat("es-CR", { weekday: "short", day: "numeric", month: "short" }).format(date);

    return {
      id: `task-${task.id}`,
      source: "task",
      taskId: task.id,
      title: task.title,
      time,
      reminderAt,
      enabled: true,
      status,
      dateLabel,
      blockId: task.block_id,
      blockTitle: block?.title ?? "Tarea",
      blockTime: block?.start_time?.slice(0, 5) ?? null,
      icon: block?.icon ?? "activity-study",
    };
  });
}

export async function fetchReminders(): Promise<Reminder[] | null> {
  const supabase = createOptionalClient() as any;
  const userId = await getUserId();
  if (!supabase || !userId) return null;

  const { data, error } = await supabase
    .from("reminders")
    .select("id,title,remind_time,repeat_rule,enabled,task_id,calendar_event_id")
    .eq("user_id", userId)
    .order("remind_time", { ascending: true });

  if (error) return null;

  const reminders: ReminderRow[] = data ?? [];
  return reminders.map((item: ReminderRow): Reminder => mapReminderRow(item));
}

function mapReminderRow(item: ReminderRow): Reminder {
  return {
    id: item.id,
    title: item.title,
    time: (item.remind_time || "09:00").slice(0, 5),
    repeat: (item.repeat_rule || "daily") as Reminder["repeat"],
    enabled: Boolean(item.enabled),
    taskId: item.task_id,
    calendarEventId: item.calendar_event_id,
  };
}

export async function upsertReminder(item: Reminder): Promise<Reminder | null> {
  const supabase = createOptionalClient() as any;
  const userId = await getUserId();
  if (!supabase || !userId) return null;

  const calendarEventId = item.calendarEventId && isUuid(item.calendarEventId) ? item.calendarEventId : null;
  const payload: Database["public"]["Tables"]["reminders"]["Insert"] = {
    user_id: userId,
    title: normalizeTitle(item.title),
    remind_time: normalizeTime(item.time),
    repeat_rule: item.repeat,
    enabled: item.enabled,
    task_id: item.taskId || null,
    calendar_event_id: calendarEventId,
  };

  if (!isTemporaryId(item.id, "reminder-") && isUuid(item.id)) payload.id = item.id;

  const query = calendarEventId
    ? supabase.from("reminders").upsert(payload, { onConflict: "calendar_event_id" })
    : supabase.from("reminders").upsert(payload, { onConflict: "id" });

  const { data, error } = await query
    .select("id,title,remind_time,repeat_rule,enabled,task_id,calendar_event_id")
    .single();

  if (error || !data) return null;
  return mapReminderRow(data as ReminderRow);
}

export async function deleteReminderRemote(id: string): Promise<boolean> {
  const supabase = createOptionalClient() as any;
  if (!supabase || !isUuid(id)) return false;
  const { error } = await supabase.from("reminders").delete().eq("id", id);
  return !error;
}

export async function deleteRemindersByCalendarEventRemote(calendarEventId: string): Promise<boolean> {
  if (!isUuid(calendarEventId)) return false;
  const supabase = createOptionalClient() as any;
  if (!supabase) return false;
  const { error } = await supabase.from("reminders").delete().eq("calendar_event_id", calendarEventId);
  return !error;
}

export async function fetchWallet(): Promise<WalletData | null> {
  const supabase = createOptionalClient() as any;
  const userId = await getUserId();
  if (!supabase || !userId) return null;

  const [{ data: transactionData }, { data: budgetData }, { data: goalData }] =
    await Promise.all([
      supabase
        .from("wallet_transactions")
        .select(
          "id,type,title,amount,currency,category,transaction_date,period,icon",
        )
        .eq("user_id", userId)
        .order("transaction_date", { ascending: false }),
      supabase
        .from("wallet_budgets")
        .select("id,period,limit_amount,currency")
        .eq("user_id", userId),
      supabase
        .from("wallet_goals")
        .select(
          "id,title,target_amount,current_amount,currency,target_date,icon",
        )
        .eq("user_id", userId)
        .order("created_at", { ascending: false }),
    ]);

  const seed = normalizeWallet(walletSeed as WalletData);
  const transactions: WalletTransactionRow[] = transactionData ?? [];
  const budgets: WalletBudgetRow[] = budgetData ?? [];
  const goals: WalletGoalRow[] = goalData ?? [];

  const mappedTransactions: WalletTransaction[] = transactions.map(mapWalletTransactionRow);

  const mappedGoals: WalletGoal[] = goals.map(
    (goal: WalletGoalRow): WalletGoal => ({
      id: goal.id,
      title: goal.title,
      target: Number(goal.target_amount),
      current: Number(goal.current_amount),
      currency: goal.currency as WalletGoal["currency"],
      targetDate: goal.target_date,
      icon: goal.icon || "wallet-savings",
    }),
  );

  const activeBudget = budgets.find(
    (budget: WalletBudgetRow) =>
      budget.period === seed.period && budget.currency === seed.currency,
  );

  return normalizeWallet({
    ...seed,
    transactions: mappedTransactions,
    goals: mappedGoals.length ? mappedGoals : seed.goals,
    budgetLimit: activeBudget
      ? Number(activeBudget.limit_amount)
      : seed.budgetLimit,
  });
}

export async function upsertWalletBudget(
  period: WalletPeriod,
  limitAmount: number,
  currency: WalletTransaction["currency"] = "CRC",
): Promise<void> {
  const supabase = createOptionalClient() as any;
  const userId = await getUserId();
  if (!supabase || !userId) return;

  await supabase
    .from("wallet_budgets")
    .upsert(
      { user_id: userId, period, limit_amount: limitAmount, currency },
      { onConflict: "user_id,period,currency" },
    );
}

export async function upsertWalletTransaction(
  tx: WalletTransaction,
): Promise<WalletTransaction | null> {
  const supabase = createOptionalClient() as any;
  const userId = await getUserId();
  if (!supabase || !userId) return null;

  const payload: Database["public"]["Tables"]["wallet_transactions"]["Insert"] =
    {
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

  if (!isTemporaryId(tx.id, "wallet-tx-") && isUuid(tx.id)) payload.id = tx.id;

  const { data, error } = await supabase
    .from("wallet_transactions")
    .upsert(payload, { onConflict: "id" })
    .select("id,type,title,amount,currency,category,transaction_date,period,icon")
    .single();

  return error || !data ? null : mapWalletTransactionRow(data as WalletTransactionRow);
}

export async function deleteWalletTransactionRemote(id: string): Promise<boolean> {
  const supabase = createOptionalClient() as any;
  if (!supabase || !isUuid(id)) return false;
  const { error } = await supabase.from("wallet_transactions").delete().eq("id", id);
  return !error;
}

export async function upsertWalletGoal(goal: WalletGoal): Promise<WalletGoal | null> {
  const supabase = createOptionalClient() as any;
  const userId = await getUserId();
  if (!supabase || !userId) return null;

  const payload: Database["public"]["Tables"]["wallet_goals"]["Insert"] = {
    user_id: userId,
    title: goal.title,
    target_amount: goal.target,
    current_amount: goal.current,
    currency: goal.currency || "CRC",
    target_date: goal.targetDate || null,
    icon: goal.icon,
  };

  if (!isTemporaryId(goal.id, "wallet-goal-") && isUuid(goal.id)) payload.id = goal.id;

  const { data, error } = await supabase
    .from("wallet_goals")
    .upsert(payload, { onConflict: "id" })
    .select("id,title,target_amount,current_amount,currency,target_date,icon")
    .single();

  if (error || !data) return null;
  const row = data as WalletGoalRow;
  return {
    id: row.id,
    title: row.title,
    target: Number(row.target_amount),
    current: Number(row.current_amount),
    currency: row.currency as WalletGoal["currency"],
    targetDate: row.target_date,
    icon: row.icon || "wallet-savings",
  };
}
