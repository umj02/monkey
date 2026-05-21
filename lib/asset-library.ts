export type AssetCategory = "intro" | "hero" | "face" | "wallet" | "activity" | "calendar" | "onboarding";

export type AppAsset = {
  key: string;
  label: string;
  src: string;
  category: AssetCategory;
  group?: string;
};

export const onboardingAssets: AppAsset[] = [
  { key: "onboarding-tu-dia", label: "Tu día", src: "/assets/onboarding/tu-dia-01.png", category: "onboarding" },
  { key: "onboarding-actividades", label: "Actividades", src: "/assets/onboarding/actividades-02.png", category: "onboarding" },
  { key: "onboarding-calendario", label: "Calendario", src: "/assets/onboarding/calendario-03.png", category: "onboarding" },
  { key: "onboarding-alertas", label: "Alertas", src: "/assets/onboarding/alertas-04.png", category: "onboarding" },
  { key: "onboarding-avances", label: "Avances", src: "/assets/onboarding/avances-05.png", category: "onboarding" },
  { key: "onboarding-wallet", label: "Wallet", src: "/assets/onboarding/wallet-06.png", category: "onboarding" },
  { key: "onboarding-medallas", label: "Medallas", src: "/assets/onboarding/medallas-07.png", category: "onboarding" },
  { key: "onboarding-lograste", label: "Todo listo", src: "/assets/onboarding/lograste-08.png", category: "onboarding" },
];

export const introAssets: AppAsset[] = [
  { key: "intro-check", label: "Check", src: "/assets/monkey/intro/check.png", category: "intro" },
  { key: "intro-rapero", label: "Rapero", src: "/assets/monkey/intro/rapero.png", category: "intro" },
  { key: "intro-sentado", label: "Sentado", src: "/assets/monkey/intro/sentado.png", category: "intro" }
];

export const heroAssets: AppAsset[] = [
  { key: "hero-sentado", label: "Hero sentado", src: "/assets/monkey/hero/sentado.png", category: "hero" },
  { key: "hero-original", label: "Hero original", src: "/assets/monkey/hero/full-original.png", category: "hero" }
];

export const faceAssets: AppAsset[] = [
  { key: "face-main", label: "Carita principal", src: "/assets/monkey/faces/face-main.png", category: "face" },
  { key: "face-alt", label: "Carita guiño", src: "/assets/monkey/faces/face-alt.png", category: "face" }
];

export const monkeyActivityAssets: AppAsset[] = [
  { key: "monito-estudiar", label: "Estudiar", src: "/assets/monitos/estudiar.png", category: "activity", group: "estudio" },
  { key: "monito-clases", label: "Clases", src: "/assets/monitos/clases.png", category: "activity", group: "estudio" },
  { key: "monito-tarea", label: "Tarea", src: "/assets/monitos/tarea.png", category: "activity", group: "proyecto" },
  { key: "monito-proyecto", label: "Proyecto", src: "/assets/monitos/proyecto.png", category: "activity", group: "proyecto" },
  { key: "monito-trabajo", label: "Trabajo", src: "/assets/monitos/trabajo.png", category: "activity", group: "proyecto" },
  { key: "monito-banarse", label: "Bañarse", src: "/assets/monitos/banarse.png", category: "activity", group: "rutina" },
  { key: "monito-beber", label: "Beber", src: "/assets/monitos/beber.png", category: "activity", group: "salud" },
  { key: "monito-cepillarse", label: "Cepillarse", src: "/assets/monitos/cepillarse.png", category: "activity", group: "rutina" },
  { key: "monito-cuidado-personal", label: "Cuidado personal", src: "/assets/monitos/cuidado-personal.png", category: "activity", group: "rutina" },
  { key: "monito-desayuno", label: "Desayuno", src: "/assets/monitos/desayuno.png", category: "activity", group: "comida" },
  { key: "monito-despertar", label: "Despertar", src: "/assets/monitos/despertar.png", category: "activity", group: "rutina" },
  { key: "monito-comida", label: "Comida", src: "/assets/monitos/comida.png", category: "activity", group: "comida" },
  { key: "monito-fruta", label: "Fruta", src: "/assets/monitos/fruta.png", category: "activity", group: "comida" },
  { key: "monito-gym", label: "Gym", src: "/assets/monitos/gym.png", category: "activity", group: "salud" },
  { key: "monito-deporte", label: "Deporte", src: "/assets/monitos/deporte.png", category: "activity", group: "salud" },
  { key: "monito-meditacion", label: "Meditación", src: "/assets/monitos/meditacion.png", category: "activity", group: "salud" },
  { key: "monito-dormir", label: "Dormir", src: "/assets/monitos/dormir.png", category: "activity", group: "descanso" },
  { key: "monito-escuchar-musica", label: "Escuchar música", src: "/assets/monitos/escuchar-musica.png", category: "activity", group: "social" },
  { key: "monito-instrumento", label: "Instrumento", src: "/assets/monitos/instrumento.png", category: "activity", group: "social" },
  { key: "monito-salida", label: "Salida", src: "/assets/monitos/salida.png", category: "activity", group: "social" },
  { key: "monito-correr", label: "Correr", src: "/assets/monitos/correr.png", category: "activity", group: "salud" },
  { key: "monito-tomar-medicamento", label: "Tomar medicamento", src: "/assets/monitos/tomar-medicamento.png", category: "activity", group: "salud" },
  { key: "monito-caminar", label: "Caminar", src: "/assets/monitos/caminar.png", category: "activity", group: "salud" },
  { key: "monito-salida-rapida", label: "Salida rápida", src: "/assets/monitos/salida-rapida.png", category: "activity", group: "social" },
  { key: "monito-salida-vehiculo", label: "Salida en vehículo", src: "/assets/monitos/salida-vehiculo.png", category: "activity", group: "social" },
  { key: "monito-reunion", label: "Reunión", src: "/assets/monitos/reunion.png", category: "activity", group: "social" },
  { key: "monito-pago", label: "Pago", src: "/assets/monitos/pago.png", category: "activity", group: "otro" },
  { key: "monito-television", label: "Televisión", src: "/assets/monitos/television.png", category: "activity", group: "descanso" },
  { key: "monito-otro", label: "Otro", src: "/assets/monitos/otro.png", category: "activity", group: "otro" }
];

export const legacyActivityAssets: AppAsset[] = [
  { key: "activity-meditate", label: "Meditar", src: "/assets/monitos/meditacion.png", category: "activity", group: "legacy" },
  { key: "activity-shower", label: "Bañarse", src: "/assets/monitos/banarse.png", category: "activity", group: "legacy" },
  { key: "activity-brush", label: "Cepillarse", src: "/assets/monitos/cepillarse.png", category: "activity", group: "legacy" },
  { key: "activity-breakfast", label: "Desayuno", src: "/assets/monitos/desayuno.png", category: "activity", group: "legacy" },
  { key: "activity-wakeup", label: "Despertar", src: "/assets/monitos/despertar.png", category: "activity", group: "legacy" },
  { key: "activity-water", label: "Beber", src: "/assets/monitos/beber.png", category: "activity", group: "legacy" },
  { key: "activity-care", label: "Cuidado personal", src: "/assets/monitos/cuidado-personal.png", category: "activity", group: "legacy" },
  { key: "activity-food", label: "Comida", src: "/assets/monitos/comida.png", category: "activity", group: "legacy" },
  { key: "activity-fruit", label: "Fruta", src: "/assets/monitos/fruta.png", category: "activity", group: "legacy" },
  { key: "activity-gym", label: "Gym", src: "/assets/monitos/gym.png", category: "activity", group: "legacy" },
  { key: "activity-instrument", label: "Instrumento", src: "/assets/monitos/instrumento.png", category: "activity", group: "legacy" },
  { key: "activity-read", label: "Estudiar", src: "/assets/monitos/estudiar.png", category: "activity", group: "legacy" },
  { key: "activity-music", label: "Escuchar música", src: "/assets/monitos/escuchar-musica.png", category: "activity", group: "legacy" },
  { key: "activity-out", label: "Salida", src: "/assets/monitos/salida.png", category: "activity", group: "legacy" },
  { key: "activity-sleep", label: "Dormir", src: "/assets/monitos/dormir.png", category: "activity", group: "legacy" },
  { key: "activity-soccer", label: "Deporte", src: "/assets/monitos/deporte.png", category: "activity", group: "legacy" },
  { key: "activity-study", label: "Estudiar", src: "/assets/monitos/estudiar.png", category: "activity", group: "legacy" },
  { key: "calendar-exercise", label: "Deporte", src: "/assets/monitos/deporte.png", category: "activity", group: "legacy" },
  { key: "calendar-cleaning", label: "Cuidado personal", src: "/assets/monitos/cuidado-personal.png", category: "activity", group: "legacy" },
  { key: "calendar-task", label: "Tarea", src: "/assets/monitos/tarea.png", category: "activity", group: "legacy" },
  { key: "calendar-health", label: "Tomar medicamento", src: "/assets/monitos/tomar-medicamento.png", category: "activity", group: "legacy" },
  { key: "calendar-reading", label: "Estudiar", src: "/assets/monitos/estudiar.png", category: "activity", group: "legacy" },
  { key: "calendar-study", label: "Estudiar", src: "/assets/monitos/estudiar.png", category: "activity", group: "legacy" },
  { key: "calendar-class", label: "Clases", src: "/assets/monitos/clases.png", category: "activity", group: "legacy" },
  { key: "calendar-food", label: "Comida", src: "/assets/monitos/comida.png", category: "activity", group: "legacy" },
  { key: "calendar-project", label: "Proyecto", src: "/assets/monitos/proyecto.png", category: "activity", group: "legacy" },
  { key: "calendar-vacation", label: "Salida", src: "/assets/monitos/salida.png", category: "activity", group: "legacy" },
  { key: "calendar-rest", label: "Dormir", src: "/assets/monitos/dormir.png", category: "activity", group: "legacy" },
  { key: "calendar-meeting", label: "Reunión", src: "/assets/monitos/reunion.png", category: "activity", group: "legacy" },
  { key: "calendar-out", label: "Salida", src: "/assets/monitos/salida.png", category: "activity", group: "legacy" },
  { key: "calendar-cinema", label: "Televisión", src: "/assets/monitos/television.png", category: "activity", group: "legacy" },
  { key: "calendar-fastfood", label: "Comida", src: "/assets/monitos/comida.png", category: "activity", group: "legacy" },
  { key: "calendar-meditation", label: "Meditación", src: "/assets/monitos/meditacion.png", category: "activity", group: "legacy" },
  { key: "monkey-beberagua", label: "Beber", src: "/assets/monitos/beber.png", category: "activity", group: "legacy" },
  { key: "monkey-frutas", label: "Fruta", src: "/assets/monitos/fruta.png", category: "activity", group: "legacy" },
  { key: "monkey-futbol", label: "Deporte", src: "/assets/monitos/deporte.png", category: "activity", group: "legacy" },
  { key: "monkey-meditar", label: "Meditación", src: "/assets/monitos/meditacion.png", category: "activity", group: "legacy" },
  { key: "monkey-musica", label: "Escuchar música", src: "/assets/monitos/escuchar-musica.png", category: "activity", group: "legacy" },
  { key: "monkey-dormir", label: "Dormir", src: "/assets/monitos/dormir.png", category: "activity", group: "legacy" },
  { key: "monkey-leer", label: "Estudiar", src: "/assets/monitos/estudiar.png", category: "activity", group: "legacy" },
  { key: "monkey-gym", label: "Gym", src: "/assets/monitos/gym.png", category: "activity", group: "legacy" },
  { key: "monkey-estudiar", label: "Estudiar", src: "/assets/monitos/estudiar.png", category: "activity", group: "legacy" },
  { key: "monkey-banarse", label: "Bañarse", src: "/assets/monitos/banarse.png", category: "activity", group: "legacy" },
  { key: "monkey-cepillarse", label: "Cepillarse", src: "/assets/monitos/cepillarse.png", category: "activity", group: "legacy" },
  { key: "monkey-desayuno", label: "Desayuno", src: "/assets/monitos/desayuno.png", category: "activity", group: "legacy" },
  { key: "monkey-despertar", label: "Despertar", src: "/assets/monitos/despertar.png", category: "activity", group: "legacy" },
  { key: "monkey-comida", label: "Comida", src: "/assets/monitos/comida.png", category: "activity", group: "legacy" },
  { key: "monkey-instrumento", label: "Instrumento", src: "/assets/monitos/instrumento.png", category: "activity", group: "legacy" },
  { key: "monkey-salida", label: "Salida", src: "/assets/monitos/salida.png", category: "activity", group: "legacy" },
  { key: "monkey-cuidado-personal", label: "Cuidado personal", src: "/assets/monitos/cuidado-personal.png", category: "activity", group: "legacy" },
  { key: "monkey-otro", label: "Otro", src: "/assets/monitos/otro.png", category: "activity", group: "legacy" }
];

export const walletAssets: AppAsset[] = [
  { key: "wallet-income", label: "Ingresos", src: "/assets/icons/ingresos.png", category: "wallet", group: "income" },
  { key: "wallet-savings", label: "Ahorros", src: "/assets/icons/ahorros.png", category: "wallet", group: "income" },
  { key: "wallet-extras", label: "Extras", src: "/assets/icons/extras.png", category: "wallet", group: "income" },
  { key: "wallet-comida", label: "Comida", src: "/assets/icons/comida.png", category: "wallet", group: "expense" },
  { key: "wallet-food", label: "Comida", src: "/assets/icons/comida.png", category: "wallet", group: "expense" },
  { key: "wallet-transporte", label: "Transporte", src: "/assets/icons/transporte.png", category: "wallet", group: "expense" },
  { key: "wallet-transport", label: "Transporte", src: "/assets/icons/transporte.png", category: "wallet", group: "expense" },
  { key: "wallet-entretenimiento", label: "Entretenimiento", src: "/assets/icons/entretenimiento.png", category: "wallet", group: "expense" },
  { key: "wallet-fun", label: "Entretenimiento", src: "/assets/icons/entretenimiento.png", category: "wallet", group: "expense" },
  { key: "wallet-compras", label: "Compras", src: "/assets/icons/compras.png", category: "wallet", group: "expense" },
  { key: "wallet-shop", label: "Compras", src: "/assets/icons/compras.png", category: "wallet", group: "expense" },
  { key: "wallet-escuela", label: "Escuela", src: "/assets/icons/escuela.png", category: "wallet", group: "expense" },
  { key: "wallet-study", label: "Escuela", src: "/assets/icons/escuela.png", category: "wallet", group: "expense" },
  { key: "wallet-cafe", label: "Café", src: "/assets/icons/cafe.png", category: "wallet", group: "expense" },
  { key: "wallet-coffee", label: "Café", src: "/assets/icons/cafe.png", category: "wallet", group: "expense" },
  { key: "wallet-uber", label: "Uber", src: "/assets/icons/uber.png", category: "wallet", group: "expense" },
  { key: "wallet-pagos", label: "Pagos", src: "/assets/icons/pagos.png", category: "wallet", group: "expense" },
  { key: "wallet-alquiler", label: "Alquiler", src: "/assets/icons/alquiler.png", category: "wallet", group: "expense" },
  { key: "wallet-cuidado-personal", label: "Cuidado personal", src: "/assets/icons/cuidado-personal.png", category: "wallet", group: "expense" },
  { key: "wallet-care", label: "Cuidado personal", src: "/assets/icons/cuidado-personal.png", category: "wallet", group: "expense" },
  { key: "wallet-buses", label: "Buses", src: "/assets/icons/buses.png", category: "wallet", group: "expense" },
  { key: "wallet-vehiculo", label: "Vehículo", src: "/assets/icons/vehiculo.png", category: "wallet", group: "expense" },
  { key: "wallet-gas", label: "Combustible", src: "/assets/icons/combustible.png", category: "wallet", group: "expense" },
  { key: "wallet-luz", label: "Luz", src: "/assets/icons/luz.png", category: "wallet", group: "expense" },
  { key: "wallet-agua", label: "Agua", src: "/assets/icons/agua.png", category: "wallet", group: "expense" },
  { key: "wallet-telefono", label: "Teléfono", src: "/assets/icons/telefono.png", category: "wallet", group: "expense" },
  { key: "wallet-phone", label: "Teléfono", src: "/assets/icons/telefono.png", category: "wallet", group: "expense" },
  { key: "wallet-internet", label: "Internet", src: "/assets/icons/internet.png", category: "wallet", group: "expense" },
  { key: "wallet-combustible", label: "Combustible", src: "/assets/icons/combustible.png", category: "wallet", group: "expense" },
  { key: "wallet-prestamos", label: "Préstamos", src: "/assets/icons/prestamos.png", category: "wallet", group: "expense" },
  { key: "wallet-medicina", label: "Medicina", src: "/assets/icons/medicina.png", category: "wallet", group: "expense" },
  { key: "wallet-dentista", label: "Dentista", src: "/assets/icons/dentista.png", category: "wallet", group: "expense" },
  { key: "wallet-optica", label: "Óptica", src: "/assets/icons/optica.png", category: "wallet", group: "expense" },
  { key: "wallet-tarjetas-credito", label: "Tarjetas de crédito", src: "/assets/icons/tarjetas-credito.png", category: "wallet", group: "expense" },
  { key: "wallet-viaje", label: "Viaje", src: "/assets/icons/viaje.png", category: "wallet", group: "goal" },
  { key: "wallet-travel", label: "Viaje", src: "/assets/icons/viaje.png", category: "wallet", group: "goal" },
  { key: "wallet-gasto-hormiga", label: "Gasto hormiga", src: "/assets/icons/gasto-hormiga.png", category: "wallet", group: "expense" },
  { key: "wallet-laptop", label: "Laptop", src: "/assets/icons/laptop.png", category: "wallet", group: "goal" },
  { key: "wallet-shoes", label: "Zapatos", src: "/assets/icons/shoes.png", category: "wallet", group: "goal" },
  { key: "wallet-clothes", label: "Ropa", src: "/assets/icons/ropa.png", category: "wallet", group: "goal" },
  { key: "wallet-present", label: "Presente", src: "/assets/icons/presente.png", category: "wallet", group: "goal" },
  { key: "wallet-gift", label: "Regalo", src: "/assets/icons/presente.png", category: "wallet", group: "income" },
  { key: "wallet-materials", label: "Materiales", src: "/assets/icons/pagos.png", category: "wallet", group: "expense" },
  { key: "wallet-super", label: "Super", src: "/assets/icons/compras.png", category: "wallet", group: "expense" },
  { key: "wallet-bike", label: "Bicicleta", src: "/assets/icons/vehiculo.png", category: "wallet", group: "expense" },
  { key: "wallet-cinema", label: "Cine", src: "/assets/icons/entretenimiento.png", category: "wallet", group: "expense" },
  { key: "wallet-tennis", label: "Tennis", src: "/assets/icons/vehiculo.png", category: "wallet", group: "expense" },
  { key: "wallet-drinks", label: "Bebidas", src: "/assets/icons/agua.png", category: "wallet", group: "expense" },
  { key: "wallet-sports", label: "Deportes", src: "/assets/icons/vehiculo.png", category: "wallet", group: "expense" },
  { key: "wallet-movies", label: "Películas", src: "/assets/icons/entretenimiento.png", category: "wallet", group: "expense" },
  { key: "wallet-healthy", label: "Saludable", src: "/assets/icons/medicina.png", category: "wallet", group: "expense" }
];

export const activityAssetGallery = monkeyActivityAssets;
export const appAssets = [...onboardingAssets, ...introAssets, ...heroAssets, ...faceAssets, ...monkeyActivityAssets, ...legacyActivityAssets, ...walletAssets];

export function getAssetByKey(key?: string | null) {
  if (!key) return null;
  return appAssets.find((asset) => asset.key === key) ?? null;
}

export function getAssetSrc(keyOrSrc?: string | null) {
  if (!keyOrSrc) return null;
  if (keyOrSrc.startsWith("/")) return keyOrSrc;
  return getAssetByKey(keyOrSrc)?.src ?? null;
}

export function getWalletAssetsByType(type: "income" | "expense" | "saving" | "extra") {
  if (type === "income") return walletAssets.filter((asset) => asset.key === "wallet-income" || asset.key === "wallet-gift");
  if (type === "extra") return walletAssets.filter((asset) => asset.key === "wallet-extras" || asset.key === "wallet-gift" || asset.key === "wallet-income");
  if (type === "saving") return walletAssets.filter((asset) => asset.key === "wallet-savings" || asset.group === "goal");
  return walletAssets.filter((asset) => asset.group === "expense");
}
