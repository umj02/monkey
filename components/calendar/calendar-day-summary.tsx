export function CalendarDaySummary({
  label,
  count,
  syncStatus,
}: {
  label: string;
  count: number;
  syncStatus: "idle" | "loading" | "saving" | "synced" | "error";
}) {
  const statusLabel =
    syncStatus === "saving"
      ? "Guardando"
      : syncStatus === "loading"
        ? "Cargando"
        : syncStatus === "synced"
          ? "Sincronizado"
          : syncStatus === "error"
            ? "Error de sync"
            : null;

  return (
    <div className="mt-5 flex items-center justify-between rounded-[20px] bg-white px-4 py-3 shadow-sm">
      <div className="min-w-0 flex-1 pr-3">
        <p className="text-[11px] font-black uppercase tracking-[.08em] text-monkey-muted">Día seleccionado</p>
        <p className="mt-1 truncate text-sm font-black capitalize text-monkey-ink">{label}</p>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1">
        <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-black text-monkey-greenDark">{count} act.</span>
        {statusLabel ? (
          <span className="rounded-full bg-gray-50 px-2 py-0.5 text-[10px] font-black text-monkey-muted">{statusLabel}</span>
        ) : null}
      </div>
    </div>
  );
}
