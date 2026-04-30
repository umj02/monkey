export function MonkeyLogo({ size = 72 }: { size?: number }) {
  return (
    <div
      className="grid place-items-center rounded-full bg-white shadow-card"
      style={{ width: size, height: size }}
      aria-label="Monkey Checks mascot"
    >
      <span style={{ fontSize: size * 0.58 }}>🐵</span>
    </div>
  );
}
