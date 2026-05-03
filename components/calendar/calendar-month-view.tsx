import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const dayLetters = ["L", "M", "M", "J", "V", "S", "D"];

type MonthCell = {
  key: string;
  day: number | null;
  dateKey: string | null;
};

export function CalendarMonthView({
  month,
  year,
  cells,
  selectedDateKey,
  eventDays,
  onMoveMonth,
  onSelectDateKey,
}: {
  month: string;
  year: number;
  cells: MonthCell[];
  selectedDateKey: string;
  eventDays: Set<string>;
  onMoveMonth: (amount: number) => void;
  onSelectDateKey: (dateKey: string) => void;
}) {
  return (
    <div className="mt-5 rounded-[26px] bg-white p-4 shadow-card">
      <div className="mb-4 flex items-center justify-between">
        <button type="button" onClick={() => onMoveMonth(-1)} className="grid h-10 w-10 place-items-center rounded-full bg-gray-50 text-monkey-ink transition active:scale-95" aria-label="Mes anterior">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="text-center">
          <p className="text-sm font-black text-monkey-ink">{month} {year}</p>
          <p className="text-[11px] font-bold text-monkey-muted">Tocá un día para ver su agenda</p>
        </div>
        <button type="button" onClick={() => onMoveMonth(1)} className="grid h-10 w-10 place-items-center rounded-full bg-gray-50 text-monkey-ink transition active:scale-95" aria-label="Mes siguiente">
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-black text-monkey-muted">
        {dayLetters.map((item, index) => <span key={`${item}-${index}`}>{item}</span>)}
      </div>

      <div className="mt-3 grid grid-cols-7 gap-2">
        {cells.map((cell) => {
          const isActive = cell.dateKey === selectedDateKey;
          const hasEvent = cell.dateKey ? eventDays.has(cell.dateKey) : false;
          return (
            <button
              key={cell.key}
              type="button"
              disabled={!cell.dateKey}
              onClick={() => { if (cell.dateKey) onSelectDateKey(cell.dateKey); }}
              className={cn(
                "relative grid h-11 place-items-center rounded-[14px] text-sm font-black transition active:scale-95 disabled:pointer-events-none disabled:opacity-0",
                isActive ? "bg-monkey-green text-white shadow-card" : "bg-gray-50 text-monkey-ink",
              )}
              aria-label={cell.dateKey ? `Ver actividades del ${cell.day}` : undefined}
            >
              {cell.day ?? ""}
              {hasEvent ? <span className={cn("absolute bottom-1 h-1.5 w-1.5 rounded-full", isActive ? "bg-white" : "bg-monkey-green")} /> : null}
            </button>
          );
        })}
      </div>

      <div className="mt-5 rounded-[18px] bg-green-50 p-4">
        <div className="flex items-start gap-3">
          <CalendarDays className="mt-0.5 h-5 w-5 text-monkey-greenDark" />
          <div>
            <p className="text-sm font-black text-monkey-greenDark">Navegación rápida</p>
            <p className="mt-1 text-xs leading-5 text-monkey-muted">Al seleccionar un día en el mes, volvés automáticamente a la vista semanal con sus actividades.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
