import { NextResponse } from "next/server";
import { createAdminClient, hasSupabaseAdminEnv } from "@/lib/supabase/server";

export const runtime = "nodejs";

type ReminderCronRow = {
  id: string;
  user_id: string;
  title: string;
  remind_time: string;
  repeat_rule: string | null;
  enabled: boolean | null;
  calendar_event_id: string | null;
  created_at: string | null;
};

type CalendarEventCronRow = {
  id: string;
  event_date: string;
  recurrence_type: "none" | "daily" | "custom_days" | null;
  recurrence_days: number[] | null;
  recurrence_until: string | null;
};

type CalendarOverrideCronRow = {
  calendar_event_id: string;
  occurrence_date: string;
  is_cancelled: boolean | null;
};

type PushSubscriptionCronRow = {
  id: string;
  user_id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  timezone: string | null;
};

function authOk(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret && process.env.NODE_ENV !== "production") return true;
  if (!secret) return false;
  const auth = request.headers.get("authorization") || "";
  const xSecret = request.headers.get("x-cron-secret") || "";
  return auth === `Bearer ${secret}` || xSecret === secret;
}

function zonedParts(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    weekday: "short",
  }).formatToParts(date);
  const map = new Map(parts.map((part) => [part.type, part.value]));
  const dateKey = `${map.get("year")}-${map.get("month")}-${map.get("day")}`;
  const time = `${map.get("hour")}:${map.get("minute")}`;
  const weekdayName = map.get("weekday") || "Sun";
  const weekdayMap: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  return { dateKey, time, weekday: weekdayMap[weekdayName] ?? 0 };
}

function occursOnDate(event: CalendarEventCronRow, dateKey: string, weekday: number) {
  const recurrenceType = event.recurrence_type || "none";
  if (recurrenceType === "none") return event.event_date === dateKey;
  if (dateKey.localeCompare(event.event_date) < 0) return false;
  if (event.recurrence_until && dateKey.localeCompare(event.recurrence_until) > 0) return false;
  if (recurrenceType === "daily") return true;
  if (recurrenceType === "custom_days") return (event.recurrence_days || []).includes(weekday);
  return false;
}

function standaloneOccurs(reminder: ReminderCronRow, dateKey: string, weekday: number) {
  const repeat = reminder.repeat_rule || "daily";
  if (repeat === "daily" || repeat === "custom") return true;
  if (repeat === "weekly") {
    const created = reminder.created_at ? new Date(reminder.created_at) : null;
    if (!created || Number.isNaN(created.getTime())) return true;
    const createdWeekday = created.getDay();
    return createdWeekday === weekday;
  }
  return true;
}

async function loadWebPush() {
  const mod = await import("web-push") as any;
  return mod.default || mod;
}

export async function GET(request: Request) {
  if (!authOk(request)) return NextResponse.json({ error: "Unauthorized cron request." }, { status: 401 });
  if (!hasSupabaseAdminEnv()) return NextResponse.json({ error: "Supabase admin env is not configured." }, { status: 500 });
  if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY || !process.env.VAPID_SUBJECT) {
    return NextResponse.json({ error: "VAPID env is not configured." }, { status: 500 });
  }

  const supabase = createAdminClient() as any;
  const now = new Date();

  const { data: subscriptionData, error: subscriptionError } = await supabase
    .from("push_subscriptions")
    .select("id,user_id,endpoint,p256dh,auth,timezone")
    .eq("enabled", true);

  if (subscriptionError) return NextResponse.json({ error: "Could not load subscriptions." }, { status: 500 });

  const subscriptions: PushSubscriptionCronRow[] = subscriptionData || [];
  if (!subscriptions.length) return NextResponse.json({ ok: true, sent: 0, checked: 0, message: "No subscriptions." });

  const userTimezones = new Map<string, string>();
  for (const subscription of subscriptions) {
    if (!userTimezones.has(subscription.user_id)) userTimezones.set(subscription.user_id, subscription.timezone || "America/Costa_Rica");
  }
  const userIds = Array.from(userTimezones.keys());

  const { data: reminderData, error: reminderError } = await supabase
    .from("reminders")
    .select("id,user_id,title,remind_time,repeat_rule,enabled,calendar_event_id,created_at")
    .eq("enabled", true)
    .in("user_id", userIds);

  if (reminderError) return NextResponse.json({ error: "Could not load reminders." }, { status: 500 });
  const reminders: ReminderCronRow[] = reminderData || [];

  const calendarIds = Array.from(new Set(reminders.map((reminder) => reminder.calendar_event_id).filter(Boolean))) as string[];
  let calendarEvents: CalendarEventCronRow[] = [];
  let overrides: CalendarOverrideCronRow[] = [];
  if (calendarIds.length) {
    const [{ data: eventData }, { data: overrideData }] = await Promise.all([
      supabase
        .from("calendar_events")
        .select("id,event_date,recurrence_type,recurrence_days,recurrence_until")
        .in("id", calendarIds),
      supabase
        .from("calendar_event_occurrence_overrides")
        .select("calendar_event_id,occurrence_date,is_cancelled")
        .in("calendar_event_id", calendarIds)
        .eq("is_cancelled", true),
    ]);
    calendarEvents = eventData || [];
    overrides = overrideData || [];
  }

  const eventById = new Map(calendarEvents.map((event) => [event.id, event]));
  const cancelled = new Set(overrides.map((override) => `${override.calendar_event_id}:${override.occurrence_date}`));
  const byUser = new Map<string, PushSubscriptionCronRow[]>();
  for (const subscription of subscriptions) {
    const list = byUser.get(subscription.user_id) || [];
    list.push(subscription);
    byUser.set(subscription.user_id, list);
  }

  const webPush = await loadWebPush();
  webPush.setVapidDetails(process.env.VAPID_SUBJECT, process.env.VAPID_PUBLIC_KEY, process.env.VAPID_PRIVATE_KEY);

  let checked = 0;
  let sent = 0;
  let skipped = 0;
  let failed = 0;

  for (const reminder of reminders) {
    const timeZone = userTimezones.get(reminder.user_id) || "America/Costa_Rica";
    const { dateKey, time, weekday } = zonedParts(now, timeZone);
    checked += 1;
    if ((reminder.remind_time || "").slice(0, 5) !== time) continue;

    if (reminder.calendar_event_id) {
      const event = eventById.get(reminder.calendar_event_id);
      if (!event) continue;
      if (cancelled.has(`${event.id}:${dateKey}`)) continue;
      if (!occursOnDate(event, dateKey, weekday)) continue;
    } else if (!standaloneOccurs(reminder, dateKey, weekday)) {
      continue;
    }

    const scheduledFor = `${dateKey}T${time}`;
    const { error: deliveryError } = await supabase
      .from("push_notification_deliveries")
      .insert({ user_id: reminder.user_id, reminder_id: reminder.id, scheduled_for: scheduledFor, status: "pending" });

    if (deliveryError) {
      skipped += 1;
      continue;
    }

    const userSubscriptions = byUser.get(reminder.user_id) || [];
    for (const subscription of userSubscriptions) {
      try {
        await webPush.sendNotification(
          {
            endpoint: subscription.endpoint,
            keys: { p256dh: subscription.p256dh, auth: subscription.auth },
          },
          JSON.stringify({
            title: "Monkey Checks",
            body: reminder.title,
            url: "/reminders",
            reminderId: reminder.id,
          }),
        );
        sent += 1;
      } catch (error: any) {
        failed += 1;
        if (error?.statusCode === 404 || error?.statusCode === 410) {
          await supabase.from("push_subscriptions").update({ enabled: false }).eq("id", subscription.id);
        }
      }
    }

    await supabase
      .from("push_notification_deliveries")
      .update({ status: failed ? "partial" : "sent", sent_at: new Date().toISOString() })
      .eq("user_id", reminder.user_id)
      .eq("reminder_id", reminder.id)
      .eq("scheduled_for", scheduledFor);
  }

  return NextResponse.json({ ok: true, checked, sent, skipped, failed });
}

export async function POST(request: Request) {
  return GET(request);
}
