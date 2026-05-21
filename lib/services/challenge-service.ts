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
    completed_tasks: challenge.tasks.filter((task) => task.status === "checked" || task.status === "verified").length,
  };
  if (isUuid(challenge.id)) payload.id = challenge.id;

  const { data, error } = await supabase
    .from("personal_challenges")
    .upsert(payload, { onConflict: "user_id,local_id" })
    .select("id,local_id,origin,title,description,icon_key,image_path,activity_type_key,frequency,status,start_date,end_date,reward_bananas,requires_guardian_verification,claimed_at,created_at,updated_at")
    .single();
  if (error) return null;

  for (const task of challenge.tasks) {
    await supabase.from("challenge_tasks").upsert({
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
    }, { onConflict: "user_id,local_id" });
  }

  return mapChallengeRow(data, challenge.tasks);
}

export async function upsertBananaLedgerEntryRemote(entry: BananaLedgerEntry): Promise<BananaLedgerEntry | null> {
  const supabase = createOptionalClient() as any;
  const userId = await getUserId();
  if (!supabase || !userId) return null;
  const { data, error } = await supabase
    .from("banana_ledger")
    .upsert({
      user_id: userId,
      local_id: entry.id,
      source_type: entry.sourceType,
      source_id: entry.sourceId,
      amount: entry.amount,
      reason: entry.reason,
    }, { onConflict: "user_id,source_type,source_id" })
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
