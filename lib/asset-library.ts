export type AssetCategory = "intro" | "hero" | "face" | "wallet" | "activity" | "calendar";

export type AppAsset = {
  key: string;
  label: string;
  src: string;
  category: AssetCategory;
  group?: string;
};

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

export const activityAssets: AppAsset[] = [
  { key: "activity-water", label: "Agua", src: "/assets/activities/icons/beberagua.png", category: "activity" },
  { key: "activity-care", label: "Cuidado personal", src: "/assets/activities/icons/cuidado-personal.png", category: "activity" },
  { key: "activity-food", label: "Comida", src: "/assets/activities/icons/dinner.png", category: "activity" },
  { key: "activity-fruit", label: "Frutas", src: "/assets/activities/icons/fruit.png", category: "activity" },
  { key: "activity-gym", label: "Gimnasio", src: "/assets/activities/icons/gimnacio.png", category: "activity" },
  { key: "activity-instrument", label: "Instrumento", src: "/assets/activities/icons/instrumento.png", category: "activity" },
  { key: "activity-music", label: "Música", src: "/assets/activities/icons/musica.png", category: "activity" },
  { key: "activity-out", label: "Salida", src: "/assets/activities/icons/salida.png", category: "activity" },
  { key: "activity-sleep", label: "Dormir", src: "/assets/activities/icons/sleep.png", category: "activity" },
  { key: "activity-soccer", label: "Fútbol", src: "/assets/activities/icons/soccer.png", category: "activity" },
  { key: "activity-study", label: "Estudiar", src: "/assets/activities/icons/study.png", category: "activity" }
];

export const todayQuickAssets: AppAsset[] = [
  { key: "activity-meditate", label: "Meditar", src: "/assets/activities/today/meditar.png", category: "activity" },
  { key: "activity-shower", label: "Bañarse", src: "/assets/activities/today/banarse.png", category: "activity" },
  { key: "activity-brush", label: "Cepillarse", src: "/assets/activities/today/cepillarse.png", category: "activity" },
  { key: "activity-breakfast", label: "Desayuno", src: "/assets/activities/today/desayuno.png", category: "activity" },
  { key: "activity-wakeup", label: "Despertar", src: "/assets/activities/today/despertar.png", category: "activity" }
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
  { key: "wallet-movies", label: "Películas", src: "/assets/wallet/icons/expense/peliculas.png", category: "wallet", group: "expense" },
  { key: "wallet-healthy", label: "Saludable", src: "/assets/wallet/icons/expense/saludable.png", category: "wallet", group: "expense" }
];

export const activityAssetGallery = [...todayQuickAssets, ...activityAssets];

export const appAssets = [...introAssets, ...heroAssets, ...faceAssets, ...todayQuickAssets, ...activityAssets, ...calendarActivityAssets, ...walletAssets];

export function getAssetByKey(key?: string | null) {
  if (!key) return null;
  return appAssets.find((asset) => asset.key === key) ?? null;
}

export function getAssetSrc(keyOrSrc?: string | null) {
  if (!keyOrSrc) return null;
  if (keyOrSrc.startsWith("/")) return keyOrSrc;
  return getAssetByKey(keyOrSrc)?.src ?? null;
}

export function getWalletAssetsByType(type: "income" | "expense" | "saving") {
  if (type === "income") return walletAssets.filter((asset) => asset.group === "income");
  if (type === "saving") return walletAssets.filter((asset) => asset.group === "income" || asset.key === "wallet-savings");
  return walletAssets.filter((asset) => asset.group === "expense");
}
