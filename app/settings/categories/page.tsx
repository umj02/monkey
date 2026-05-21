"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowLeft, BadgePlus, Check, Eye, EyeOff, GripVertical, ImageIcon, Plus, Trash2 } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { AssetThumb } from "@/components/asset-thumb";
import { FormSheet } from "@/components/form-sheet";
import { activityAssetGallery, getWalletAssetsByType, walletAssets } from "@/lib/asset-library";
import { type CategoryScope, categoryLabelFromKey } from "@/lib/category-definitions";
import { cn } from "@/lib/utils";
import { useCategoryPreferences, type EditableCategory } from "@/hooks/use-category-preferences";

type Tab = { key: CategoryScope; label: string; helper: string };

const tabs: Tab[] = [
  { key: "activity", label: "Actividades", helper: "Monitos para Hoy, tareas y calendario." },
  { key: "wallet_expense", label: "Wallet", helper: "Categorías analizables para gastos variables." },
  { key: "wallet_icon", label: "Iconos", helper: "Iconos para movimientos, pagos y servicios." },
];

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "") || "categoria";
}

function iconOptionsForScope(scope: CategoryScope) {
  if (scope === "activity") return activityAssetGallery;
  if (scope === "wallet_expense") return getWalletAssetsByType("expense");
  return walletAssets.filter((asset) => asset.group === "expense" || asset.group === "goal");
}

function statusText(status: string) {
  if (status === "loading") return "Cargando…";
  if (status === "saving") return "Guardando…";
  if (status === "error") return "Error de sync";
  if (status === "synced") return "Sincronizado";
  return "Listo";
}

export default function CategorySettingsPage() {
  const [activeTab, setActiveTab] = useState<CategoryScope>("activity");
  const { items, status, save, removeCustom } = useCategoryPreferences(activeTab);
  const [editing, setEditing] = useState<EditableCategory | null>(null);
  const [creating, setCreating] = useState(false);
  const tab = tabs.find((item) => item.key === activeTab) ?? tabs[0];
  const enabledCount = items.filter((item) => item.isEnabled).length;

  function openCreate() {
    const options = iconOptionsForScope(activeTab);
    setEditing({
      key: `custom:${Date.now().toString(36)}`,
      categoryKey: `custom:${Date.now().toString(36)}`,
      label: "Nueva categoría",
      iconKey: options[0]?.key ?? (activeTab === "activity" ? "monito-otro" : "wallet-gasto-hormiga"),
      scope: activeTab,
      isEnabled: true,
      sortOrder: items.length + 1,
      isCustom: true,
    });
    setCreating(true);
  }

  async function handleSave(item: EditableCategory) {
    const normalizedKey = item.isCustom && creating ? `custom:${slugify(item.label)}` : item.categoryKey;
    await save({ ...item, key: normalizedKey, categoryKey: normalizedKey });
    setEditing(null);
    setCreating(false);
  }

  return (
    <AppShell>
      <section className="page-pad pt-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <Link href="/settings" className="inline-flex items-center gap-2 text-xs font-black text-monkey-muted"><ArrowLeft className="h-4 w-4" /> Configuración</Link>
            <h1 className="mt-3 text-2xl font-black tracking-tight">Personalizar categorías</h1>
            <p className="mt-1 text-sm font-semibold leading-relaxed text-monkey-muted">Editá nombres, orden, visibilidad e imagen sin cargar los formularios principales.</p>
          </div>
          <button type="button" onClick={openCreate} className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-monkey-green text-white shadow-card active:scale-95" aria-label="Crear categoría"><Plus className="h-5 w-5" /></button>
        </div>

        <div className="mt-5 rounded-[28px] bg-white p-2 shadow-card">
          <div className="grid grid-cols-3 gap-2">
            {tabs.map((item) => (
              <button key={item.key} type="button" onClick={() => setActiveTab(item.key)} className={cn("h-11 rounded-full text-xs font-black transition", activeTab === item.key ? "bg-monkey-green text-white shadow-card" : "bg-gray-50 text-monkey-muted")}>{item.label}</button>
            ))}
          </div>
        </div>

        <section className="mt-4 rounded-[28px] bg-gradient-to-br from-green-50 to-white p-4 shadow-card">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[.08em] text-monkey-greenDark">{tab.label}</p>
              <h2 className="mt-1 text-lg font-black">{enabledCount} visibles</h2>
              <p className="mt-1 text-xs font-bold leading-relaxed text-monkey-muted">{tab.helper}</p>
            </div>
            <span className="rounded-full bg-white px-3 py-2 text-[11px] font-black text-monkey-greenDark shadow-sm">{statusText(status)}</span>
          </div>
        </section>

        <div className="mt-4 space-y-3 pb-24">
          {items.map((item, index) => (
            <article key={item.categoryKey} className={cn("rounded-[24px] bg-white p-3 shadow-card", !item.isEnabled && "opacity-60")}> 
              <button type="button" onClick={() => { setEditing(item); setCreating(false); }} className="grid w-full grid-cols-[40px_1fr_auto] items-center gap-3 text-left">
                <AssetThumb icon={item.iconKey} alt={item.label} size={40} className="rounded-[15px] bg-gray-50" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-black">{item.label}</p>
                  <p className="mt-0.5 truncate text-[11px] font-bold text-monkey-muted">{item.isCustom ? "Personalizada" : "Base"} · {item.categoryKey}</p>
                </div>
                <div className="flex items-center gap-2 text-monkey-muted">
                  {item.isEnabled ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  <GripVertical className="h-4 w-4" />
                  <span className="text-[11px] font-black">{index + 1}</span>
                </div>
              </button>
            </article>
          ))}
        </div>

        {editing ? (
          <EditCategorySheet
            item={editing}
            creating={creating}
            options={iconOptionsForScope(activeTab)}
            onClose={() => { setEditing(null); setCreating(false); }}
            onSave={handleSave}
            onDelete={async (item) => {
              const ok = await removeCustom(item);
              if (ok) { setEditing(null); setCreating(false); }
            }}
          />
        ) : null}
      </section>
    </AppShell>
  );
}

function EditCategorySheet({ item, creating, options, onClose, onSave, onDelete }: { item: EditableCategory; creating: boolean; options: ReturnType<typeof iconOptionsForScope>; onClose: () => void; onSave: (item: EditableCategory) => Promise<void>; onDelete: (item: EditableCategory) => Promise<void>; }) {
  const [draft, setDraft] = useState(item);
  const selectedAsset = useMemo(() => options.find((option) => option.key === draft.iconKey), [draft.iconKey, options]);

  return (
    <FormSheet open title={creating ? "Nueva categoría" : "Editar categoría"} subtitle="La key estable se usa para analítica; el nombre visible puede cambiar." submitLabel="Guardar categoría" onClose={onClose} onSubmit={() => onSave(draft)}>
      <label className="block">
        <span className="text-xs font-black uppercase tracking-[.08em] text-monkey-muted">Nombre visible</span>
        <input value={draft.label} onChange={(event) => setDraft((value) => ({ ...value, label: event.target.value || "Categoría" }))} className="mt-2 h-14 w-full rounded-[20px] border border-gray-200 px-4 text-base font-bold outline-none focus:border-monkey-green" />
      </label>

      <div className="rounded-[24px] bg-gray-50 p-3">
        <div className="flex items-center gap-3">
          <AssetThumb icon={draft.iconKey} alt={draft.label} size={54} className="rounded-[20px] bg-white shadow-sm" />
          <div>
            <p className="text-sm font-black">Imagen actual</p>
            <p className="text-xs font-bold text-monkey-muted">{selectedAsset?.label ?? draft.iconKey}</p>
          </div>
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-[.08em] text-monkey-muted"><ImageIcon className="h-4 w-4" /> Elegir imagen</div>
        <div className="grid grid-cols-3 gap-2">
          {options.slice(0, 36).map((asset) => (
            <button key={asset.key} type="button" onClick={() => setDraft((value) => ({ ...value, iconKey: asset.key }))} className={cn("rounded-[20px] border p-2 text-center transition active:scale-95", draft.iconKey === asset.key ? "border-monkey-green bg-green-50" : "border-gray-100 bg-white")}>
              <AssetThumb icon={asset.key} alt={asset.label} size={42} className="mx-auto rounded-[14px]" />
              <span className="mt-1 block truncate text-[10px] font-black text-monkey-muted">{asset.label}</span>
            </button>
          ))}
        </div>
      </div>

      <button type="button" onClick={() => setDraft((value) => ({ ...value, isEnabled: !value.isEnabled }))} className="flex h-13 w-full items-center justify-between rounded-[20px] bg-gray-50 px-4 text-sm font-black">
        <span>{draft.isEnabled ? "Visible en selectores" : "Oculta en selectores"}</span>
        {draft.isEnabled ? <Eye className="h-5 w-5 text-monkey-green" /> : <EyeOff className="h-5 w-5 text-monkey-muted" />}
      </button>

      <label className="block">
        <span className="text-xs font-black uppercase tracking-[.08em] text-monkey-muted">Orden</span>
        <input type="number" value={draft.sortOrder} onChange={(event) => setDraft((value) => ({ ...value, sortOrder: Number(event.target.value) || 0 }))} className="mt-2 h-13 w-full rounded-[20px] border border-gray-200 px-4 text-base font-bold outline-none focus:border-monkey-green" />
      </label>

      {draft.isCustom && !creating ? <button type="button" onClick={() => onDelete(draft)} className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-pink-50 text-sm font-black text-monkey-pink"><Trash2 className="h-4 w-4" /> Eliminar categoría</button> : null}

      <div className="rounded-[20px] bg-green-50 p-3 text-xs font-bold leading-relaxed text-monkey-greenDark"><Check className="mr-1 inline h-4 w-4" /> Los formularios siguen limpios. Esta pantalla prepara la personalización sin afectar la captura rápida.</div>
      <div className="rounded-[20px] bg-yellow-50 p-3 text-xs font-bold leading-relaxed text-orange-800"><BadgePlus className="mr-1 inline h-4 w-4" /> Para subir imágenes propias desde el teléfono, conviene una siguiente versión con Supabase Storage.</div>
    </FormSheet>
  );
}
