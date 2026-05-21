import { getAssetSrc } from "@/lib/asset-library";
import { cn } from "@/lib/utils";

type AssetThumbProps = {
  icon?: string | null;
  src?: string | null;
  alt?: string;
  size?: number;
  className?: string;
  imageClassName?: string;
};

function resolveAssetSource(icon?: string | null, src?: string | null) {
  if (src) return src;
  if (!icon) return null;
  if (icon.startsWith("http://") || icon.startsWith("https://") || icon.startsWith("/")) return icon;
  return getAssetSrc(icon);
}

export function AssetThumb({ icon, src, alt = "", size = 32, className = "", imageClassName = "" }: AssetThumbProps) {
  const resolvedSrc = resolveAssetSource(icon, src);

  if (resolvedSrc) {
    return (
      <span className={cn("inline-grid shrink-0 place-items-center overflow-hidden", className)} style={{ width: size, height: size }}>
        <img src={resolvedSrc} alt={alt} className={cn("h-full w-full object-contain", imageClassName)} loading="lazy" decoding="async" />
      </span>
    );
  }

  return (
    <span className={cn("inline-grid shrink-0 place-items-center text-[1.25em]", className)} style={{ width: size, height: size }} aria-hidden={alt ? undefined : true}>
      {icon || "✨"}
    </span>
  );
}
