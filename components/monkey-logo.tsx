export function MonkeyLogo({ size = 72 }: { size?: number }) {
  return (
    <div
      className="grid place-items-center rounded-full bg-white shadow-soft"
      style={{ width: size, height: size }}
      aria-label="Monkey logo"
    >
      <span style={{ fontSize: size * 0.55 }}>🐵</span>
    </div>
  );
}
