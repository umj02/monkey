import { cn } from "@/lib/utils";

const weekLabels = ["LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB", "DOM"];

export function CalendarWeekStrip({
  dates,
  selectedDateKey,
  eventDays,
  getDateKey,
  onSelect,
}: {
  dates: Date[];
  selectedDateKey: string;
  eventDays: Set<string>;
  getDateKey: (date: Date) => string;
  onSelect: (date: Date) => void;
}) {
  return (
    <div className="mt-4 grid grid-cols-7 gap-2">
      {dates.map((dayDate, index) => {
        const dateKey = getDateKey(dayDate);
        const active = dateKey === selectedDateKey;
        const hasEvent = eventDays.has(dateKey);
        return (
          <button
            key={dateKey}
            type="button"
            onClick={() => onSelect(dayDate)}
            className={cn(
              "relative min-w-0 rounded-[18px] py-3 text-center transition active:scale-95",
              active ? "bg-monkey-green text-white shadow-card" : "bg-white text-monkey-ink shadow-sm",
            )}
          >
            <p className="text-[10px] font-black opacity-70">{weekLabels[index]}</p>
            <p className="mt-1 text-base font-black leading-none">{dayDate.getDate()}</p>
            {hasEvent ? <span className={cn("absolute bottom-1 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full", active ? "bg-white" : "bg-monkey-green")} /> : null}
          </button>
        );
      })}
    </div>
  );
}
