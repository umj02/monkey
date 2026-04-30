import { MonkeyAvatar } from "@/components/monkey-avatar";

export function MonkeyLogo({ size = 72 }: { size?: number }) {
  return (
    <div
      className="grid place-items-center rounded-full bg-white shadow-card"
      style={{ width: size, height: size }}
      aria-label="Monkey Checks mascot"
    >
      <MonkeyAvatar size={Math.round(size * 0.72)} variant="face" />
    </div>
  );
}
