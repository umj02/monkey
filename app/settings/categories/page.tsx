"use client";

import { type ChangeEvent, useMemo, useState } from "react";
import Link from "next/link";
import { AlertCircle, ArrowLeft, CheckCircle2, Edit3, Eye, EyeOff, ImagePlus, Plus, RotateCcw, Search, SlidersHorizontal, Tags, Trash2, UploadCloud } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { AssetThumb } from "@/components/asset-thumb";
import { Field } from "@/components/field";
import { FormSheet } from "@/components/form-sheet";
import { ACTIVITY_TYPES } from "@/lib/activity-types";
import { getWalletAssetsByType } from "@/lib/asset-library";
import { buildBaseCategoryItems, categoryTabs, defaultIconByScope, mergeCategoryPreferences, slugifyCategory, type EditableCategory } from "@/lib/category-catalog";
import { deleteCategoryPreference, upsertCategoryPreference, type CategoryPreference, type CategoryPreferenceScope } from "@/lib/services/category-preferences-service";
import { uploadCategoryImage } from "@/lib/services/custom-category-asset-service";
import { useCategoryPreferences } from "@/hooks/use-category-preferences";
import { cn } from "@/lib/utils";

function scopeToItems(scope: CategoryPreferenceScope, preferences: CategoryPreference[]) {
  return mergeCategoryPreferences(buildBaseCategoryItems(scope), preferences, scope);
}

function iconOptionsForScope(scope: CategoryPreferenceScope) {
  if (scope === "activity") return ACTIVITY_TYPES.map((type) => ({ key: type.iconKey, label: type.label }));
  const assets = getWalletAssetsByType("expense");
  if (scope === "wallet_icon") return assets.filter((asset) => asset.group === "movement").map((asset) => ({ key: asset.key, label: asset.label }));
  return assets.filter((asset) => asset.group === "expense" || asset.group === "movement").map((asset) => ({ key: asset.key, label: asset.label }));
}

export default function CategorySettingsPage() {
  const [activeScope, setActiveScope] = useState<CategoryPreferenceScope>("activity");
  const { preferences, setPreferences, loading } = useCategoryPreferences();
  const [editing, setEditing] = useState<EditableCategory | null>(null);
  const [draftLabel, setDraftLabel] = useState("");
  const [draftIcon, setDraftIcon] = useState("");
  const [draftEnabled, setDraftEnabled] = useState(true);
  const [draftImagePath, setDraftImagePath] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [search, setSearch] = useState("");
  const [iconSearch, setIconSearch] = useState("");
  const [toast, setToast] = useState<{ type: "success" | "error" | "info"; message: string } | null>(null);

  const baseItems = useMemo(() => buildBaseCategoryItems(activeScope), [activeScope]);
  const items = useMemo(() => scopeToItems(activeScope, preferences), [activeScope, preferences]);
  const currentTab = categoryTabs.find((tab) => tab.scope === activeScope) ?? categoryTabs[0];
  const enabledCount = items.filter((item) => item.isEnabled).length;
  const customCount = items.filter((item) => item.isCustom).length;
  const hiddenCount = items.length - enabledCount;

  const filteredItems = useMemo(() => {
    const normalized = search.trim().toLowerCase();
    if (!normalized) return items;
    return items.filter((item) => item.label.toLowerCase().includes(normalized) || item.key.toLowerCase().includes(normalized) || item.baseLabel.toLowerCase().includes(normalized));
  }, [items, search]);

  const iconOptions = useMemo(() => iconOptionsForScope(activeScope), [activeScope]);
  const filteredIconOptions = useMemo(() => {
    const normalized = iconSearch.trim().toLowerCase();
    if (!normalized) return iconOptions;
    return iconOptions.filter((option) => option.label.toLowerCase().includes(normalized) || option.key.toLowerCase().includes(normalized));
  }, [iconOptions, iconSearch]);

  function showToast(type: "success" | "error" | "info", message: string) {
    setToast({ type, message });
  }

  function changeScope(scope: CategoryPreferenceScope) {
    setActiveScope(scope);
    setSearch("");
    setIconSearch("");
  }

  function openEditor(item?: EditableCategory) {
    const next = item ?? {
      scope: activeScope,
      key: `custom-${Date.now().toString(36)}`,
      label: "",
      baseLabel: "Nueva categoría",
      iconKey: defaultIconByScope[activeScope],
      imagePath: null,
      isEnabled: true,
      sortOrder: items.length + 1,
      isCustom: true,
    };
    setEditing(next);
    setDraftLabel(next.label);
    setDraftIcon(next.iconKey ?? defaultIconByScope[activeScope]);
    setDraftImagePath(next.imagePath ?? null);
    setDraftEnabled(next.isEnabled);
    setIconSearch("");
  }

  async function saveEditing() {
    if (!editing) return;
    const label = draftLabel.trim();
    if (label.length < 2) {
      showToast("error", "El nombre debe tener al menos 2 letras.");
      return;
    }

    const nextKey = editing.isCustom && editing.key.startsWith("custom-") ? `custom-${slugifyCategory(label)}` : editing.key;
    const duplicated = items.some((item) => item.scope === editing.scope && item.key === nextKey && item.key !== editing.key);
    if (duplicated) {
      showToast("error", "Ya existe una categoría con esa key. Cambiá un poco el nombre.");
      return;
    }

    const payload: CategoryPreference = {
      ...editing,
      key: nextKey,
      label,
      iconKey: draftIcon,
      imagePath: draftImagePath,
      isEnabled: draftEnabled,
      sortOrder: editing.sortOrder,
    };
    const saved = await upsertCategoryPreference(payload);
    const itemToStore = saved ?? payload;
    setPreferences((current) => [...current.filter((item) => !(item.scope === editing.scope && item.key === editing.key) && !(item.scope === itemToStore.scope && item.key === itemToStore.key)), itemToStore]);
    showToast(saved ? "success" : "info", saved ? "Categoría guardada y sincronizada." : "Guardado en esta sesión. Con Supabase activo se sincroniza automáticamente.");
    setEditing(null);
  }

  async function handleImageUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !editing) return;

    setUploadingImage(true);
    const result = await uploadCategoryImage({
      file,
      scope: editing.scope,
      key: editing.key.startsWith("custom-") && draftLabel.trim() ? draftLabel.trim() : editing.key,
    });
    setUploadingImage(false);

    if (!result.ok) {
      showToast("error", result.message);
      return;
    }

    setDraftImagePath(result.publicUrl);
    showToast("success", "Imagen subida. Guardá la categoría para aplicarla.");
  }

  async function resetOrDeleteEditing() {
    if (!editing) return;
    const ok = await deleteCategoryPreference(editing.scope, editing.key);
    setPreferences((current) => current.filter((item) => !(item.scope === editing.scope && item.key === editing.key)));
    showToast(ok ? "success" : "info", editing.isCustom ? "Categoría eliminada." : "Categoría restaurada al catálogo base.");
    setEditing(null);
  }

  const toastClass = toast?.type === "error" ? "bg-pink-50 text-monkey-pink" : toast?.type === "info" ? "bg-yellow-50 text-orange-700" : "bg-green-50 text-monkey-greenDark";

  return (
    <AppShell>
      <section className="page-pad pt-6">
        <Link href="/settings" className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-black text-monkey-muted shadow-card">
          <ArrowLeft className="h-4 w-4" /> Configuración
        </Link>

        <div className="mt-5 rounded-[30px] bg-gradient-to-br from-green-50 via-white to-yellow-50 p-5 shadow-card">
          <div className="flex items-start gap-3">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-[20px] bg-white shadow-card"><Tags className="h-5 w-5 text-monkey-green" /></div>
            <div className="min-w-0">
              <p className="text-[11px] font-black uppercase tracking-[.1em] text-monkey-greenDark">v2.27 upload</p>
              <h1 className="mt-1 text-2xl font-black leading-tight">Personalizar categorías</h1>
              <p className="mt-2 text-sm font-bold leading-relaxed text-monkey-muted">Editá nombres, monitos e iconos; también podés subir una imagen propia segura desde el móvil.</p>
            </div>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-2 rounded-[22px] bg-gray-100 p-1">
          {categoryTabs.map((tab) => (
            <button key={tab.scope} type="button" onClick={() => changeScope(tab.scope)} className={cn("h-11 rounded-[18px] text-[11px] font-black transition", activeScope === tab.scope ? "bg-white text-monkey-greenDark shadow-card" : "text-monkey-muted")}>
              {tab.label}
            </button>
          ))}
        </div>

        <section className="mt-5 rounded-[28px] bg-white p-4 shadow-card">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="text-lg font-black">{currentTab.label}</h2>
              <p className="mt-1 text-xs font-bold leading-relaxed text-monkey-muted">{currentTab.helper}</p>
            </div>
            <button type="button" onClick={() => openEditor()} className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full bg-monkey-green px-3 text-xs font-black text-white shadow-card transition active:scale-95">
              <Plus className="h-4 w-4" /> Crear
            </button>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2 text-center text-[11px] font-black">
            <span className="rounded-[16px] bg-green-50 p-2 text-monkey-greenDark">Visibles<br />{enabledCount}</span>
            <span className="rounded-[16px] bg-purple-50 p-2 text-monkey-purple">Custom<br />{customCount}</span>
            <span className="rounded-[16px] bg-gray-50 p-2 text-monkey-muted">Ocultas<br />{hiddenCount}</span>
          </div>

          {toast ? <p className={cn("mt-3 rounded-[18px] px-3 py-2 text-xs font-black", toastClass)}>{toast.message}</p> : null}
          {loading ? <p className="mt-5 text-center text-sm font-bold text-monkey-muted">Cargando categorías…</p> : null}

          <label className="mt-4 flex items-center gap-2 rounded-[18px] bg-gray-50 px-3 py-2">
            <Search className="h-4 w-4 shrink-0 text-monkey-muted" />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por nombre o key" className="min-w-0 flex-1 bg-transparent text-sm font-bold outline-none placeholder:text-gray-400" />
          </label>

          <div className="mt-4 space-y-3">
            {filteredItems.map((item) => (
              <article key={`${item.scope}-${item.key}`} className={cn("flex items-center gap-3 rounded-[22px] border p-3 transition", item.isEnabled ? "border-gray-100 bg-gray-50" : "border-gray-100 bg-white opacity-70")}>
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-[18px] bg-white shadow-sm"><AssetThumb icon={item.iconKey ?? undefined} src={item.imagePath} size={34} /></span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2"><h3 className="truncate text-sm font-black">{item.label}</h3>{item.isCustom ? <span className="rounded-full bg-purple-50 px-2 py-0.5 text-[10px] font-black text-monkey-purple">Custom</span> : null}</div>
                  <p className="mt-1 truncate text-[11px] font-bold text-monkey-muted">key: {item.key}</p>
                </div>
                <span className={cn("grid h-8 w-8 shrink-0 place-items-center rounded-full", item.isEnabled ? "bg-green-50 text-monkey-greenDark" : "bg-gray-100 text-monkey-muted")}>{item.isEnabled ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}</span>
                <button type="button" onClick={() => openEditor(item)} className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white text-monkey-muted shadow-sm active:scale-95" aria-label={`Editar ${item.label}`}><Edit3 className="h-4 w-4" /></button>
              </article>
            ))}
            {!loading && filteredItems.length === 0 ? <p className="rounded-[20px] bg-gray-50 px-4 py-5 text-center text-sm font-bold text-monkey-muted">No hay categorías con ese filtro.</p> : null}
          </div>
        </section>

        <section className="mt-5 rounded-[26px] bg-white/80 p-4 shadow-card">
          <div className="flex gap-3"><SlidersHorizontal className="mt-0.5 h-5 w-5 shrink-0 text-monkey-green" /><p className="text-xs font-bold leading-relaxed text-monkey-muted">La analítica usa keys estables. Podés cambiar el nombre visible o el icono sin romper reportes históricos.</p></div>
        </section>
      </section>

      <FormSheet open={Boolean(editing)} title={editing?.isCustom ? "Nueva categoría" : "Editar categoría"} subtitle="Pensado para móvil: nombre, icono y visibilidad." submitLabel="Guardar categoría" onClose={() => setEditing(null)} onSubmit={saveEditing}>
        <div className="rounded-[22px] bg-gray-50 p-3">
          <div className="flex items-center gap-3">
            <span className="grid h-16 w-16 shrink-0 place-items-center rounded-[22px] bg-white shadow-sm"><AssetThumb icon={draftIcon} src={draftImagePath} size={46} /></span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-base font-black">{draftLabel.trim() || editing?.baseLabel || "Nueva categoría"}</p>
              <p className="mt-1 truncate text-[11px] font-bold text-monkey-muted">{editing?.isCustom ? "Key custom" : `Base: ${editing?.baseLabel}`}</p>
            </div>
          </div>
        </div>

        <Field label="Nombre visible" value={draftLabel} onChange={(event) => setDraftLabel(event.target.value)} placeholder="Ej. Entreno, Cole, Terapia" />

        <label className="block">
          <span className="mb-2 block text-xs font-black uppercase tracking-[.08em] text-monkey-muted">Visible</span>
          <button type="button" onClick={() => setDraftEnabled((value) => !value)} className={cn("flex h-12 w-full items-center justify-between rounded-[18px] px-4 text-sm font-black", draftEnabled ? "bg-green-50 text-monkey-greenDark" : "bg-gray-100 text-monkey-muted")}>
            {draftEnabled ? "Activa en selectores" : "Oculta de selectores"}
            {draftEnabled ? <CheckCircle2 className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
          </button>
        </label>

        <div className="rounded-[22px] border border-green-100 bg-green-50/70 p-3">
          <div className="flex items-start gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-[16px] bg-white text-monkey-green shadow-sm"><ImagePlus className="h-5 w-5" /></div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-black uppercase tracking-[.08em] text-monkey-greenDark">Imagen propia</p>
              <p className="mt-1 text-xs font-bold leading-relaxed text-monkey-muted">Subí PNG, JPG, WEBP o GIF de máximo 2 MB. Se guarda en Supabase Storage y se aplica al guardar.</p>
            </div>
          </div>
          <label className={cn("mt-3 flex h-12 cursor-pointer items-center justify-center gap-2 rounded-[18px] bg-white text-sm font-black text-monkey-greenDark shadow-sm transition active:scale-95", uploadingImage && "pointer-events-none opacity-70")}>
            <UploadCloud className="h-4 w-4" />
            {uploadingImage ? "Subiendo imagen…" : draftImagePath ? "Cambiar imagen subida" : "Subir imagen"}
            <input type="file" accept="image/png,image/jpeg,image/webp,image/gif" className="hidden" onChange={handleImageUpload} disabled={uploadingImage} />
          </label>
          {draftImagePath ? (
            <button type="button" onClick={() => setDraftImagePath(null)} className="mt-2 h-10 w-full rounded-[16px] bg-white/70 text-xs font-black text-monkey-muted transition active:scale-95">Usar icono del catálogo</button>
          ) : null}
        </div>

        <div>
          <span className="mb-2 block text-xs font-black uppercase tracking-[.08em] text-monkey-muted">Catálogo base</span>
          <label className="mb-2 flex items-center gap-2 rounded-[16px] bg-gray-50 px-3 py-2">
            <Search className="h-4 w-4 shrink-0 text-monkey-muted" />
            <input value={iconSearch} onChange={(event) => setIconSearch(event.target.value)} placeholder="Buscar icono" className="min-w-0 flex-1 bg-transparent text-sm font-bold outline-none placeholder:text-gray-400" />
          </label>
          <div className="grid max-h-[290px] grid-cols-3 gap-2 overflow-y-auto pr-1">
            {filteredIconOptions.map((option) => (
              <button key={option.key} type="button" onClick={() => { setDraftIcon(option.key); setDraftImagePath(null); }} className={cn("min-w-0 rounded-[20px] border p-2 text-center transition active:scale-95", !draftImagePath && draftIcon === option.key ? "border-monkey-green bg-green-50 text-monkey-greenDark" : "border-gray-100 bg-gray-50 text-monkey-muted")}>
                <AssetThumb icon={option.key} size={42} className="mx-auto" />
                <span className="mt-1 block truncate text-[10px] font-black">{option.label}</span>
              </button>
            ))}
          </div>
          {filteredIconOptions.length === 0 ? <p className="mt-2 rounded-[16px] bg-yellow-50 px-3 py-2 text-xs font-bold text-orange-700">No encontré iconos con ese filtro.</p> : null}
        </div>

        {editing ? (
          <button type="button" onClick={resetOrDeleteEditing} className={cn("flex h-12 w-full items-center justify-center gap-2 rounded-[18px] text-sm font-black transition active:scale-95", editing.isCustom ? "bg-pink-50 text-monkey-pink" : "bg-gray-100 text-monkey-muted")}>
            {editing.isCustom ? <Trash2 className="h-4 w-4" /> : <RotateCcw className="h-4 w-4" />}
            {editing.isCustom ? "Eliminar categoría custom" : "Restaurar categoría base"}
          </button>
        ) : null}

        <p className="flex gap-2 rounded-[18px] bg-green-50 px-3 py-3 text-xs font-bold leading-relaxed text-monkey-muted"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-monkey-green" />Los cambios se aplican a los selectores sin cambiar la key histórica usada por la analítica. Las imágenes propias quedan en Storage y pueden reemplazarse luego.</p>
      </FormSheet>
    </AppShell>
  );
}
