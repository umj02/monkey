export type MonkeySoundEvent =
  | "achievement"
  | "error"
  | "bananaReward"
  | "confirmation"
  | "alert"
  | "todayTaskComplete"
  | "notification"
  | "alarm";

export const MONKEY_SOUND_EVENT = "monkey:sound";

export function playMonkeySound(event: MonkeySoundEvent) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<MonkeySoundEvent>(MONKEY_SOUND_EVENT, { detail: event }));
}
