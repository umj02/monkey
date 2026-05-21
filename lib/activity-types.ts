import { activityAssetGallery, getAssetByKey } from "@/lib/asset-library";
import type { CalendarEvent } from "@/types";

export type ActivityTypeKey = string;
export type ActivityColor = "blue" | "green" | "yellow" | "orange" | "purple" | "pink";

export type ActivityType = {
  key: ActivityTypeKey;
  label: string;
  iconKey: string;
  color: ActivityColor;
  group: "estudio" | "proyecto" | "rutina" | "salud" | "comida" | "descanso" | "social" | "movimiento" | "otro";
  toneClass: string;
};

export const ACTIVITY_TYPES: ActivityType[] = [
  { key: "estudiar", label: "Estudiar", iconKey: "monito-estudiar", color: "blue", group: "estudio", toneClass: "bg-[#E7F8FF]" },
  { key: "clases", label: "Clases", iconKey: "monito-clases", color: "green", group: "estudio", toneClass: "bg-[#EAFBE7]" },
  { key: "tarea", label: "Tarea", iconKey: "monito-tarea", color: "orange", group: "proyecto", toneClass: "bg-[#FFF1E5]" },
  { key: "proyecto", label: "Proyecto", iconKey: "monito-proyecto", color: "purple", group: "proyecto", toneClass: "bg-[#F0E8FF]" },
  { key: "trabajo", label: "Trabajo", iconKey: "monito-trabajo", color: "blue", group: "proyecto", toneClass: "bg-[#E7F8FF]" },
  { key: "banarse", label: "Bañarse", iconKey: "monito-banarse", color: "blue", group: "rutina", toneClass: "bg-[#E7F8FF]" },
  { key: "beber", label: "Beber", iconKey: "monito-beber", color: "blue", group: "salud", toneClass: "bg-[#DDF7F7]" },
  { key: "cepillarse", label: "Cepillarse", iconKey: "monito-cepillarse", color: "green", group: "rutina", toneClass: "bg-[#EAFBE7]" },
  { key: "cuidado-personal", label: "Cuidado personal", iconKey: "monito-cuidado-personal", color: "green", group: "rutina", toneClass: "bg-[#E8F8EF]" },
  { key: "desayuno", label: "Desayuno", iconKey: "monito-desayuno", color: "yellow", group: "comida", toneClass: "bg-[#FFF7C2]" },
  { key: "despertar", label: "Despertar", iconKey: "monito-despertar", color: "yellow", group: "rutina", toneClass: "bg-[#FFF7D6]" },
  { key: "comida", label: "Comida", iconKey: "monito-comida", color: "pink", group: "comida", toneClass: "bg-[#FFE8EE]" },
  { key: "fruta", label: "Fruta", iconKey: "monito-fruta", color: "pink", group: "comida", toneClass: "bg-[#FFE1E7]" },
  { key: "gym", label: "Gym", iconKey: "monito-gym", color: "yellow", group: "salud", toneClass: "bg-[#FDF6BA]" },
  { key: "deporte", label: "Deporte", iconKey: "monito-deporte", color: "yellow", group: "salud", toneClass: "bg-[#FFF4BA]" },
  { key: "meditacion", label: "Meditación", iconKey: "monito-meditacion", color: "purple", group: "salud", toneClass: "bg-[#EFE6FF]" },
  { key: "dormir", label: "Dormir", iconKey: "monito-dormir", color: "purple", group: "descanso", toneClass: "bg-[#E8DEFF]" },
  { key: "escuchar-musica", label: "Escuchar música", iconKey: "monito-escuchar-musica", color: "purple", group: "social", toneClass: "bg-[#F0E8FF]" },
  { key: "instrumento", label: "Instrumento", iconKey: "monito-instrumento", color: "orange", group: "social", toneClass: "bg-[#FFE9D7]" },
  { key: "salida", label: "Salida", iconKey: "monito-salida", color: "orange", group: "social", toneClass: "bg-[#FFF1E5]" },
  { key: "correr", label: "Correr", iconKey: "monito-correr", color: "yellow", group: "salud", toneClass: "bg-[#FDF6BA]" },
  { key: "tomar-medicamento", label: "Tomar medicamento", iconKey: "monito-tomar-medicamento", color: "green", group: "salud", toneClass: "bg-[#E8F8EF]" },
  { key: "caminar", label: "Caminar", iconKey: "monito-caminar", color: "green", group: "movimiento", toneClass: "bg-[#EAFBE7]" },
  { key: "salida-rapida", label: "Salida rápida", iconKey: "monito-salida-rapida", color: "orange", group: "movimiento", toneClass: "bg-[#FFF1E5]" },
  { key: "salida-vehiculo", label: "Salida en vehículo", iconKey: "monito-salida-vehiculo", color: "orange", group: "movimiento", toneClass: "bg-[#FFF1E5]" },
  { key: "reunion", label: "Reunión", iconKey: "monito-reunion", color: "blue", group: "social", toneClass: "bg-[#E7F8FF]" },
  { key: "pago", label: "Pago", iconKey: "monito-pago", color: "green", group: "otro", toneClass: "bg-[#E8F8EF]" },
  { key: "television", label: "Televisión", iconKey: "monito-television", color: "purple", group: "descanso", toneClass: "bg-[#F0E8FF]" },
  { key: "otro", label: "Otro", iconKey: "monito-otro", color: "orange", group: "otro", toneClass: "bg-[#FFF1E5]" },
];

const legacyActivityAliases: Record<string, string> = {
  beberagua: "beber", frutas: "fruta", fruit: "fruta", futbol: "deporte", soccer: "deporte", meditar: "meditacion", musica: "escuchar-musica", sleep: "dormir", study: "estudiar", leer: "estudiar", gimnacio: "gym",
};

export function normalizeActivityTypeKey(value?: string | null) {
  if (!value) return "estudiar";
  let normalized = value.replace(/^monito-/, "").replace(/^monkey-/, "").replace(/^activity-/, "").replace(/^calendar-/, "").replace(/^quick-/, "");
  normalized = legacyActivityAliases[normalized] ?? normalized;
  return normalized;
}

export function getActivityTypeByKey(key?: string | null) {
  const normalized = normalizeActivityTypeKey(key);
  return ACTIVITY_TYPES.find((type) => type.key === normalized || type.iconKey === key) ?? ACTIVITY_TYPES.find((type) => type.key === "otro") ?? ACTIVITY_TYPES[0];
}

export function inferActivityTypeFromIcon(iconKey?: string | null) {
  return getActivityTypeByKey(iconKey);
}

export function inferActivityTypeFromEvent(event: Pick<CalendarEvent, "title"> & { iconKey?: string | null; activityTypeKey?: string | null }) {
  if (event.activityTypeKey) return getActivityTypeByKey(event.activityTypeKey);
  if (event.iconKey) return inferActivityTypeFromIcon(event.iconKey);
  const title = event.title.toLowerCase();
  return ACTIVITY_TYPES.find((type) => title.includes(type.label.toLowerCase()) || title.includes(type.key.replace(/-/g, " "))) ?? ACTIVITY_TYPES[0];
}

export const activityTypeAssets = ACTIVITY_TYPES.map((type) => {
  const asset = getAssetByKey(type.iconKey) ?? activityAssetGallery.find((item) => item.key === type.iconKey);
  return { ...type, assetSrc: asset?.src ?? "/assets/monitos/estudiar.png" };
});

export function activityTypeToneClass(type?: ActivityType | null) {
  return type?.toneClass ?? "bg-[#E7F8FF]";
}

export function activityTypePillClass(type?: ActivityType | ActivityColor | null) {
  const color = typeof type === "string" ? type : type?.color ?? "green";
  return {
    blue: "bg-blue-50 text-blue-700",
    green: "bg-green-50 text-monkey-greenDark",
    yellow: "bg-yellow-50 text-orange-700",
    orange: "bg-orange-50 text-orange-700",
    purple: "bg-purple-50 text-monkey-purple",
    pink: "bg-pink-50 text-monkey-pink",
  }[color];
}
