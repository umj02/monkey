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

export const todayQuickAssets: AppAsset[] = [
  { key: "activity-meditate", label: "Meditar", src: "/assets/activities/icons/meditar.png", category: "activity" },
  { key: "activity-shower", label: "Bañarse", src: "/assets/activities/icons/banarse.png", category: "activity" },
  { key: "activity-brush", label: "Cepillarse", src: "/assets/activities/icons/cepillarse.png", category: "activity" },
  { key: "activity-breakfast", label: "Desayuno", src: "/assets/activities/icons/desayuno.png", category: "activity" },
  { key: "activity-wakeup", label: "Despertar", src: "/assets/activities/icons/despertar.png", category: "activity" }
];

export const activityAssets: AppAsset[] = [
  { key: "activity-water", label: "Agua", src: "/assets/activities/icons/beberagua.png", category: "activity" },
  { key: "activity-care", label: "Cuidado personal", src: "/assets/activities/icons/cuidado-personal.png", category: "activity" },
  { key: "activity-food", label: "Comida", src: "/assets/activities/icons/dinner.png", category: "activity" },
  { key: "activity-fruit", label: "Frutas", src: "/assets/activities/icons/fruit.png", category: "activity" },
  { key: "activity-gym", label: "Gimnasio", src: "/assets/activities/icons/gimnacio.png", category: "activity" },
  { key: "activity-instrument", label: "Instrumento", src: "/assets/activities/icons/instrumento.png", category: "activity" },
  { key: "activity-read", label: "Leer", src: "/assets/activities/icons/leer.png", category: "activity" },
  { key: "activity-music", label: "Música", src: "/assets/activities/icons/musica.png", category: "activity" },
  { key: "activity-out", label: "Salida", src: "/assets/activities/icons/salida.png", category: "activity" },
  { key: "activity-sleep", label: "Dormir", src: "/assets/activities/icons/sleep.png", category: "activity" },
  { key: "activity-soccer", label: "Fútbol", src: "/assets/activities/icons/soccer.png", category: "activity" },
  { key: "activity-study", label: "Estudiar", src: "/assets/activities/icons/study.png", category: "activity" }
];

export const calendarActivityAssets: AppAsset[] = [
  { key: "calendar-exercise", label: "Ejercicio", src: "/assets/activities/calendar/ejercicio.png", category: "calendar" },
  { key: "calendar-cleaning", label: "Limpieza", src: "/assets/activities/calendar/limpieza.png", category: "calendar" },
  { key: "calendar-task", label: "Tarea", src: "/assets/activities/calendar/tarea.png", category: "calendar" },
  { key: "calendar-health", label: "Salud", src: "/assets/activities/calendar/salud.png", category: "calendar" },
  { key: "calendar-reading", label: "Lectura", src: "/assets/activities/calendar/lectura.png", category: "calendar" },
  { key: "calendar-study", label: "Estudio", src: "/assets/activities/calendar/estudio.png", category: "calendar" },
  { key: "calendar-class", label: "Clases", src: "/assets/activities/calendar/clases.png", category: "calendar" },
  { key: "calendar-food", label: "Comida", src: "/assets/activities/calendar/comida.png", category: "calendar" },
  { key: "calendar-project", label: "Proyecto", src: "/assets/activities/calendar/proyecto.png", category: "calendar" },
  { key: "calendar-vacation", label: "Vacaciones", src: "/assets/activities/calendar/vacaciones.png", category: "calendar" },
  { key: "calendar-rest", label: "Descanso", src: "/assets/activities/calendar/descanso.png", category: "calendar" },
  { key: "calendar-meeting", label: "Reunión", src: "/assets/activities/calendar/reunion.png", category: "calendar" },
  { key: "calendar-out", label: "Salida", src: "/assets/activities/calendar/salida.png", category: "calendar" },
  { key: "calendar-cinema", label: "Cine", src: "/assets/activities/calendar/cine.png", category: "calendar" },
  { key: "calendar-fastfood", label: "Comida rápida", src: "/assets/activities/calendar/fastfood.png", category: "calendar" },
  { key: "calendar-meditation", label: "Meditación", src: "/assets/activities/calendar/meditacion.png", category: "calendar" }
];


export const monkeyActivityAssets: AppAsset[] = [
  { key: "monkey-banarse", label: "Bañarse", src: "/assets/activities/monkeys/banarse.png", category: "activity", group: "rutina" },
  { key: "monkey-beberagua", label: "Beber agua", src: "/assets/activities/monkeys/beberagua.png", category: "activity", group: "salud" },
  { key: "monkey-cepillarse", label: "Cepillarse", src: "/assets/activities/monkeys/cepillarse.png", category: "activity", group: "rutina" },
  { key: "monkey-cuidado-personal", label: "Cuidado personal", src: "/assets/activities/monkeys/cuidado-personal.png", category: "activity", group: "rutina" },
  { key: "monkey-desayuno", label: "Desayuno", src: "/assets/activities/monkeys/desayuno.png", category: "activity", group: "comida" },
  { key: "monkey-despertar", label: "Despertar", src: "/assets/activities/monkeys/despertar.png", category: "activity", group: "rutina" },
  { key: "monkey-comida", label: "Comida", src: "/assets/activities/monkeys/dinner.png", category: "activity", group: "comida" },
  { key: "monkey-frutas", label: "Frutas", src: "/assets/activities/monkeys/fruit.png", category: "activity", group: "comida" },
  { key: "monkey-gym", label: "Gym", src: "/assets/activities/monkeys/gimnacio.png", category: "activity", group: "salud" },
  { key: "monkey-instrumento", label: "Instrumento", src: "/assets/activities/monkeys/instrumento.png", category: "activity", group: "social" },
  { key: "monkey-leer", label: "Leer", src: "/assets/activities/monkeys/leer.png", category: "activity", group: "estudio" },
  { key: "monkey-meditar", label: "Meditar", src: "/assets/activities/monkeys/meditar.png", category: "activity", group: "salud" },
  { key: "monkey-musica", label: "Música", src: "/assets/activities/monkeys/musica.png", category: "activity", group: "social" },
  { key: "monkey-salida", label: "Salida", src: "/assets/activities/monkeys/salida.png", category: "activity", group: "social" },
  { key: "monkey-dormir", label: "Dormir", src: "/assets/activities/monkeys/sleep.png", category: "activity", group: "descanso" },
  { key: "monkey-futbol", label: "Fútbol", src: "/assets/activities/monkeys/soccer.png", category: "activity", group: "salud" },
  { key: "monkey-estudiar", label: "Estudiar", src: "/assets/activities/monkeys/study.png", category: "activity", group: "estudio" },
  { key: "monkey-otro", label: "Otro", src: "/assets/activities/monkeys/otro.png", category: "activity", group: "otro" },
];

export const walletAssets: AppAsset[] = [
  { key: "wallet-income", label: "Ingresos", src: "/assets/wallet/icons/income/ingresos.png", category: "wallet", group: "income" },
  { key: "wallet-savings", label: "Ahorros", src: "/assets/wallet/icons/income/ahorros.png", category: "wallet", group: "income" },
  { key: "wallet-extras", label: "Extras", src: "/assets/wallet/icons/income/extras.png", category: "wallet", group: "income" },
  { key: "wallet-food", label: "Comida", src: "/assets/wallet/icons/expense/pizza.png", category: "wallet", group: "expense" },
  { key: "wallet-burger", label: "Hamburguesa", src: "/assets/wallet/icons/expense/hamburguesas.png", category: "wallet", group: "expense" },
  { key: "wallet-transport", label: "Transporte", src: "/assets/wallet/icons/expense/transporte.png", category: "wallet", group: "expense" },
  { key: "wallet-uber", label: "Uber", src: "/assets/wallet/icons/expense/uber.png", category: "wallet", group: "expense" },
  { key: "wallet-train", label: "Tren", src: "/assets/wallet/icons/expense/tren.png", category: "wallet", group: "expense" },
  { key: "wallet-study", label: "Estudio", src: "/assets/wallet/icons/expense/estudio.png", category: "wallet", group: "expense" },
  { key: "wallet-music", label: "Música", src: "/assets/wallet/icons/expense/musica.png", category: "wallet", group: "expense" },
  { key: "wallet-gift", label: "Regalo", src: "/assets/wallet/icons/expense/regalo.png", category: "wallet", group: "expense" },
  { key: "wallet-coffee", label: "Café", src: "/assets/wallet/icons/expense/cafe.png", category: "wallet", group: "expense" },
  { key: "wallet-materials", label: "Materiales", src: "/assets/wallet/icons/expense/materiales.png", category: "wallet", group: "expense" },
  { key: "wallet-super", label: "Super", src: "/assets/wallet/icons/expense/super.png", category: "wallet", group: "expense" },
  { key: "wallet-bike", label: "Bicicleta", src: "/assets/wallet/icons/expense/bicicleta.png", category: "wallet", group: "expense" },
  { key: "wallet-care", label: "Cuidado", src: "/assets/wallet/icons/expense/cuidado-personal.png", category: "wallet", group: "expense" },
  { key: "wallet-books", label: "Lecturas", src: "/assets/wallet/icons/expense/lecturas.png", category: "wallet", group: "expense" },
  { key: "wallet-shop", label: "Compras", src: "/assets/wallet/icons/expense/shop.png", category: "wallet", group: "expense" },
  { key: "wallet-gym", label: "Gym", src: "/assets/wallet/icons/expense/gym.png", category: "wallet", group: "expense" },
  { key: "wallet-cinema", label: "Cine", src: "/assets/wallet/icons/expense/cine.png", category: "wallet", group: "expense" },
  { key: "wallet-tennis", label: "Tennis", src: "/assets/wallet/icons/expense/tennis.png", category: "wallet", group: "expense" },
  { key: "wallet-gas", label: "Gas", src: "/assets/wallet/icons/expense/gas.png", category: "wallet", group: "expense" },
  { key: "wallet-fun", label: "Entretenimiento", src: "/assets/wallet/icons/expense/entretenimiento.png", category: "wallet", group: "expense" },
  { key: "wallet-drinks", label: "Bebidas", src: "/assets/wallet/icons/expense/bebidas.png", category: "wallet", group: "expense" },
  { key: "wallet-sports", label: "Deportes", src: "/assets/wallet/icons/expense/deportes.png", category: "wallet", group: "expense" },
  { key: "wallet-phone", label: "Celular", src: "/assets/wallet/icons/expense/celular.png", category: "wallet", group: "expense" },
  { key: "wallet-laptop", label: "Laptop", src: "/assets/wallet/icons/expenses/laptop.png", category: "wallet", group: "goal" },
  { key: "wallet-shoes", label: "Zapatos", src: "/assets/wallet/icons/expenses/shoes.png", category: "wallet", group: "goal" },
  { key: "wallet-travel", label: "Viaje", src: "/assets/wallet/icons/expenses/viaje.png", category: "wallet", group: "goal" },
  { key: "wallet-clothes", label: "Ropa", src: "/assets/wallet/icons/expenses/ropa.png", category: "wallet", group: "goal" },
  { key: "wallet-present", label: "Presente", src: "/assets/wallet/icons/expenses/presente.png", category: "wallet", group: "goal" },
  { key: "wallet-movies", label: "Películas", src: "/assets/wallet/icons/expense/peliculas.png", category: "wallet", group: "expense" },
  { key: "wallet-healthy", label: "Saludable", src: "/assets/wallet/icons/expense/saludable.png", category: "wallet", group: "expense" }
];

// Selector source of truth: only monkeyActivityAssets should power activity pickers.
export const activityAssetGallery = monkeyActivityAssets;

// Legacy activity assets stay registered only as fallbacks for old saved records.
// Do not use todayQuickAssets/activityAssets/calendarActivityAssets in new pickers.
export const legacyActivityAssets = [...todayQuickAssets, ...activityAssets, ...calendarActivityAssets];

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
  if (type === "saving") return walletAssets.filter((asset) => asset.key === "wallet-savings" || asset.key === "wallet-phone" || asset.group === "goal");
  return walletAssets.filter((asset) => asset.group === "expense");
}
