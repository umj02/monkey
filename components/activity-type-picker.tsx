"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { AssetThumb } from "@/components/asset-thumb";
import { ACTIVITY_TYPES, getActivityTypeByKey } from "@/lib/activity-types";
import { cn } from "@/lib/utils";

type Props = {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  compact?: boolean;
};

export function ActivityTypePicker({ label = "Tipo de actividad", value, onChange, compact = false }: Props) {
  const [query, setQuery] = useState("");
  const selected = getActivityTypeByKey(value);
  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return ACTIVITY_TYPES;
    return ACTIVITY_TYPES.filter((type) =>
      type.label.toLowerCase().includes(normalized) ||
      type.group.toLowerCase().includes(normalized) ||
      type.key.toLowerCase().includes(normalized),
    );
  }, [query]);

  return (
    <div className="min-w-0 max-w-full overflow-hidden">
      <span className="mb-2 block text-xs font-black uppercase tracking-[.08em] text-monkey-muted">{label}</span>
      <div className="rounded-[22px] bg-gray-50 p-2">
        <div className="mb-2 flex items-center gap-2 rounded-[16px] bg-white px-3 py-2 shadow-sm">
          <Search className="h-4 w-4 shrink-0 text-monkey-muted" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={`Buscar: ${selected.label}`}
            className="min-w-0 flex-1 bg-transparent text-sm font-bold text-monkey-ink outline-none placeholder:text-gray-400"
          />
        </div>
        <div className="asset-picker-scroll no-scrollbar flex max-w-full gap-2 overflow-x-auto overscroll-x-contain pb-1">
          {filtered.map((type) => {
            const active = value === type.key || value === type.iconKey;
            return (
              <button
                key={type.key}
                type="button"
                onClick={() => onChange(type.key)}
                className={cn(
                  "grid flex-none place-items-center gap-1 rounded-[16px] border px-2 py-2 text-[10px] font-black transition active:scale-95",
                  compact ? "w-[72px]" : "w-[78px]",
                  active ? "border-monkey-green bg-white text-monkey-greenDark shadow-sm" : "border-transparent bg-white/70 text-monkey-muted",
                )}
                aria-pressed={active}
              >
                <AssetThumb icon={type.iconKey} size={compact ? 34 : 38} />
                <span className="block w-full truncate text-center leading-tight">{type.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
