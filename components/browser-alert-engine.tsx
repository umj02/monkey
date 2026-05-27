"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Bell, BellRing, X } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { fetchCalendarEvents, fetchReminders, fetchTaskReminderItems } from "@/lib/services/supabase-data-service";
import { LottieAlertIcon } from "@/components/lottie-alert-icon";
import { subscribeToBackgroundPush, getPushAvailability, type PushSubscriptionState } from "@/lib/push/client";
import { playMonkeySound } from "@/lib/sound/sound-events";
import type { CalendarEvent, Reminder, ReminderPanelItem } from "@/types";

type AlertItem = {
  id: string;
  title: string;
  time: string;
  source: "task" | "reminder";
};

const notifiedKey = "monkey.browserAlerts.notified.v213";

function getStoredNotified(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(notifiedKey) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function setStoredNotified(items: string[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(notifiedKey, JSON.stringify(items.slice(-80)));
}

function currentHHMM() {
  return new Date().toTimeString().slice(0, 5);
}

function minuteKey() {
  const now = new Date();
  return `${now.toISOString().slice(0, 10)}T${now.toTimeString().slice(0, 5)}`;
}


function todayKey() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

function fromDateKey(dateKey: string) {
  const [year = "2026", month = "01", day = "01"] = dateKey.split("-");
  return new Date(Number(year), Number(month) - 1, Number(day));
}

function calendarEventOccursToday(event: CalendarEvent) {
  const dateKey = todayKey();
  const recurrenceType = event.recurrenceType ?? "none";
  if (recurrenceType === "none") return event.date === dateKey;
  if (dateKey.localeCompare(event.date) < 0) return false;
  if (event.recurrenceUntil && dateKey.localeCompare(event.recurrenceUntil) > 0) return false;
  if (recurrenceType === "daily") return true;
  if (recurrenceType === "custom_days") return (event.recurrenceDays ?? []).includes(fromDateKey(dateKey).getDay());
  return false;
}

function standaloneDue(reminder: Reminder) {
  return reminder.enabled && reminder.time === currentHHMM();
}

function taskDue(item: ReminderPanelItem) {
  if (!item.enabled || !item.reminderAt) return false;
  const reminderDate = new Date(item.reminderAt);
  if (Number.isNaN(reminderDate.getTime())) return false;
  const now = new Date();
  const diff = Math.abs(now.getTime() - reminderDate.getTime());
  return diff <= 60_000;
}

export function BrowserAlertEngine() {
  const pathname = usePathname();
  const { session, mode } = useAuth();
  const [activeAlert, setActiveAlert] = useState<AlertItem | null>(null);
  const [permissionState, setPermissionState] = useState<NotificationPermission | "unsupported">("unsupported");
  const [pushState, setPushState] = useState<PushSubscriptionState>("unsupported");
  const [pushMessage, setPushMessage] = useState<string>("");
  const [subscribing, setSubscribing] = useState(false);
  const checkingRef = useRef(false);

  const canUseNotifications = useMemo(() => typeof window !== "undefined" && "Notification" in window, []);

  useEffect(() => {
    setPushState(getPushAvailability());
    if (!canUseNotifications) {
      setPermissionState("unsupported");
      return;
    }
    setPermissionState(Notification.permission);
    if (Notification.permission === "granted" && "serviceWorker" in navigator) {
      navigator.serviceWorker.getRegistration("/sw.js")
        .then((registration) => registration?.pushManager.getSubscription())
        .then((subscription) => {
          if (subscription) setPushState("subscribed");
        })
        .catch(() => null);
    }
  }, [canUseNotifications]);

  const requestPermission = useCallback(async () => {
    if (!canUseNotifications) return;
    setSubscribing(true);
    setPushMessage("");
    try {
      const result = await subscribeToBackgroundPush();
      setPushState(result.state);
      setPushMessage(result.message);
      if ("Notification" in window) setPermissionState(Notification.permission);
    } catch {
      setPushState("error");
      setPushMessage("No se pudieron activar las alertas en segundo plano.");
    } finally {
      setSubscribing(false);
    }
  }, [canUseNotifications]);

  const notify = useCallback((item: AlertItem) => {
    setActiveAlert(item);
    playMonkeySound("alert");
    if (canUseNotifications && Notification.permission === "granted") {
      try {
        new Notification("Monkey Checks", {
          body: `${item.title} · ${item.time}`,
          icon: "/assets/monkey/faces/face-main.png",
          tag: item.id,
        });
      } catch {
        // Some mobile browsers still block Notification constructor. In-app modal remains the fallback.
      }
    }
  }, [canUseNotifications]);

  const checkAlerts = useCallback(async () => {
    if (!session || mode !== "supabase" || checkingRef.current) return;
    checkingRef.current = true;
    try {
      const [standalone, taskItems, calendarEvents] = await Promise.all([fetchReminders(), fetchTaskReminderItems(), fetchCalendarEvents()]);
      const calendarById = new Map((calendarEvents || []).map((event) => [event.id, event]));
      const candidates: AlertItem[] = [];
      for (const reminder of standalone || []) {
        if (reminder.calendarEventId) {
          const event = calendarById.get(reminder.calendarEventId);
          if (!event || !calendarEventOccursToday(event)) continue;
        }
        if (standaloneDue(reminder)) candidates.push({ id: `reminder-${reminder.id}-${minuteKey()}`, title: reminder.title, time: reminder.time, source: "reminder" });
      }
      for (const task of taskItems || []) {
        if (taskDue(task)) candidates.push({ id: `task-${task.taskId || task.id}-${minuteKey()}`, title: task.title, time: task.time, source: "task" });
      }
      if (!candidates.length) return;
      const notified = getStoredNotified();
      const next = candidates.find((item) => !notified.includes(item.id));
      if (!next) return;
      setStoredNotified([...notified, next.id]);
      notify(next);
    } finally {
      checkingRef.current = false;
    }
  }, [mode, notify, session]);

  useEffect(() => {
    if (!session || mode !== "supabase") return;
    void checkAlerts();
    const timer = window.setInterval(() => void checkAlerts(), 30_000);
    return () => window.clearInterval(timer);
  }, [checkAlerts, mode, session]);

  const showPermissionCta = pathname === "/reminders" && (permissionState === "default" || pushState === "missing-key" || pushState === "error");

  return (
    <>
      {showPermissionCta ? (
        <button
          type="button"
          onClick={requestPermission}
          disabled={subscribing || pushState === "missing-key"}
          className="fixed left-1/2 top-[calc(16px+var(--safe-top))] z-[60] flex w-[calc(100%-40px)] max-w-[390px] -translate-x-1/2 items-center gap-3 rounded-[20px] border border-green-100 bg-white/95 p-3 text-left shadow-soft backdrop-blur-xl disabled:opacity-80"
        >
          <span className="grid h-10 w-10 place-items-center rounded-full bg-green-100 text-monkey-green"><Bell className="h-5 w-5" /></span>
          <span className="min-w-0 flex-1">
            <strong className="block text-sm font-black">{subscribing ? "Activando alertas…" : "Activar alertas"}</strong>
            <span className="block text-xs font-bold text-monkey-muted">{pushMessage || (pushState === "missing-key" ? "Falta configurar VAPID en Vercel." : "Permite notificaciones incluso cuando la app está cerrada.")}</span>
          </span>
        </button>
      ) : null}

      {activeAlert ? (
        <div className="fixed inset-0 z-[90] grid place-items-center bg-black/35 px-6 backdrop-blur-sm">
          <section className="w-full max-w-[360px] rounded-[32px] bg-white p-5 text-center shadow-float">
            <button type="button" onClick={() => setActiveAlert(null)} className="ml-auto grid h-10 w-10 place-items-center rounded-full bg-gray-100 text-monkey-ink" aria-label="Cerrar alerta"><X className="h-5 w-5" /></button>
            <div className="mx-auto grid place-items-center"><LottieAlertIcon /></div>
            <div className="mx-auto mt-1 grid h-12 w-12 place-items-center rounded-full bg-yellow-100 text-orange-600"><BellRing className="h-6 w-6" /></div>
            <h2 className="mt-4 text-xl font-black text-monkey-ink">Recordatorio</h2>
            <p className="mt-2 text-sm font-bold text-monkey-muted">{activeAlert.title}</p>
            <p className="mt-3 inline-flex rounded-pill bg-green-100 px-4 py-2 text-sm font-black text-monkey-greenDark">{activeAlert.time}</p>
            <button type="button" onClick={() => setActiveAlert(null)} className="mt-5 h-12 w-full rounded-pill bg-monkey-green text-sm font-black text-white shadow-sm">Entendido</button>
          </section>
        </div>
      ) : null}
    </>
  );
}
