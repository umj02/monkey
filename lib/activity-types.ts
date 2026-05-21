import type { CalendarEvent } from "@/types";
import { activityAssetGallery, getAssetByKey, type AppAsset } from "@/lib/asset-library";
import { ACTIVITY_CATEGORY_DEFINITIONS } from "@/lib/category-definitions";

export type ActivityType = {
  key: string;
  label: string;
  iconKey: string;
  color: CalendarEvent["color"];
  group: "rutina" | "estudio" | "salud" | "comida" | "proyecto" | "social" | "descanso" | "otro";
  toneClass: string;
};

const colorToneClass: Record<CalendarEvent["color"], string> = {
  yellow: "bg-[#FFF7C2]",
  blue: "bg-[#E7F8FF]",
  green: "bg-[#EAFBE7]",
  pink: "bg-[#FFE8EE]",
  purple: "bg-[#F0E8FF]",
  orange: "bg-[#FFF1E5]",
};

const legacyKeyAliases: Record<string, string> = {
  study: "estudiar",
  leer: "estudiar",
  lectura: "estudiar",
  estudio: "estudiar",
  class: "clases",
  task: "tarea",
  project: "proyecto",
  work: "trabajo",
  trabajo: "trabajo",
  exercise: "gym",
  gimnacio: "gym",
  food: "comida",
  dinner: "comida",
  fruit: "fruta",
  frutas: "fruta",
  breakfast: "desayuno",
  water: "beber",
  beberagua: "beber",
  health: "cuidado-personal",
  care: "cuidado-personal",
  rest: "dormir",
  sleep: "dormir",
  meditation: "meditacion",
  meditate: "meditacion",
  meditar: "meditacion",
  shower: "banarse",
  brush: "cepillarse",
  wake_up: "despertar",
  cleaning: "cuidado-personal",
  music: "escuchar-musica",
  musica: "escuchar-musica",
  instrument: "instrumento",
  soccer: "deporte",
  futbol: "deporte",
  meeting: "reunion",
  out: "salida",
  cinema: "television",
  fastfood: "comida",
  vacation: "salida",
  other: "otro",
  "activity-water": "beber",
  "activity-fruit": "fruta",
  "activity-soccer": "deporte",
  "activity-meditate": "meditacion",
  "activity-music": "escuchar-musica",
  "activity-sleep": "dormir",
  "activity-read": "estudiar",
  "activity-study": "estudiar",
  "activity-gym": "gym",
  "activity-food": "comida",
  "activity-breakfast": "desayuno",
  "activity-shower": "banarse",
  "activity-brush": "cepillarse",
  "activity-wakeup": "despertar",
  "activity-instrument": "instrumento",
  "activity-out": "salida",
  "activity-care": "cuidado-personal",
  "calendar-study": "estudiar",
  "calendar-reading": "estudiar",
  "calendar-class": "clases",
  "calendar-task": "tarea",
  "calendar-project": "proyecto",
  "calendar-exercise": "deporte",
  "calendar-food": "comida",
  "calendar-health": "tomar-medicamento",
  "calendar-rest": "dormir",
  "calendar-meditation": "meditacion",
  "calendar-cleaning": "cuidado-personal",
  "calendar-meeting": "reunion",
  "calendar-out": "salida",
  "calendar-cinema": "television",
  "calendar-fastfood": "comida",
  "calendar-vacation": "salida",
  "monkey-beberagua": "beber",
  "monkey-frutas": "fruta",
  "monkey-futbol": "deporte",
  "monkey-meditar": "meditacion",
  "monkey-musica": "escuchar-musica",
  "monkey-dormir": "dormir",
  "monkey-leer": "estudiar",
  "monkey-gym": "gym",
  "monkey-estudiar": "estudiar",
  "monkey-banarse": "banarse",
  "monkey-cepillarse": "cepillarse",
  "monkey-desayuno": "desayuno",
  "monkey-despertar": "despertar",
  "monkey-comida": "comida",
  "monkey-instrumento": "instrumento",
  "monkey-salida": "salida",
  "monkey-cuidado-personal": "cuidado-personal",
  "monkey-otro": "otro",
};

function normalizeActivityKey(key?: string | null) {
  if (!key) return "estudiar";
  if (key.startsWith("monito-")) return key.replace(/^monito-/, "");
  return legacyKeyAliases[key] ?? key;
}

export const ACTIVITY_TYPES: ActivityType[] = ACTIVITY_CATEGORY_DEFINITIONS.map((definition) => ({
  key: definition.key,
  label: definition.label,
  iconKey: definition.iconKey,
  color: (definition.color ?? "blue") as CalendarEvent["color"],
  group: (definition.group ?? "otro") as ActivityType["group"],
  toneClass: colorToneClass[(definition.color ?? "blue") as CalendarEvent["color"]],
}));

export function getActivityTypeByKey(key?: string | null) {
  const normalized = normalizeActivityKey(key);
  return ACTIVITY_TYPES.find((type) => type.key === normalized || type.iconKey === key || type.iconKey === normalized) ?? ACTIVITY_TYPES[0];
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
      src: asset?.src ?? "/assets/monitos/otro.png",
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
