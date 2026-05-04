import type { CalendarEvent } from "@/types";
import { activityAssetGallery, calendarActivityAssets, getAssetByKey, type AppAsset } from "@/lib/asset-library";

export type ActivityType = {
  key: string;
  label: string;
  iconKey: string;
  color: CalendarEvent["color"];
  group: "rutina" | "estudio" | "salud" | "comida" | "proyecto" | "social" | "descanso" | "otro";
};

const baseActivityTypes: ActivityType[] = [
  { key: "study", label: "Estudiar", iconKey: "calendar-study", color: "blue", group: "estudio" },
  { key: "class", label: "Clases", iconKey: "calendar-class", color: "green", group: "estudio" },
  { key: "task", label: "Tarea", iconKey: "calendar-task", color: "orange", group: "proyecto" },
  { key: "project", label: "Proyecto", iconKey: "calendar-project", color: "purple", group: "proyecto" },
  { key: "exercise", label: "Ejercicio", iconKey: "calendar-exercise", color: "yellow", group: "salud" },
  { key: "gym", label: "Gym", iconKey: "activity-gym", color: "yellow", group: "salud" },
  { key: "food", label: "Comida", iconKey: "calendar-food", color: "pink", group: "comida" },
  { key: "fruit", label: "Frutas", iconKey: "activity-fruit", color: "pink", group: "comida" },
  { key: "breakfast", label: "Desayuno", iconKey: "activity-breakfast", color: "pink", group: "comida" },
  { key: "water", label: "Agua", iconKey: "activity-water", color: "blue", group: "salud" },
  { key: "health", label: "Salud", iconKey: "calendar-health", color: "blue", group: "salud" },
  { key: "rest", label: "Descanso", iconKey: "calendar-rest", color: "purple", group: "descanso" },
  { key: "sleep", label: "Dormir", iconKey: "activity-sleep", color: "purple", group: "descanso" },
  { key: "meditation", label: "Meditación", iconKey: "calendar-meditation", color: "purple", group: "salud" },
  { key: "meditate", label: "Meditar", iconKey: "activity-meditate", color: "purple", group: "salud" },
  { key: "shower", label: "Bañarse", iconKey: "activity-shower", color: "blue", group: "rutina" },
  { key: "brush", label: "Cepillarse", iconKey: "activity-brush", color: "green", group: "rutina" },
  { key: "wake_up", label: "Despertar", iconKey: "activity-wakeup", color: "yellow", group: "rutina" },
  { key: "cleaning", label: "Limpieza", iconKey: "calendar-cleaning", color: "green", group: "rutina" },
  { key: "reading", label: "Lectura", iconKey: "calendar-reading", color: "blue", group: "estudio" },
  { key: "music", label: "Música", iconKey: "activity-music", color: "purple", group: "social" },
  { key: "instrument", label: "Instrumento", iconKey: "activity-instrument", color: "orange", group: "social" },
  { key: "soccer", label: "Fútbol", iconKey: "activity-soccer", color: "yellow", group: "salud" },
  { key: "meeting", label: "Reunión", iconKey: "calendar-meeting", color: "purple", group: "social" },
  { key: "out", label: "Salida", iconKey: "calendar-out", color: "orange", group: "social" },
  { key: "cinema", label: "Cine", iconKey: "calendar-cinema", color: "purple", group: "social" },
  { key: "fastfood", label: "Comida rápida", iconKey: "calendar-fastfood", color: "pink", group: "comida" },
  { key: "vacation", label: "Vacaciones", iconKey: "calendar-vacation", color: "green", group: "social" },
  { key: "care", label: "Cuidado personal", iconKey: "activity-care", color: "green", group: "rutina" },
  { key: "other", label: "Otro", iconKey: "calendar-task", color: "orange", group: "otro" },
];

function uniqueTypes(types: ActivityType[]) {
  const seen = new Set<string>();
  return types.filter((type) => {
    if (seen.has(type.key)) return false;
    seen.add(type.key);
    return true;
  });
}

export const ACTIVITY_TYPES = uniqueTypes(baseActivityTypes);

export function getActivityTypeByKey(key?: string | null) {
  if (!key) return ACTIVITY_TYPES[0];
  return ACTIVITY_TYPES.find((type) => type.key === key || type.iconKey === key) ?? ACTIVITY_TYPES[0];
}

export function inferActivityTypeFromIcon(iconKey?: string | null) {
  if (!iconKey) return ACTIVITY_TYPES[0];
  return ACTIVITY_TYPES.find((type) => type.iconKey === iconKey) ?? ACTIVITY_TYPES[0];
}

export function inferActivityTypeFromEvent(event: CalendarEvent) {
  if (event.activityTypeKey) return getActivityTypeByKey(event.activityTypeKey);
  if (event.iconKey) {
    const byIcon = inferActivityTypeFromIcon(event.iconKey);
    if (byIcon) return byIcon;
  }
  const lower = event.title.toLowerCase();
  const byLabel = ACTIVITY_TYPES.find((type) => lower.includes(type.label.toLowerCase()) || lower.includes(type.key.replace(/_/g, " ")));
  if (byLabel) return byLabel;
  return ACTIVITY_TYPES.find((type) => type.color === event.color) ?? ACTIVITY_TYPES[0];
}

export function activityTypeAssets(): AppAsset[] {
  return ACTIVITY_TYPES.map((type) => {
    const asset = getAssetByKey(type.iconKey) ?? activityAssetGallery.find((item) => item.key === type.iconKey) ?? calendarActivityAssets.find((item) => item.key === type.iconKey);
    return {
      key: type.key,
      label: type.label,
      src: asset?.src ?? "/assets/activities/calendar/tarea.png",
      category: asset?.category ?? "activity",
      group: type.group,
    };
  });
}

export function activityTypePillClass(color: CalendarEvent["color"]) {
  const map: Record<CalendarEvent["color"], string> = {
    yellow: "bg-[#FDF6BA] text-[#A66A00]",
    blue: "bg-[#DDF7F7] text-[#187187]",
    green: "bg-[#DDF7D8] text-[#2E7D32]",
    pink: "bg-[#FFE1E7] text-[#D9415F]",
    purple: "bg-[#E8DEFF] text-[#6242B5]",
    orange: "bg-[#FFE9D7] text-[#B76119]",
  };
  return map[color];
}
