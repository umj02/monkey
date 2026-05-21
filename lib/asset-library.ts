export type AppAsset = {
  key: string;
  label: string;
  src: string;
  category: "intro" | "hero" | "face" | "wallet" | "activity" | "calendar" | "onboarding";
  group?: "income" | "expense" | "saving" | "movement" | string;
};

export const onboardingAssets: AppAsset[] = [
  { key: "onboarding-today", label: "Tu día", src: "/assets/onboarding/tu-dia-01.png", category: "onboarding" },
  { key: "onboarding-activities", label: "Actividades", src: "/assets/onboarding/actividades-02.png", category: "onboarding" },
  { key: "onboarding-calendar", label: "Calendario", src: "/assets/onboarding/calendario-03.png", category: "onboarding" },
  { key: "onboarding-alerts", label: "Alertas", src: "/assets/onboarding/alertas-04.png", category: "onboarding" },
  { key: "onboarding-progress", label: "Avances", src: "/assets/onboarding/avances-05.png", category: "onboarding" },
  { key: "onboarding-wallet", label: "Wallet", src: "/assets/onboarding/wallet-06.png", category: "onboarding" },
  { key: "onboarding-medals", label: "Medallas", src: "/assets/onboarding/medallas-07.png", category: "onboarding" },
  { key: "onboarding-finish", label: "Lograste", src: "/assets/onboarding/lograste-08.png", category: "onboarding" },
];

export const introAssets: AppAsset[] = [
  { key: "monkey-intro-check", label: "Mono check", src: "/assets/monkey/intro/check.png", category: "intro" },
  { key: "monkey-intro-rapero", label: "Mono rapero", src: "/assets/monkey/intro/rapero.png", category: "intro" },
  { key: "monkey-intro-sentado", label: "Mono sentado", src: "/assets/monkey/intro/sentado.png", category: "intro" },
];

export const heroAssets: AppAsset[] = [
  { key: "monkey-hero-sentado", label: "Mono hero", src: "/assets/monkey/hero/sentado.png", category: "hero" },
  { key: "monkey-hero-full", label: "Mono completo", src: "/assets/monkey/hero/full-original.png", category: "hero" },
];

export const faceAssets: AppAsset[] = [
  { key: "monkey-face-main", label: "Cara principal", src: "/assets/monkey/faces/face-main.png", category: "face" },
  { key: "monkey-face-alt", label: "Cara alternativa", src: "/assets/monkey/faces/face-alt.png", category: "face" },
];

export const todayQuickAssets: AppAsset[] = [
  { key: "quick-meditar", label: "Meditar", src: "/assets/monitos/meditacion.png", category: "activity", group: "quick" },
  { key: "quick-despertar", label: "Despertar", src: "/assets/monitos/despertar.png", category: "activity", group: "quick" },
  { key: "quick-banarse", label: "Bañarse", src: "/assets/monitos/banarse.png", category: "activity", group: "quick" },
  { key: "quick-desayuno", label: "Desayuno", src: "/assets/monitos/desayuno.png", category: "activity", group: "quick" },
  { key: "quick-cepillarse", label: "Cepillarse", src: "/assets/monitos/cepillarse.png", category: "activity", group: "quick" },
];

export const activityAssets: AppAsset[] = [
  { key: "monito-estudiar", label: "Estudiar", src: "/assets/monitos/estudiar.png", category: "activity", group: "activity" },
  { key: "monito-clases", label: "Clases", src: "/assets/monitos/clases.png", category: "activity", group: "activity" },
  { key: "monito-tarea", label: "Tarea", src: "/assets/monitos/tarea.png", category: "activity", group: "activity" },
  { key: "monito-proyecto", label: "Proyecto", src: "/assets/monitos/proyecto.png", category: "activity", group: "activity" },
  { key: "monito-trabajo", label: "Trabajo", src: "/assets/monitos/trabajo.png", category: "activity", group: "activity" },
  { key: "monito-banarse", label: "Bañarse", src: "/assets/monitos/banarse.png", category: "activity", group: "activity" },
  { key: "monito-beber", label: "Beber", src: "/assets/monitos/beber.png", category: "activity", group: "activity" },
  { key: "monito-cepillarse", label: "Cepillarse", src: "/assets/monitos/cepillarse.png", category: "activity", group: "activity" },
  { key: "monito-cuidado-personal", label: "Cuidado personal", src: "/assets/monitos/cuidado-personal.png", category: "activity", group: "activity" },
  { key: "monito-desayuno", label: "Desayuno", src: "/assets/monitos/desayuno.png", category: "activity", group: "activity" },
  { key: "monito-despertar", label: "Despertar", src: "/assets/monitos/despertar.png", category: "activity", group: "activity" },
  { key: "monito-comida", label: "Comida", src: "/assets/monitos/comida.png", category: "activity", group: "activity" },
  { key: "monito-fruta", label: "Fruta", src: "/assets/monitos/fruta.png", category: "activity", group: "activity" },
  { key: "monito-gym", label: "Gym", src: "/assets/monitos/gym.png", category: "activity", group: "activity" },
  { key: "monito-deporte", label: "Deporte", src: "/assets/monitos/deporte.png", category: "activity", group: "activity" },
  { key: "monito-meditacion", label: "Meditación", src: "/assets/monitos/meditacion.png", category: "activity", group: "activity" },
  { key: "monito-dormir", label: "Dormir", src: "/assets/monitos/dormir.png", category: "activity", group: "activity" },
  { key: "monito-escuchar-musica", label: "Escuchar música", src: "/assets/monitos/escuchar-musica.png", category: "activity", group: "activity" },
  { key: "monito-instrumento", label: "Instrumento", src: "/assets/monitos/instrumento.png", category: "activity", group: "activity" },
  { key: "monito-salida", label: "Salida", src: "/assets/monitos/salida.png", category: "activity", group: "activity" },
  { key: "monito-correr", label: "Correr", src: "/assets/monitos/correr.png", category: "activity", group: "activity" },
  { key: "monito-tomar-medicamento", label: "Tomar medicamento", src: "/assets/monitos/tomar-medicamento.png", category: "activity", group: "activity" },
  { key: "monito-caminar", label: "Caminar", src: "/assets/monitos/caminar.png", category: "activity", group: "activity" },
  { key: "monito-salida-rapida", label: "Salida rápida", src: "/assets/monitos/salida-rapida.png", category: "activity", group: "activity" },
  { key: "monito-salida-vehiculo", label: "Salida en vehículo", src: "/assets/monitos/salida-vehiculo.png", category: "activity", group: "activity" },
  { key: "monito-reunion", label: "Reunión", src: "/assets/monitos/reunion.png", category: "activity", group: "activity" },
  { key: "monito-pago", label: "Pago", src: "/assets/monitos/pago.png", category: "activity", group: "activity" },
  { key: "monito-television", label: "Televisión", src: "/assets/monitos/television.png", category: "activity", group: "activity" },
  { key: "monito-otro", label: "Otro", src: "/assets/monitos/otro.png", category: "activity", group: "activity" }
];

export const calendarActivityAssets = activityAssets;
export const monkeyActivityAssets = activityAssets;

export const legacyActivityAssets: AppAsset[] = [
  { key: "monkey-estudiar", label: "Estudiar", src: "/assets/monitos/estudiar.png", category: "activity", group: "legacy" },
  { key: "activity-study", label: "Estudiar", src: "/assets/monitos/estudiar.png", category: "activity", group: "legacy" },
  { key: "calendar-study", label: "Estudiar", src: "/assets/monitos/estudiar.png", category: "activity", group: "legacy" },
  { key: "activity-leer", label: "Estudiar", src: "/assets/monitos/estudiar.png", category: "activity", group: "legacy" },
  { key: "monkey-leer", label: "Estudiar", src: "/assets/monitos/estudiar.png", category: "activity", group: "legacy" },
  { key: "activity-estudio", label: "Estudiar", src: "/assets/monitos/estudiar.png", category: "activity", group: "legacy" },
  { key: "calendar-estudio", label: "Estudiar", src: "/assets/monitos/estudiar.png", category: "activity", group: "legacy" },
  { key: "monkey-clases", label: "Clases", src: "/assets/monitos/clases.png", category: "activity", group: "legacy" },
  { key: "calendar-clases", label: "Clases", src: "/assets/monitos/clases.png", category: "activity", group: "legacy" },
  { key: "monkey-tarea", label: "Tarea", src: "/assets/monitos/tarea.png", category: "activity", group: "legacy" },
  { key: "calendar-tarea", label: "Tarea", src: "/assets/monitos/tarea.png", category: "activity", group: "legacy" },
  { key: "monkey-proyecto", label: "Proyecto", src: "/assets/monitos/proyecto.png", category: "activity", group: "legacy" },
  { key: "calendar-proyecto", label: "Proyecto", src: "/assets/monitos/proyecto.png", category: "activity", group: "legacy" },
  { key: "monkey-banarse", label: "Bañarse", src: "/assets/monitos/banarse.png", category: "activity", group: "legacy" },
  { key: "activity-banarse", label: "Bañarse", src: "/assets/monitos/banarse.png", category: "activity", group: "legacy" },
  { key: "quick-banarse", label: "Bañarse", src: "/assets/monitos/banarse.png", category: "activity", group: "legacy" },
  { key: "monkey-beberagua", label: "Beber", src: "/assets/monitos/beber.png", category: "activity", group: "legacy" },
  { key: "activity-beberagua", label: "Beber", src: "/assets/monitos/beber.png", category: "activity", group: "legacy" },
  { key: "monkey-beber", label: "Beber", src: "/assets/monitos/beber.png", category: "activity", group: "legacy" },
  { key: "monkey-cepillarse", label: "Cepillarse", src: "/assets/monitos/cepillarse.png", category: "activity", group: "legacy" },
  { key: "activity-cepillarse", label: "Cepillarse", src: "/assets/monitos/cepillarse.png", category: "activity", group: "legacy" },
  { key: "quick-cepillarse", label: "Cepillarse", src: "/assets/monitos/cepillarse.png", category: "activity", group: "legacy" },
  { key: "monkey-cuidado-personal", label: "Cuidado personal", src: "/assets/monitos/cuidado-personal.png", category: "activity", group: "legacy" },
  { key: "activity-cuidado-personal", label: "Cuidado personal", src: "/assets/monitos/cuidado-personal.png", category: "activity", group: "legacy" },
  { key: "monkey-desayuno", label: "Desayuno", src: "/assets/monitos/desayuno.png", category: "activity", group: "legacy" },
  { key: "activity-desayuno", label: "Desayuno", src: "/assets/monitos/desayuno.png", category: "activity", group: "legacy" },
  { key: "quick-desayuno", label: "Desayuno", src: "/assets/monitos/desayuno.png", category: "activity", group: "legacy" },
  { key: "monkey-despertar", label: "Despertar", src: "/assets/monitos/despertar.png", category: "activity", group: "legacy" },
  { key: "activity-despertar", label: "Despertar", src: "/assets/monitos/despertar.png", category: "activity", group: "legacy" },
  { key: "quick-despertar", label: "Despertar", src: "/assets/monitos/despertar.png", category: "activity", group: "legacy" },
  { key: "monkey-comida", label: "Comida", src: "/assets/monitos/comida.png", category: "activity", group: "legacy" },
  { key: "activity-dinner", label: "Comida", src: "/assets/monitos/comida.png", category: "activity", group: "legacy" },
  { key: "calendar-comida", label: "Comida", src: "/assets/monitos/comida.png", category: "activity", group: "legacy" },
  { key: "monkey-frutas", label: "Fruta", src: "/assets/monitos/fruta.png", category: "activity", group: "legacy" },
  { key: "monkey-fruit", label: "Fruta", src: "/assets/monitos/fruta.png", category: "activity", group: "legacy" },
  { key: "activity-fruit", label: "Fruta", src: "/assets/monitos/fruta.png", category: "activity", group: "legacy" },
  { key: "monkey-gym", label: "Gym", src: "/assets/monitos/gym.png", category: "activity", group: "legacy" },
  { key: "monkey-gimnacio", label: "Gym", src: "/assets/monitos/gym.png", category: "activity", group: "legacy" },
  { key: "activity-gimnacio", label: "Gym", src: "/assets/monitos/gym.png", category: "activity", group: "legacy" },
  { key: "monkey-futbol", label: "Deporte", src: "/assets/monitos/deporte.png", category: "activity", group: "legacy" },
  { key: "monkey-soccer", label: "Deporte", src: "/assets/monitos/deporte.png", category: "activity", group: "legacy" },
  { key: "activity-soccer", label: "Deporte", src: "/assets/monitos/deporte.png", category: "activity", group: "legacy" },
  { key: "monkey-meditar", label: "Meditación", src: "/assets/monitos/meditacion.png", category: "activity", group: "legacy" },
  { key: "activity-meditar", label: "Meditación", src: "/assets/monitos/meditacion.png", category: "activity", group: "legacy" },
  { key: "quick-meditar", label: "Meditación", src: "/assets/monitos/meditacion.png", category: "activity", group: "legacy" },
  { key: "monkey-dormir", label: "Dormir", src: "/assets/monitos/dormir.png", category: "activity", group: "legacy" },
  { key: "monkey-sleep", label: "Dormir", src: "/assets/monitos/dormir.png", category: "activity", group: "legacy" },
  { key: "activity-sleep", label: "Dormir", src: "/assets/monitos/dormir.png", category: "activity", group: "legacy" },
  { key: "monkey-musica", label: "Escuchar música", src: "/assets/monitos/escuchar-musica.png", category: "activity", group: "legacy" },
  { key: "activity-musica", label: "Escuchar música", src: "/assets/monitos/escuchar-musica.png", category: "activity", group: "legacy" },
  { key: "monkey-instrumento", label: "Instrumento", src: "/assets/monitos/instrumento.png", category: "activity", group: "legacy" },
  { key: "activity-instrumento", label: "Instrumento", src: "/assets/monitos/instrumento.png", category: "activity", group: "legacy" },
  { key: "monkey-salida", label: "Salida", src: "/assets/monitos/salida.png", category: "activity", group: "legacy" },
  { key: "activity-salida", label: "Salida", src: "/assets/monitos/salida.png", category: "activity", group: "legacy" },
  { key: "calendar-salida", label: "Salida", src: "/assets/monitos/salida.png", category: "activity", group: "legacy" },
  { key: "monkey-reunion", label: "Reunión", src: "/assets/monitos/reunion.png", category: "activity", group: "legacy" },
  { key: "calendar-reunion", label: "Reunión", src: "/assets/monitos/reunion.png", category: "activity", group: "legacy" },
  { key: "monkey-otro", label: "Otro", src: "/assets/monitos/otro.png", category: "activity", group: "legacy" },
  { key: "activity-otro", label: "Otro", src: "/assets/monitos/otro.png", category: "activity", group: "legacy" }
];

export const walletAssets: AppAsset[] = [
  { key: "wallet-income", label: "Ingresos", src: "/assets/icons/ingresos.png", category: "wallet", group: "income" },
  { key: "wallet-savings", label: "Ahorros", src: "/assets/icons/ahorros.png", category: "wallet", group: "income" },
  { key: "wallet-extras", label: "Extras", src: "/assets/icons/extras.png", category: "wallet", group: "income" },
  { key: "wallet-ropa", label: "Ropa", src: "/assets/icons/ropa.png", category: "wallet", group: "saving" },
  { key: "wallet-zapatos", label: "Zapatos", src: "/assets/icons/zapatos.png", category: "wallet", group: "saving" },
  { key: "wallet-laptop-goal", label: "Laptop", src: "/assets/icons/laptop.png", category: "wallet", group: "saving" },
  { key: "wallet-comida", label: "Comida", src: "/assets/icons/comida.png", category: "wallet", group: "expense" },
  { key: "wallet-transporte", label: "Transporte", src: "/assets/icons/transporte.png", category: "wallet", group: "expense" },
  { key: "wallet-entretenimiento", label: "Entretenimiento", src: "/assets/icons/entretenimiento.png", category: "wallet", group: "expense" },
  { key: "wallet-compras", label: "Compras", src: "/assets/icons/compras.png", category: "wallet", group: "expense" },
  { key: "wallet-escuela", label: "Escuela", src: "/assets/icons/escuela.png", category: "wallet", group: "expense" },
  { key: "wallet-cafe", label: "Café", src: "/assets/icons/cafe.png", category: "wallet", group: "expense" },
  { key: "wallet-uber", label: "Uber", src: "/assets/icons/uber.png", category: "wallet", group: "expense" },
  { key: "wallet-pagos", label: "Pagos", src: "/assets/icons/pagos.png", category: "wallet", group: "expense" },
  { key: "wallet-alquiler", label: "Alquiler", src: "/assets/icons/alquiler.png", category: "wallet", group: "expense" },
  { key: "wallet-cuidado-personal", label: "Cuidado personal", src: "/assets/icons/cuidado-personal.png", category: "wallet", group: "expense" },
  { key: "wallet-buses", label: "Buses", src: "/assets/icons/buses.png", category: "wallet", group: "expense" },
  { key: "wallet-vehiculo", label: "Vehículo", src: "/assets/icons/vehiculo.png", category: "wallet", group: "expense" },
  { key: "wallet-regalo", label: "Regalo", src: "/assets/icons/regalo.png", category: "wallet", group: "expense" },
  { key: "wallet-otro", label: "Otro", src: "/assets/icons/otro.png", category: "wallet", group: "expense" },
  { key: "wallet-luz", label: "Luz", src: "/assets/icons/luz.png", category: "wallet", group: "movement" },
  { key: "wallet-agua", label: "Agua", src: "/assets/icons/agua.png", category: "wallet", group: "movement" },
  { key: "wallet-telefono", label: "Teléfono", src: "/assets/icons/telefono.png", category: "wallet", group: "movement" },
  { key: "wallet-internet", label: "Internet", src: "/assets/icons/internet.png", category: "wallet", group: "movement" },
  { key: "wallet-combustible", label: "Combustible", src: "/assets/icons/combustible.png", category: "wallet", group: "movement" },
  { key: "wallet-prestamos", label: "Prestamos", src: "/assets/icons/prestamos.png", category: "wallet", group: "movement" },
  { key: "wallet-medicina", label: "Medicina", src: "/assets/icons/medicina.png", category: "wallet", group: "movement" },
  { key: "wallet-dentista", label: "Dentista", src: "/assets/icons/dentista.png", category: "wallet", group: "movement" },
  { key: "wallet-optica", label: "Optica", src: "/assets/icons/optica.png", category: "wallet", group: "movement" },
  { key: "wallet-tarjetas-credito", label: "Tarjetas de Crédito", src: "/assets/icons/tarjetas-credito.png", category: "wallet", group: "movement" },
  { key: "wallet-viaje", label: "Viaje", src: "/assets/icons/viaje.png", category: "wallet", group: "movement" },
  { key: "wallet-gasto-hormiga", label: "Gasto Hormiga", src: "/assets/icons/gasto-hormiga.png", category: "wallet", group: "movement" },
  { key: "wallet-food", label: "Comida", src: "/assets/icons/comida.png", category: "wallet", group: "expense" },
  { key: "wallet-burger", label: "Comida", src: "/assets/icons/comida.png", category: "wallet", group: "expense" },
  { key: "wallet-transport", label: "Transporte", src: "/assets/icons/transporte.png", category: "wallet", group: "expense" },
  { key: "wallet-train", label: "Buses", src: "/assets/icons/buses.png", category: "wallet", group: "expense" },
  { key: "wallet-study", label: "Escuela", src: "/assets/icons/escuela.png", category: "wallet", group: "expense" },
  { key: "wallet-coffee", label: "Café", src: "/assets/icons/cafe.png", category: "wallet", group: "expense" },
  { key: "wallet-shop", label: "Compras", src: "/assets/icons/compras.png", category: "wallet", group: "expense" },
  { key: "wallet-care", label: "Cuidado personal", src: "/assets/icons/cuidado-personal.png", category: "wallet", group: "expense" },
  { key: "wallet-fun", label: "Entretenimiento", src: "/assets/icons/entretenimiento.png", category: "wallet", group: "expense" },
  { key: "wallet-phone", label: "Telefono", src: "/assets/icons/telefono.png", category: "wallet", group: "expense" },
  { key: "wallet-gas", label: "Combustible", src: "/assets/icons/combustible.png", category: "wallet", group: "expense" },
  { key: "wallet-gift", label: "Regalo", src: "/assets/icons/regalo.png", category: "wallet", group: "expense" },
  { key: "wallet-materials", label: "Pagos", src: "/assets/icons/pagos.png", category: "wallet", group: "expense" },
  { key: "wallet-super", label: "Comida", src: "/assets/icons/comida.png", category: "wallet", group: "expense" },
  { key: "wallet-cinema", label: "Entretenimiento", src: "/assets/icons/entretenimiento.png", category: "wallet", group: "expense" },
  { key: "wallet-healthy", label: "Medicina", src: "/assets/icons/medicina.png", category: "wallet", group: "expense" },
  { key: "wallet-laptop", label: "Internet", src: "/assets/icons/internet.png", category: "wallet", group: "expense" },
  { key: "wallet-clothes", label: "Ropa", src: "/assets/icons/ropa.png", category: "wallet", group: "expense" },
  { key: "wallet-shoes", label: "Zapatos", src: "/assets/icons/zapatos.png", category: "wallet", group: "expense" },
  { key: "wallet-trip", label: "Viaje", src: "/assets/icons/viaje.png", category: "wallet", group: "expense" },
  { key: "wallet-sports", label: "Deportes", src: "/assets/icons/deportes.png", category: "wallet", group: "expense" },
  { key: "wallet-gym", label: "Gym", src: "/assets/icons/gym.png", category: "wallet", group: "expense" },
  { key: "wallet-drinks", label: "Agua", src: "/assets/icons/agua.png", category: "wallet", group: "expense" }
];

export const activityAssetGallery = [...activityAssets];

export const appAssets = [
  ...onboardingAssets,
  ...introAssets,
  ...heroAssets,
  ...faceAssets,
  ...todayQuickAssets,
  ...activityAssets,
  ...legacyActivityAssets,
  ...walletAssets,
];

export const assetsByCategory = appAssets.reduce<Record<string, AppAsset[]>>((acc, asset) => {
  if (!acc[asset.category]) acc[asset.category] = [];
  acc[asset.category].push(asset);
  return acc;
}, {});

export function getAssetByKey(key?: string | null) {
  if (!key) return undefined;
  return appAssets.find((asset) => asset.key === key);
}

export function getAssetSrc(key?: string | null) {
  return getAssetByKey(key)?.src ?? null;
}

export function getWalletAssetsByType(type: "income" | "extra" | "expense" | "saving") {
  if (type === "income") return walletAssets.filter((asset) => asset.group === "income" || asset.key === "wallet-income" || asset.key === "wallet-gift");
  if (type === "extra") return walletAssets.filter((asset) => ["wallet-extras", "wallet-regalo", "wallet-pagos"].includes(asset.key));
  if (type === "saving") return walletAssets.filter((asset) => ["wallet-savings", "wallet-viaje", "wallet-laptop", "wallet-laptop-goal", "wallet-ropa", "wallet-zapatos", "wallet-regalo"].includes(asset.key));
  return walletAssets.filter((asset) => asset.group === "expense" || asset.group === "movement");
}
