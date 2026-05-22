import { createId } from "@/lib/local-storage";
import { createOptionalClient } from "@/lib/supabase/client";
import { getUserId } from "@/lib/services/supabase-data-service";
import { compareDateKeys, toDateKey } from "@/lib/calendar/calendar-utils";
import type { BananaLedgerEntry, Challenge, ChallengeTask } from "@/types";

function nowIso() {
  return new Date().toISOString();
}

function todayKey() {
  return toDateKey(new Date());
}

function effectiveTaskStatus(task: Pick<ChallengeTask, "status" | "scheduledDate">) {
  if ((task.status === "pending" || !task.status) && compareDateKeys(task.scheduledDate, todayKey()) < 0) return "missed" as const;
  return task.status;
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
    status: effectiveTaskStatus({ status: row.status || "pending", scheduledDate: row.scheduled_date }),
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

  const mapped = (challengeRows ?? []).map((row: any) => {
    const challengeId = row.local_id || row.id;
    const tasks = taskRows.filter((task) => task.challenge_id === challengeId).map(mapTaskRow);
    return mapChallengeRow(row, tasks);
  });

  await reconcileMissedChallengesRemote(supabase, userId, mapped);
  return mapped;
}

async function selectChallengeByLocalId(supabase: any, userId: string, localId: string) {
  const { data } = await supabase
    .from("personal_challenges")
    .select("id,local_id,origin,title,description,icon_key,image_path,activity_type_key,frequency,status,start_date,end_date,reward_bananas,requires_guardian_verification,claimed_at,created_at,updated_at")
    .eq("user_id", userId)
    .eq("local_id", localId)
    .maybeSingle();
  return data ?? null;
}

async function saveChallengeTaskRemote(supabase: any, userId: string, task: ChallengeTask) {
  const payload = {
    user_id: userId,
    local_id: task.id,
    challenge_id: task.challengeId,
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

  const { data: existing } = await supabase
    .from("challenge_tasks")
    .select("id")
    .eq("user_id", userId)
    .eq("local_id", task.id)
    .maybeSingle();

  if (existing?.id) {
    const { error } = await supabase
      .from("challenge_tasks")
      .update(payload)
      .eq("id", existing.id);
    return !error;
  }

  const { error } = await supabase.from("challenge_tasks").insert(payload);
  return !error;
}

async function reconcileMissedChallengesRemote(supabase: any, userId: string, challenges: Challenge[]) {
  const now = nowIso();
  for (const challenge of challenges) {
    if (challenge.claimedAt || challenge.status === "completed" || challenge.status === "cancelled") continue;
    const missedTasks = challenge.tasks.filter((task) => task.status === "missed" || (task.status === "pending" && compareDateKeys(task.scheduledDate, todayKey()) < 0));
    if (!missedTasks.length) continue;

    for (const task of missedTasks) {
      await supabase
        .from("challenge_tasks")
        .update({ status: "missed", checked_at: null, updated_at: now })
        .eq("user_id", userId)
        .eq("local_id", task.id);

      if (task.calendarEventId) {
        await supabase
          .from("calendar_events")
          .update({ done: false, verification_status: "none" })
          .eq("user_id", userId)
          .eq("id", task.calendarEventId);
      }
    }

    const completedTasks = challenge.tasks.filter((task) => task.status === "checked" || task.status === "verified").length;
    const hasMissed = challenge.tasks.some((task) => task.status === "missed") || missedTasks.length > 0;
    await supabase
      .from("personal_challenges")
      .update({ completed_tasks: completedTasks, status: hasMissed ? "expired" : challenge.status })
      .eq("user_id", userId)
      .eq("local_id", challenge.id);
  }
}

export async function upsertChallengeRemote(challenge: Challenge): Promise<Challenge | null> {
  const supabase = createOptionalClient() as any;
  const userId = await getUserId();
  if (!supabase || !userId) return null;

  const completedTasks = challenge.tasks.filter((task) => task.status === "checked" || task.status === "verified").length;
  const hasMissed = challenge.tasks.some((task) => effectiveTaskStatus(task) === "missed");
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
    status: hasMissed && !challenge.claimedAt ? "expired" : challenge.status,
    start_date: challenge.startDate,
    end_date: challenge.endDate,
    reward_bananas: challenge.rewardBananas,
    requires_guardian_verification: challenge.requiresGuardianVerification,
    claimed_at: challenge.claimedAt ?? null,
    total_tasks: challenge.tasks.length,
    completed_tasks: completedTasks,
  };

  let row = await selectChallengeByLocalId(supabase, userId, challenge.id);

  if (row?.id) {
    const { data, error } = await supabase
      .from("personal_challenges")
      .update(payload)
      .eq("id", row.id)
      .select("id,local_id,origin,title,description,icon_key,image_path,activity_type_key,frequency,status,start_date,end_date,reward_bananas,requires_guardian_verification,claimed_at,created_at,updated_at")
      .single();
    if (error) return null;
    row = data;
  } else {
    if (isUuid(challenge.id)) payload.id = challenge.id;
    const { data, error } = await supabase
      .from("personal_challenges")
      .insert(payload)
      .select("id,local_id,origin,title,description,icon_key,image_path,activity_type_key,frequency,status,start_date,end_date,reward_bananas,requires_guardian_verification,claimed_at,created_at,updated_at")
      .single();
    if (error) return null;
    row = data;
  }

  for (const task of challenge.tasks) {
    const ok = await saveChallengeTaskRemote(supabase, userId, task);
    if (!ok) return null;
  }

  return mapChallengeRow(row, challenge.tasks);
}

export async function syncChallengeTaskCompletionRemote(input: {
  challengeId: string;
  challengeTaskId: string;
  calendarEventId?: string | null;
  done: boolean;
}): Promise<boolean> {
  const supabase = createOptionalClient() as any;
  const userId = await getUserId();
  if (!supabase || !userId || !input.challengeId || !input.challengeTaskId) return false;

  const { data: taskRow } = await supabase
    .from("challenge_tasks")
    .select("id,scheduled_date,status")
    .eq("user_id", userId)
    .eq("local_id", input.challengeTaskId)
    .maybeSingle();
  if (!taskRow?.id) return false;

  const currentToday = todayKey();
  if (input.done && compareDateKeys(taskRow.scheduled_date, currentToday) > 0) return false;
  const nextStatus = input.done ? "checked" : (compareDateKeys(taskRow.scheduled_date, currentToday) < 0 ? "missed" : "pending");
  const checkedAt = input.done ? nowIso() : null;
  const { error: taskError } = await supabase
    .from("challenge_tasks")
    .update({ status: nextStatus, checked_at: checkedAt })
    .eq("id", taskRow.id);
  if (taskError) return false;

  if (input.calendarEventId) {
    await supabase
      .from("calendar_events")
      .update({ done: input.done, verification_status: input.done ? "self_checked" : "none" })
      .eq("user_id", userId)
      .eq("id", input.calendarEventId);
  }

  const { data: tasks, error: tasksError } = await supabase
    .from("challenge_tasks")
    .select("status")
    .eq("user_id", userId)
    .eq("challenge_id", input.challengeId);
  if (tasksError) return false;

  const completedTasks = (tasks ?? []).filter((task: any) => task.status === "checked" || task.status === "verified").length;
  const hasMissed = (tasks ?? []).some((task: any) => task.status === "missed");
  const { data: challengeRow } = await supabase
    .from("personal_challenges")
    .select("id,claimed_at")
    .eq("user_id", userId)
    .eq("local_id", input.challengeId)
    .maybeSingle();

  if (challengeRow?.id) {
    const allDone = (tasks ?? []).length > 0 && completedTasks >= (tasks ?? []).length;
    const { error: challengeError } = await supabase
      .from("personal_challenges")
      .update({
        completed_tasks: completedTasks,
        status: allDone && challengeRow.claimed_at ? "completed" : hasMissed ? "expired" : "active",
      })
      .eq("id", challengeRow.id);
    if (challengeError) return false;
  }

  return true;
}

export async function upsertBananaLedgerEntryRemote(entry: BananaLedgerEntry): Promise<BananaLedgerEntry | null> {
  const supabase = createOptionalClient() as any;
  const userId = await getUserId();
  if (!supabase || !userId) return null;

  const { data: existing } = await supabase
    .from("banana_ledger")
    .select("id")
    .eq("user_id", userId)
    .eq("source_type", entry.sourceType)
    .eq("source_id", entry.sourceId)
    .maybeSingle();

  if (existing?.id) {
    const { data, error } = await supabase
      .from("banana_ledger")
      .update({
        local_id: entry.id,
        amount: entry.amount,
        reason: entry.reason,
      })
      .eq("id", existing.id)
      .select("id,local_id,user_id,source_type,source_id,amount,reason,created_at")
      .single();
    return error ? null : mapLedgerRow(data);
  }

  const { data, error } = await supabase
    .from("banana_ledger")
    .insert({
      user_id: userId,
      local_id: entry.id,
      source_type: entry.sourceType,
      source_id: entry.sourceId,
      amount: entry.amount,
      reason: entry.reason,
    })
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
