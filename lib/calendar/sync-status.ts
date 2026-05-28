import type { SaveMode, SyncStatus, EventSaveState } from "@/hooks/use-calendar-events";

export type CalendarSaveLabelContext = {
  syncing?: boolean;
  syncStatus: SyncStatus;
  lastSaveMode?: SaveMode;
  lastError?: string | null;
  pendingRemoteSaves?: number;
  localOnlySaves?: number;
};

export function countPendingRemoteSaves(eventSaveState: Record<string, EventSaveState>) {
  return Object.values(eventSaveState).filter((state) => state === "saving").length;
}

export function countLocalOnlySaves(eventSaveState: Record<string, EventSaveState>) {
  return Object.values(eventSaveState).filter((state) => state === "local" || state === "error").length;
}

export function calendarRemoteSaveLabel({
  syncing = false,
  syncStatus,
  lastSaveMode = "pending",
  lastError = null,
  pendingRemoteSaves = 0,
  localOnlySaves = 0,
}: CalendarSaveLabelContext) {
  if (pendingRemoteSaves > 0 || syncing || syncStatus === "saving" || lastSaveMode === "pending") {
    return "Guardando en tu cuenta…";
  }

  if (lastError || syncStatus === "error") {
    return localOnlySaves > 0
      ? "Hay cambios locales pendientes. Revisá conexión."
      : lastError || "No pudimos sincronizar. Revisá conexión.";
  }

  if (syncStatus === "loading") return "Sincronizando…";
  if (syncStatus === "synced" || lastSaveMode === "remote") return "Guardado en tu cuenta";
  if (syncStatus === "local" || lastSaveMode === "local") return "Guardado local";

  return "Listo";
}

export function calendarRemoteShortLabel(context: CalendarSaveLabelContext) {
  const label = calendarRemoteSaveLabel(context);
  if (label.startsWith("Guardando")) return "Guardando";
  if (label.startsWith("Guardado en")) return "En cuenta";
  if (label.startsWith("Hay cambios") || label.startsWith("No pudimos")) return "Revisar";
  if (label.startsWith("Sincronizando")) return "Cargando";
  if (label.startsWith("Guardado local")) return "Local";
  return null;
}
