import type { CalendarEvent } from "@/types";
import { activityAssetGallery, getAssetByKey, type AppAsset } from "@/lib/asset-library";

export type ActivityType = {
  key: string;
  label: string;
  iconKey: string;
  color: CalendarEvent["color"];
  group: "rutina" | "estudio" | "salud" | "comida" | "proyecto" | "social" | "descanso" | "otro";
  toneClass: string;
};

const baseActivityTypes: ActivityType[] = [
  { key: "estudiar", label: "Estudiar", iconKey: "monkey-estudiar", color: "blue", group: "estudio", toneClass: "bg-[#E7F8FF]" },
  { key: "clases", label: "Clases", iconKey: "monkey-estudiar", color: "green", group: "estudio", toneClass: "bg-[#EAFBE7]" },
  { key: "tarea", label: "Tarea", iconKey: "monkey-estudiar", color: "orange", group: "proyecto", toneClass: "bg-[#FFF1E5]" },
  { key: "proyecto", label: "Proyecto", iconKey: "monkey-estudiar", color: "purple", group: "proyecto", toneClass: "bg-[#F0E8FF]" },
  { key: "banarse", label: "Bañarse", iconKey: "monkey-banarse", color: "blue", group: "rutina", toneClass: "bg-[#E7F8FF]" },
  { key: "beberagua", label: "Beber agua", iconKey: "monkey-beberagua", color: "blue", group: "salud", toneClass: "bg-[#DDF7F7]" },
  { key: "cepillarse", label: "Cepillarse", iconKey: "monkey-cepillarse", color: "green", group: "rutina", toneClass: "bg-[#EAFBE7]" },
  { key: "cuidado-personal", label: "Cuidado personal", iconKey: "monkey-cuidado-personal", color: "green", group: "rutina", toneClass: "bg-[#E8F8EF]" },
  { key: "desayuno", label: "Desayuno", iconKey: "monkey-desayuno", color: "yellow", group: "comida", toneClass: "bg-[#FFF7C2]" },
  { key: "despertar", label: "Despertar", iconKey: "monkey-despertar", color: "yellow", group: "rutina", toneClass: "bg-[#FFF7D6]" },
  { key: "comida", label: "Comida", iconKey: "monkey-comida", color: "pink", group: "comida", toneClass: "bg-[#FFE8EE]" },
  { key: "frutas", label: "Frutas", iconKey: "monkey-frutas", color: "pink", group: "comida", toneClass: "bg-[#FFE1E7]" },
  { key: "gym", label: "Gym", iconKey: "monkey-gym", color: "yellow", group: "salud", toneClass: "bg-[#FDF6BA]" },
  { key: "futbol", label: "Fútbol", iconKey: "monkey-futbol", color: "yellow", group: "salud", toneClass: "bg-[#FFF4BA]" },
  { key: "meditar", label: "Meditar", iconKey: "monkey-meditar", color: "purple", group: "salud", toneClass: "bg-[#EFE6FF]" },
  { key: "dormir", label: "Dormir", iconKey: "monkey-dormir", color: "purple", group: "descanso", toneClass: "bg-[#E8DEFF]" },
  { key: "leer", label: "Leer", iconKey: "monkey-leer", color: "blue", group: "estudio", toneClass: "bg-[#E7F8FF]" },
  { key: "musica", label: "Música", iconKey: "monkey-musica", color: "purple", group: "social", toneClass: "bg-[#F0E8FF]" },
  { key: "instrumento", label: "Instrumento", iconKey: "monkey-instrumento", color: "orange", group: "social", toneClass: "bg-[#FFE9D7]" },
  { key: "salida", label: "Salida", iconKey: "monkey-salida", color: "orange", group: "social", toneClass: "bg-[#FFF1E5]" },
  { key: "otro", label: "Otro", iconKey: "✨", color: "orange", group: "otro", toneClass: "bg-[#F3F4F6]" },
];

const legacyKeyAliases: Record<string, string> = {
  study: "estudiar",
  class: "clases",
  task: "tarea",
  project: "proyecto",
  exercise: "gym",
  food: "comida",
  fruit: "frutas",
  breakfast: "desayuno",
  water: "beberagua",
  health: "cuidado-personal",
  rest: "dormir",
  sleep: "dormir",
  meditation: "meditar",
  meditate: "meditar",
  shower: "banarse",
  brush: "cepillarse",
  wake_up: "despertar",
  cleaning: "cuidado-personal",
  reading: "leer",
  music: "musica",
  instrument: "instrumento",
  soccer: "futbol",
  meeting: "salida",
  out: "salida",
  cinema: "salida",
  fastfood: "comida",
  vacation: "salida",
  care: "cuidado-personal",
  other: "otro",
  "activity-study": "estudiar",
  "activity-gym": "gym",
  "activity-food": "comida",
  "activity-fruit": "frutas",
  "activity-breakfast": "desayuno",
  "activity-water": "beberagua",
  "activity-sleep": "dormir",
  "activity-meditate": "meditar",
  "activity-shower": "banarse",
  "activity-brush": "cepillarse",
  "activity-wakeup": "despertar",
  "activity-music": "musica",
  "activity-instrument": "instrumento",
  "activity-soccer": "futbol",
  "activity-out": "salida",
  "activity-care": "cuidado-personal",
  "calendar-study": "estudiar",
  "calendar-class": "clases",
  "calendar-task": "tarea",
  "calendar-project": "proyecto",
  "calendar-exercise": "gym",
  "calendar-food": "comida",
  "calendar-health": "cuidado-personal",
  "calendar-rest": "dormir",
  "calendar-meditation": "meditar",
  "calendar-cleaning": "cuidado-personal",
  "calendar-reading": "leer",
  "calendar-out": "salida",
  "calendar-cinema": "salida",
  "calendar-fastfood": "comida",
  "calendar-vacation": "salida",
};

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
  const normalized = legacyKeyAliases[key] ?? key;
  return ACTIVITY_TYPES.find((type) => type.key === normalized || type.iconKey === normalized) ?? ACTIVITY_TYPES[0];
}

export function inferActivityTypeFromIcon(iconKey?: string | null) {
  return getActivityTypeByKey(iconKey);
}

export function inferActivityTypeFromEvent(event: CalendarEvent) {
  if (event.activityTypeKey) return getActivityTypeByKey(event.activityTypeKey);
  if (event.iconKey) return inferActivityTypeFromIcon(event.iconKey);
  const lower = event.title.toLowerCase();
  const byLabel = ACTIVITY_TYPES.find((type) => lower.includes(type.label.toLowerCase()) || lower.includes(type.key.replace(/-/g, " ")));
  if (byLabel) return byLabel;
  return ACTIVITY_TYPES.find((type) => type.color === event.color) ?? ACTIVITY_TYPES[0];
}

export function activityTypeAssets(): AppAsset[] {
  return ACTIVITY_TYPES.map((type) => {
    const asset = getAssetByKey(type.iconKey) ?? activityAssetGallery.find((item) => item.key === type.iconKey);
    return {
      key: type.key,
      label: type.label,
      src: asset?.src ?? "/assets/activities/monkeys/despertar.png",
      category: asset?.category ?? "activity",
      group: type.group,
    };
  });
}

export function activityTypeToneClass(key?: string | null) {
  return getActivityTypeByKey(key).toneClass;
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
