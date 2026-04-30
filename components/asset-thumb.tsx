import Image from "next/image";
import { getAssetSrc } from "@/lib/asset-library";
import { cn } from "@/lib/utils";

type AssetThumbProps = {
  icon?: string | null;
  alt?: string;
  size?: number;
  className?: string;
  imageClassName?: string;
};

export function AssetThumb({ icon, alt = "", size = 32, className = "", imageClassName = "" }: AssetThumbProps) {
  const src = getAssetSrc(icon);

  if (src) {
    return (
      <span className={cn("relative inline-grid shrink-0 place-items-center overflow-hidden", className)} style={{ width: size, height: size }}>
        <Image src={src} alt={alt} fill sizes={`${size}px`} className={cn("object-contain", imageClassName)} />
      </span>
    );
  }

  return (
    <span className={cn("inline-grid shrink-0 place-items-center text-[1.25em]", className)} style={{ width: size, height: size }} aria-hidden={alt ? undefined : true}>
      {icon || "✨"}
    </span>
  );
}
