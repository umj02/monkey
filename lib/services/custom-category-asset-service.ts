import { createOptionalClient } from "@/lib/supabase/client";
import { getUserId } from "@/lib/services/supabase-data-service";
import type { CategoryPreferenceScope } from "@/lib/services/category-preferences-service";
import { slugifyCategory } from "@/lib/category-catalog";

export const CUSTOM_CATEGORY_ASSETS_BUCKET = "custom-category-assets";

const allowedTypes = new Set(["image/png", "image/jpeg", "image/webp", "image/gif"]);
const maxUploadBytes = 2 * 1024 * 1024;

function extensionFromFile(file: File) {
  const byName = file.name.split(".").pop()?.toLowerCase();
  if (byName && ["png", "jpg", "jpeg", "webp", "gif"].includes(byName)) return byName === "jpeg" ? "jpg" : byName;
  if (file.type === "image/png") return "png";
  if (file.type === "image/jpeg") return "jpg";
  if (file.type === "image/webp") return "webp";
  if (file.type === "image/gif") return "gif";
  return "png";
}

export type UploadCategoryImageResult =
  | { ok: true; publicUrl: string; storagePath: string }
  | { ok: false; message: string };

export async function uploadCategoryImage({
  file,
  scope,
  key,
}: {
  file: File;
  scope: CategoryPreferenceScope;
  key: string;
}): Promise<UploadCategoryImageResult> {
  const supabase = createOptionalClient() as any;
  const userId = await getUserId();

  if (!supabase || !userId) {
    return { ok: false, message: "Supabase no está configurado o la sesión no está activa." };
  }

  if (!allowedTypes.has(file.type)) {
    return { ok: false, message: "Usá una imagen PNG, JPG, WEBP o GIF." };
  }

  if (file.size > maxUploadBytes) {
    return { ok: false, message: "La imagen debe pesar máximo 2 MB." };
  }

  const safeKey = slugifyCategory(key || file.name || "categoria");
  const extension = extensionFromFile(file);
  const storagePath = `${userId}/${scope}/${safeKey}-${Date.now()}.${extension}`;

  const { error } = await supabase.storage
    .from(CUSTOM_CATEGORY_ASSETS_BUCKET)
    .upload(storagePath, file, {
      cacheControl: "3600",
      contentType: file.type,
      upsert: true,
    });

  if (error) {
    return { ok: false, message: error.message || "No se pudo subir la imagen." };
  }

  const { data } = supabase.storage.from(CUSTOM_CATEGORY_ASSETS_BUCKET).getPublicUrl(storagePath);
  const publicUrl = data?.publicUrl;

  if (!publicUrl) {
    return { ok: false, message: "La imagen subió, pero no se pudo obtener la URL pública." };
  }

  return { ok: true, publicUrl, storagePath };
}
