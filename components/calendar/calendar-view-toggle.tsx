import { cn } from "@/lib/utils";

export type CalendarViewMode = "week" | "month";

export function CalendarViewToggle({ value, onChange }: { value: CalendarViewMode; onChange: (value: CalendarViewMode) => void }) {
  return (
    <div className="mt-5 rounded-[22px] border border-green-100 bg-white p-2 shadow-sm">
      <div className="grid h-10 grid-cols-2 rounded-[18px] bg-gray-100 p-1 text-xs font-black">
        <button
          type="button"
          onClick={() => onChange("week")}
          className={cn("rounded-[16px] transition active:scale-95", value === "week" ? "bg-monkey-green text-white shadow-sm" : "text-monkey-muted")}
        >
          Semana
        </button>
        <button
          type="button"
          onClick={() => onChange("month")}
          className={cn("rounded-[16px] transition active:scale-95", value === "month" ? "bg-monkey-green text-white shadow-sm" : "text-monkey-muted")}
        >
          Mes
        </button>
      </div>
    </div>
  );
}
