import { ChevronDown, ListFilter, Plus } from "lucide-react";

export function CalendarHeader({
  month,
  onOpenMonth,
  onOpenSettings,
  onAdd,
}: {
  month: string;
  onOpenMonth: () => void;
  onOpenSettings: () => void;
  onAdd: () => void;
}) {
  return (
    <header className="flex items-center justify-between">
      <button
        type="button"
        onClick={onOpenMonth}
        className="flex items-center gap-2 text-[26px] font-black tracking-[-0.04em] text-monkey-ink transition active:scale-95"
        aria-label="Cambiar mes"
      >
        {month}
        <ChevronDown className="h-5 w-5" />
      </button>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onOpenSettings}
          className="grid h-10 w-10 place-items-center rounded-full bg-white text-monkey-ink shadow-sm transition active:scale-95"
          aria-label="Configurar calendario y alertas"
        >
          <ListFilter className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={onAdd}
          className="grid h-10 w-10 place-items-center rounded-full bg-white text-monkey-ink shadow-sm transition active:scale-95"
          aria-label="Agregar actividad"
        >
          <Plus className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}
