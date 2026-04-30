"use client";

import type { AppAsset } from "@/lib/asset-library";
import { AssetThumb } from "@/components/asset-thumb";
import { cn } from "@/lib/utils";

type AssetPickerProps = {
  label: string;
  assets: AppAsset[];
  value: string;
  onChange: (value: string) => void;
};

export function AssetPicker({ label, assets, value, onChange }: AssetPickerProps) {
  return (
    <div>
      <span className="mb-2 block text-xs font-black uppercase tracking-[.08em] text-monkey-muted">{label}</span>
      <div className="no-scrollbar flex gap-2 overflow-x-auto rounded-[20px] bg-gray-50 p-2">
        {assets.map((asset) => {
          const active = value === asset.key;
          return (
            <button
              key={asset.key}
              type="button"
              onClick={() => onChange(asset.key)}
              className={cn(
                "grid min-w-[74px] place-items-center gap-1 rounded-[16px] border px-2 py-2 text-[10px] font-black transition active:scale-95",
                active ? "border-monkey-green bg-white text-monkey-greenDark shadow-sm" : "border-transparent bg-white/70 text-monkey-muted"
              )}
              aria-pressed={active}
            >
              <AssetThumb icon={asset.key} size={38} />
              <span className="max-w-[64px] truncate">{asset.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
