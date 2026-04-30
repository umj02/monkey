import Image from "next/image";

type MonkeyAvatarProps = {
  size?: number;
  variant?: "face" | "full";
  className?: string;
  imageClassName?: string;
  priority?: boolean;
};

export function MonkeyAvatar({
  size = 48,
  variant = "face",
  className = "",
  imageClassName = "",
  priority = false
}: MonkeyAvatarProps) {
  const src = variant === "full" ? "/assets/monkey/hero/sentado.png" : "/assets/monkey/faces/face-main.png";

  return (
    <span
      className={`relative inline-grid shrink-0 place-items-center overflow-hidden ${className}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <Image
        src={src}
        alt=""
        fill
        sizes={`${size}px`}
        priority={priority}
        className={`object-contain ${imageClassName}`}
      />
    </span>
  );
}
