import { createId } from "@/lib/local-storage";
import { createOptionalClient } from "@/lib/supabase/client";
import { getUserId } from "@/lib/services/supabase-data-service";
import type { BananaLedgerEntry, Challenge, ChallengeTask } from "@/types";

function nowIso() {
  return new Date().toISOString();
}

function isUuid(id: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
}

export function createChallengeDraft(input: Omit<Challenge, "id" | "createdAt" | "updatedAt" | "tasks" | "status" | "claimedAt"> & { tasks: Omit<ChallengeTask, "challengeId" | "status" | "checkedAt" | "verifiedAt">[] }): Challenge {
  const id = createId("challenge");
  const createdAt = nowIso();
  return {
    ...input,
    id,
    status: "active",
    claimedAt: null,
    createdAt,
    updatedAt: createdAt,
    tasks: input.tasks.map((task) => ({
      ...task,
      challengeId: id,
      status: "pending",
      checkedAt: null,
      verifiedAt: null,
    })),
  };
}

export function createBananaLedgerEntry(input: Omit<BananaLedgerEntry, "id" | "createdAt">): BananaLedgerEntry {
  return {
    ...input,
    id: createId("banana"),
    createdAt: nowIso(),
  };
}

function mapChallengeRow(row: any, tasks: ChallengeTask[] = []): Challenge {
  return {
    id: row.local_id || row.id,
    origin: row.origin || "personal",
    title: row.title,
    description: row.description || "",
    iconKey: row.icon_key || "monito-otro",
    imagePath: row.image_path || null,
    activityTypeKey: row.activity_type_key || "otro",
    frequency: row.frequency || "daily",
    status: row.status || "active",
    startDate: row.start_date,
    endDate: row.end_date,
    rewardBananas: Number(row.reward_bananas || 0),
    requiresGuardianVerification: Boolean(row.requires_guardian_verification),
    claimedAt: row.claimed_at || null,
    createdAt: row.created_at || nowIso(),
    updatedAt: row.updated_at || row.created_at || nowIso(),
    tasks,
  };
}

function mapTaskRow(row: any): ChallengeTask {
  return {
    id: row.local_id || row.id,
    challengeId: row.challenge_id,
    calendarEventId: row.calendar_event_id || null,
    title: row.title,
    iconKey: row.icon_key || "monito-otro",
    activityTypeKey: row.activity_type_key || "otro",
    scheduledDate: row.scheduled_date,
    scheduledTime: (row.scheduled_time || "09:00").slice(0, 5),
    status: row.status || "pending",
    rewardBananas: Number(row.reward_bananas || 0),
    checkedAt: row.checked_at || null,
    verifiedAt: row.verified_at || null,
  };
}

function mapLedgerRow(row: any): BananaLedgerEntry {
  return {
    id: row.local_id || row.id,
    userId: row.user_id || null,
    sourceType: row.source_type || "challenge",
    sourceId: row.source_id,
    amount: Number(row.amount || 0),
    reason: row.reason || "Bananas ganadas",
    createdAt: row.created_at || nowIso(),
  };
}

async function findChallengeRow(supabase: any, userId: string, challengeId: string) {
  let query = supabase
    .from("personal_challenges")
    .select("id,local_id,origin,title,description,icon_key,image_path,activity_type_key,frequency,status,start_date,end_date,reward_bananas,requires_guardian_verification,claimed_at,created_at,updated_at")
    .eq("user_id", userId);

  query = isUuid(challengeId) ? query.or(`local_id.eq.${challengeId},id.eq.${challengeId}`) : query.eq("local_id", challengeId);
  const { data } = await query.limit(1).maybeSingle();
  return data ?? null;
}

async function findChallengeTaskRow(supabase: any, userId: string, taskId: string) {
  let query = supabase
    .from("challenge_tasks")
    .select("id,local_id,challenge_id,calendar_event_id,title,icon_key,activity_type_key,scheduled_date,scheduled_time,status,reward_bananas,checked_at,verified_at")
    .eq("user_id", userId);

  query = isUuid(taskId) ? query.or(`local_id.eq.${taskId},id.eq.${taskId}`) : query.eq("local_id", taskId);
  const { data } = await query.limit(1).maybeSingle();
  return data ?? null;
}

async function recalculateChallengeProgressRemote(supabase: any, userId: string, challengeId: string) {
  const { data: rows } = await supabase
    .from("challenge_tasks")
    .select("status")
    .eq("user_id", userId)
    .eq("challenge_id", challengeId);

  const tasks = rows ?? [];
  const total = tasks.length;
  const completed = tasks.filter((task: any) => task.status === "checked" || task.status === "verified").length;
  await supabase
    .from("personal_challenges")
    .update({ total_tasks: total, completed_tasks: completed })
    .eq("user_id", userId)
    .eq("local_id", challengeId);

  return { total, completed };
}

export async function fetchChallengesRemote(): Promise<Challenge[] | null> {
  const supabase = createOptionalClient() as any;
  const userId = await getUserId();
  if (!supabase || !userId) return null;

  const { data: challengeRows, error } = await supabase
    .from("personal_challenges")
    .select("id,local_id,origin,title,description,icon_key,image_path,activity_type_key,frequency,status,start_date,end_date,reward_bananas,requires_guardian_verification,claimed_at,created_at,updated_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) return null;

  const ids = (challengeRows ?? []).map((row: any) => row.local_id || row.id);
  let taskRows: any[] = [];
  if (ids.length) {
    const { data } = await supabase
      .from("challenge_tasks")
      .select("id,local_id,challenge_id,calendar_event_id,title,icon_key,activity_type_key,scheduled_date,scheduled_time,status,reward_bananas,checked_at,verified_at")
      .eq("user_id", userId)
      .in("challenge_id", ids)
      .order("scheduled_date", { ascending: true })
      .order("scheduled_time", { ascending: true });
    taskRows = data ?? [];
  }

  return (challengeRows ?? []).map((row: any) => {
    const challengeId = row.local_id || row.id;
    const tasks = taskRows.filter((task) => task.challenge_id === challengeId).map(mapTaskRow);
    return mapChallengeRow(row, tasks);
  });
}

export async function upsertChallengeRemote(challenge: Challenge): Promise<Challenge | null> {
  const supabase = createOptionalClient() as any;
  const userId = await getUserId();
  if (!supabase || !userId) return null;

  const completedTasks = challenge.tasks.filter((task) => task.status === "checked" || task.status === "verified").length;
  const payload: any = {
    user_id: userId,
    local_id: challenge.id,
    origin: challenge.origin,
    title: challenge.title,
    description: challenge.description,
    icon_key: challenge.iconKey,
    image_path: challenge.imagePath ?? null,
    activity_type_key: challenge.activityTypeKey,
    frequency: challenge.frequency,
    status: challenge.status,
    start_date: challenge.startDate,
    end_date: challenge.endDate,
    reward_bananas: challenge.rewardBananas,
    requires_guardian_verification: challenge.requiresGuardianVerification,
    claimed_at: challenge.claimedAt ?? null,
    total_tasks: challenge.tasks.length,
    completed_tasks: completedTasks,
  };

  let savedChallenge = await findChallengeRow(supabase, userId, challenge.id);
  if (savedChallenge?.id) {
    const { data, error } = await supabase
      .from("personal_challenges")
      .update(payload)
      .eq("id", savedChallenge.id)
      .select("id,local_id,origin,title,description,icon_key,image_path,activity_type_key,frequency,status,start_date,end_date,reward_bananas,requires_guardian_verification,claimed_at,created_at,updated_at")
      .single();
    if (!error && data) savedChallenge = data;
  } else {
    if (isUuid(challenge.id)) payload.id = challenge.id;
    const { data, error } = await supabase
      .from("personal_challenges")
      .insert(payload)
      .select("id,local_id,origin,title,description,icon_key,image_path,activity_type_key,frequency,status,start_date,end_date,reward_bananas,requires_guardian_verification,claimed_at,created_at,updated_at")
      .single();
    if (error || !data) return null;
    savedChallenge = data;
  }

  for (const task of challenge.tasks) {
    const taskPayload = {
      user_id: userId,
      local_id: task.id,
      challenge_id: challenge.id,
      calendar_event_id: task.calendarEventId ?? null,
      title: task.title,
      icon_key: task.iconKey,
      activity_type_key: task.activityTypeKey,
      scheduled_date: task.scheduledDate,
      scheduled_time: task.scheduledTime,
      status: task.status,
      reward_bananas: task.rewardBananas,
      checked_at: task.checkedAt ?? null,
      verified_at: task.verifiedAt ?? null,
    };
    const existingTask = await findChallengeTaskRow(supabase, userId, task.id);
    if (existingTask?.id) {
      await supabase.from("challenge_tasks").update(taskPayload).eq("id", existingTask.id);
    } else {
      await supabase.from("challenge_tasks").insert(taskPayload);
    }
  }

  await recalculateChallengeProgressRemote(supabase, userId, challenge.id);
  return mapChallengeRow(savedChallenge, challenge.tasks);
}

export async function syncChallengeTaskCompletionRemote(input: {
  challengeId?: string | null;
  taskId?: string | null;
  calendarEventId?: string | null;
  done: boolean;
}): Promise<void> {
  const supabase = createOptionalClient() as any;
  const userId = await getUserId();
  if (!supabase || !userId || !input.challengeId || !input.taskId) return;

  const checkedAt = input.done ? nowIso() : null;
  const payload = {
    status: input.done ? "checked" : "pending",
    checked_at: checkedAt,
    calendar_event_id: input.calendarEventId ?? null,
  };

  const existingTask = await findChallengeTaskRow(supabase, userId, input.taskId);
  if (existingTask?.id) {
    await supabase.from("challenge_tasks").update(payload).eq("id", existingTask.id);
  } else {
    await supabase
      .from("challenge_tasks")
      .update(payload)
      .eq("user_id", userId)
      .eq("challenge_id", input.challengeId)
      .eq("calendar_event_id", input.calendarEventId ?? "");
  }

  await recalculateChallengeProgressRemote(supabase, userId, input.challengeId);
}

export async function upsertBananaLedgerEntryRemote(entry: BananaLedgerEntry): Promise<BananaLedgerEntry | null> {
  const supabase = createOptionalClient() as any;
  const userId = await getUserId();
  if (!supabase || !userId) return null;

  const payload = {
    user_id: userId,
    local_id: entry.id,
    source_type: entry.sourceType,
    source_id: entry.sourceId,
    amount: entry.amount,
    reason: entry.reason,
  };

  const { data: existing } = await supabase
    .from("banana_ledger")
    .select("id,local_id,user_id,source_type,source_id,amount,reason,created_at")
    .eq("user_id", userId)
    .eq("source_type", entry.sourceType)
    .eq("source_id", entry.sourceId)
    .limit(1)
    .maybeSingle();

  if (existing?.id) {
    const { data, error } = await supabase
      .from("banana_ledger")
      .update(payload)
      .eq("id", existing.id)
      .select("id,local_id,user_id,source_type,source_id,amount,reason,created_at")
      .single();
    return error ? null : mapLedgerRow(data);
  }

  const { data, error } = await supabase
    .from("banana_ledger")
    .insert(payload)
    .select("id,local_id,user_id,source_type,source_id,amount,reason,created_at")
    .single();
  return error ? null : mapLedgerRow(data);
}

export async function fetchBananaLedgerRemote(): Promise<BananaLedgerEntry[] | null> {
  const supabase = createOptionalClient() as any;
  const userId = await getUserId();
  if (!supabase || !userId) return null;
  const { data, error } = await supabase
    .from("banana_ledger")
    .select("id,local_id,user_id,source_type,source_id,amount,reason,created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  return error ? null : (data ?? []).map(mapLedgerRow);
}
