import type { CalendarEvent } from "@/types";

export type CategoryScope = "activity" | "wallet_expense" | "wallet_icon";

export type CategoryDefinition = {
  key: string;
  label: string;
  iconKey: string;
  scope: CategoryScope;
  group?: string;
  color?: CalendarEvent["color"] | "green" | "orange" | "blue" | "yellow" | "pink" | "purple";
  isBase?: boolean;
};

export const ACTIVITY_CATEGORY_DEFINITIONS: CategoryDefinition[] = [
  { key: "estudiar", label: "Estudiar", iconKey: "monito-estudiar", scope: "activity", group: "estudio", color: "blue", isBase: true },
  { key: "clases", label: "Clases", iconKey: "monito-clases", scope: "activity", group: "estudio", color: "green", isBase: true },
  { key: "tarea", label: "Tarea", iconKey: "monito-tarea", scope: "activity", group: "proyecto", color: "orange", isBase: true },
  { key: "proyecto", label: "Proyecto", iconKey: "monito-proyecto", scope: "activity", group: "proyecto", color: "purple", isBase: true },
  { key: "trabajo", label: "Trabajo", iconKey: "monito-trabajo", scope: "activity", group: "proyecto", color: "green", isBase: true },
  { key: "banarse", label: "Bañarse", iconKey: "monito-banarse", scope: "activity", group: "rutina", color: "blue", isBase: true },
  { key: "beber", label: "Beber", iconKey: "monito-beber", scope: "activity", group: "salud", color: "blue", isBase: true },
  { key: "cepillarse", label: "Cepillarse", iconKey: "monito-cepillarse", scope: "activity", group: "rutina", color: "green", isBase: true },
  { key: "cuidado-personal", label: "Cuidado personal", iconKey: "monito-cuidado-personal", scope: "activity", group: "rutina", color: "green", isBase: true },
  { key: "desayuno", label: "Desayuno", iconKey: "monito-desayuno", scope: "activity", group: "comida", color: "yellow", isBase: true },
  { key: "despertar", label: "Despertar", iconKey: "monito-despertar", scope: "activity", group: "rutina", color: "yellow", isBase: true },
  { key: "comida", label: "Comida", iconKey: "monito-comida", scope: "activity", group: "comida", color: "pink", isBase: true },
  { key: "fruta", label: "Fruta", iconKey: "monito-fruta", scope: "activity", group: "comida", color: "pink", isBase: true },
  { key: "gym", label: "Gym", iconKey: "monito-gym", scope: "activity", group: "salud", color: "yellow", isBase: true },
  { key: "deporte", label: "Deporte", iconKey: "monito-deporte", scope: "activity", group: "salud", color: "yellow", isBase: true },
  { key: "meditacion", label: "Meditación", iconKey: "monito-meditacion", scope: "activity", group: "salud", color: "purple", isBase: true },
  { key: "dormir", label: "Dormir", iconKey: "monito-dormir", scope: "activity", group: "descanso", color: "purple", isBase: true },
  { key: "escuchar-musica", label: "Escuchar música", iconKey: "monito-escuchar-musica", scope: "activity", group: "social", color: "purple", isBase: true },
  { key: "instrumento", label: "Instrumento", iconKey: "monito-instrumento", scope: "activity", group: "social", color: "orange", isBase: true },
  { key: "salida", label: "Salida", iconKey: "monito-salida", scope: "activity", group: "social", color: "orange", isBase: true },
  { key: "correr", label: "Correr", iconKey: "monito-correr", scope: "activity", group: "salud", color: "yellow", isBase: true },
  { key: "tomar-medicamento", label: "Tomar medicamento", iconKey: "monito-tomar-medicamento", scope: "activity", group: "salud", color: "green", isBase: true },
  { key: "caminar", label: "Caminar", iconKey: "monito-caminar", scope: "activity", group: "salud", color: "yellow", isBase: true },
  { key: "salida-rapida", label: "Salida rápida", iconKey: "monito-salida-rapida", scope: "activity", group: "social", color: "orange", isBase: true },
  { key: "salida-vehiculo", label: "Salida en vehículo", iconKey: "monito-salida-vehiculo", scope: "activity", group: "social", color: "orange", isBase: true },
  { key: "reunion", label: "Reunión", iconKey: "monito-reunion", scope: "activity", group: "social", color: "blue", isBase: true },
  { key: "pago", label: "Pago", iconKey: "monito-pago", scope: "activity", group: "otro", color: "green", isBase: true },
  { key: "television", label: "Televisión", iconKey: "monito-television", scope: "activity", group: "descanso", color: "purple", isBase: true },
  { key: "otro", label: "Otro", iconKey: "monito-otro", scope: "activity", group: "otro", color: "orange", isBase: true },
];

export const WALLET_EXPENSE_CATEGORY_DEFINITIONS: CategoryDefinition[] = [
  { key: "comida", label: "Comida", iconKey: "wallet-comida", scope: "wallet_expense", color: "orange", isBase: true },
  { key: "transporte", label: "Transporte", iconKey: "wallet-transporte", scope: "wallet_expense", color: "yellow", isBase: true },
  { key: "entretenimiento", label: "Entretenimiento", iconKey: "wallet-entretenimiento", scope: "wallet_expense", color: "purple", isBase: true },
  { key: "compras", label: "Compras", iconKey: "wallet-compras", scope: "wallet_expense", color: "pink", isBase: true },
  { key: "escuela", label: "Escuela", iconKey: "wallet-escuela", scope: "wallet_expense", color: "blue", isBase: true },
  { key: "cafe", label: "Café", iconKey: "wallet-cafe", scope: "wallet_expense", color: "orange", isBase: true },
  { key: "uber", label: "Uber", iconKey: "wallet-uber", scope: "wallet_expense", color: "yellow", isBase: true },
  { key: "pagos", label: "Pagos", iconKey: "wallet-pagos", scope: "wallet_expense", color: "green", isBase: true },
  { key: "alquiler", label: "Alquiler", iconKey: "wallet-alquiler", scope: "wallet_expense", color: "blue", isBase: true },
  { key: "cuidado-personal", label: "Cuidado personal", iconKey: "wallet-cuidado-personal", scope: "wallet_expense", color: "green", isBase: true },
  { key: "buses", label: "Buses", iconKey: "wallet-buses", scope: "wallet_expense", color: "yellow", isBase: true },
  { key: "vehiculo", label: "Vehículo", iconKey: "wallet-vehiculo", scope: "wallet_expense", color: "yellow", isBase: true },
];

export const WALLET_ICON_DEFINITIONS: CategoryDefinition[] = [
  { key: "luz", label: "Luz", iconKey: "wallet-luz", scope: "wallet_icon", isBase: true },
  { key: "agua", label: "Agua", iconKey: "wallet-agua", scope: "wallet_icon", isBase: true },
  { key: "telefono", label: "Teléfono", iconKey: "wallet-telefono", scope: "wallet_icon", isBase: true },
  { key: "internet", label: "Internet", iconKey: "wallet-internet", scope: "wallet_icon", isBase: true },
  { key: "combustible", label: "Combustible", iconKey: "wallet-combustible", scope: "wallet_icon", isBase: true },
  { key: "prestamos", label: "Préstamos", iconKey: "wallet-prestamos", scope: "wallet_icon", isBase: true },
  { key: "medicina", label: "Medicina", iconKey: "wallet-medicina", scope: "wallet_icon", isBase: true },
  { key: "dentista", label: "Dentista", iconKey: "wallet-dentista", scope: "wallet_icon", isBase: true },
  { key: "optica", label: "Óptica", iconKey: "wallet-optica", scope: "wallet_icon", isBase: true },
  { key: "tarjetas-credito", label: "Tarjetas de crédito", iconKey: "wallet-tarjetas-credito", scope: "wallet_icon", isBase: true },
  { key: "viaje", label: "Viaje", iconKey: "wallet-viaje", scope: "wallet_icon", isBase: true },
  { key: "gasto-hormiga", label: "Gasto hormiga", iconKey: "wallet-gasto-hormiga", scope: "wallet_icon", isBase: true },
];

export const BASE_CATEGORY_DEFINITIONS = [
  ...ACTIVITY_CATEGORY_DEFINITIONS,
  ...WALLET_EXPENSE_CATEGORY_DEFINITIONS,
  ...WALLET_ICON_DEFINITIONS,
];

export function categoryLabelFromKey(key: string) {
  return key.replace(/^custom:/, "").split("-").filter(Boolean).map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");
}
