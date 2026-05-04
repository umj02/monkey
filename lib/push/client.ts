import { createOptionalClient } from "@/lib/supabase/client";

export type PushSubscriptionState = "unsupported" | "missing-key" | "default" | "denied" | "subscribed" | "error";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i += 1) outputArray[i] = rawData.charCodeAt(i);
  return outputArray;
}

async function getAccessToken() {
  const supabase = createOptionalClient();
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

export function getPushAvailability(): PushSubscriptionState {
  if (typeof window === "undefined") return "unsupported";
  if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) return "unsupported";
  if (!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY) return "missing-key";
  if (Notification.permission === "denied") return "denied";
  return "default";
}

export async function subscribeToBackgroundPush(): Promise<{ ok: boolean; state: PushSubscriptionState; message: string }> {
  const availability = getPushAvailability();
  if (availability === "unsupported") return { ok: false, state: "unsupported", message: "Este navegador no soporta alertas push." };
  if (availability === "missing-key") return { ok: false, state: "missing-key", message: "Falta configurar NEXT_PUBLIC_VAPID_PUBLIC_KEY." };
  if (availability === "denied") return { ok: false, state: "denied", message: "Las notificaciones están bloqueadas en el navegador." };

  const permission = await Notification.requestPermission();
  if (permission !== "granted") return { ok: false, state: permission === "denied" ? "denied" : "default", message: "No se activaron las notificaciones." };

  const registration = await navigator.serviceWorker.register("/sw.js");
  await navigator.serviceWorker.ready;

  const existing = await registration.pushManager.getSubscription();
  const subscription = existing ?? await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ""),
  });

  const token = await getAccessToken();
  if (!token) return { ok: false, state: "error", message: "No se encontró una sesión activa." };

  const response = await fetch("/api/push/subscribe", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      subscription: subscription.toJSON(),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "America/Costa_Rica",
    }),
  });

  if (!response.ok) return { ok: false, state: "error", message: "No se pudo registrar la alerta en segundo plano." };
  return { ok: true, state: "subscribed", message: "Alertas en segundo plano activadas." };
}

export async function unsubscribeFromBackgroundPush(): Promise<{ ok: boolean; message: string }> {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return { ok: false, message: "No disponible." };
  const registration = await navigator.serviceWorker.getRegistration("/sw.js");
  const subscription = await registration?.pushManager.getSubscription();
  const token = await getAccessToken();

  if (token && subscription?.endpoint) {
    await fetch("/api/push/unsubscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ endpoint: subscription.endpoint }),
    }).catch(() => null);
  }

  if (subscription) await subscription.unsubscribe().catch(() => false);
  return { ok: true, message: "Alertas en segundo plano desactivadas." };
}
