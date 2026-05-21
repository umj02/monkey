"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { AssetThumb } from "@/components/asset-thumb";
import { ACTIVITY_TYPES, getActivityTypeByKey } from "@/lib/activity-types";
import { useCategoryPreferences } from "@/hooks/use-category-preferences";
import { cn } from "@/lib/utils";

const fallbackActivity = ACTIVITY_TYPES.find((type) => type.key === "otro") ?? ACTIVITY_TYPES[0];

type Props = {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  compact?: boolean;
};

export function ActivityTypePicker({ label = "Tipo de actividad", value, onChange, compact = false }: Props) {
  const [query, setQuery] = useState("");
  const { activityItems, loading } = useCategoryPreferences();

  const pickerItems = useMemo(() => {
    const baseByKey = new Map(ACTIVITY_TYPES.map((type) => [type.key, type]));
    return activityItems
      .filter((item) => item.isEnabled)
      .map((item) => {
        const base = baseByKey.get(item.key) ?? fallbackActivity;
        return {
          ...base,
          key: item.key,
          label: item.label,
          iconKey: item.iconKey ?? base.iconKey,
          custom: item.isCustom,
          imagePath: item.imagePath ?? null,
        };
      });
  }, [activityItems]);

  const selected = pickerItems.find((item) => item.key === value) ?? getActivityTypeByKey(value);
  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return pickerItems;
    return pickerItems.filter((type) =>
      type.label.toLowerCase().includes(normalized) ||
      type.group.toLowerCase().includes(normalized) ||
      type.key.toLowerCase().includes(normalized),
    );
  }, [pickerItems, query]);

  return (
    <div className="min-w-0 max-w-full overflow-hidden">
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="block text-xs font-black uppercase tracking-[.08em] text-monkey-muted">{label}</span>
        {loading ? <span className="rounded-full bg-gray-100 px-2 py-1 text-[10px] font-black text-monkey-muted">Sincronizando</span> : null}
      </div>
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
        {filtered.length > 0 ? (
          <div className="asset-picker-scroll no-scrollbar flex max-w-full gap-2 overflow-x-auto overscroll-x-contain pb-1">
            {filtered.map((type) => {
              const active = value === type.key || getActivityTypeByKey(value).key === type.key;
              return (
                <button
                  key={type.key}
                  type="button"
                  onClick={() => onChange(type.key)}
                  className={cn(
                    "grid flex-none place-items-center gap-1 rounded-[18px] border px-2 py-2 text-[10px] font-black transition active:scale-95",
                    compact ? "w-[76px]" : "w-[84px]",
                    active ? "border-monkey-green bg-white text-monkey-greenDark shadow-sm" : "border-transparent bg-white/70 text-monkey-muted",
                  )}
                  aria-pressed={active}
                >
                  <span className={cn("relative grid place-items-center rounded-[14px] p-1.5 shadow-[inset_0_0_0_1px_rgba(255,255,255,.65)]", type.toneClass)}>
                    <AssetThumb icon={type.iconKey} src={type.imagePath} size={compact ? 34 : 40} imageClassName="drop-shadow-sm" />
                    {type.custom ? <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-monkey-purple ring-2 ring-white" /> : null}
                  </span>
                  <span className="block w-full truncate text-center leading-tight">{type.label}</span>
                </button>
              );
            })}
          </div>
        ) : (
          <p className="rounded-[16px] bg-white px-3 py-3 text-center text-xs font-bold text-monkey-muted">No encontré una categoría con ese nombre.</p>
        )}
      </div>
    </div>
  );
}
