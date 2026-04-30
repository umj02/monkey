export function ProgressCard({ percent }: { percent: number }) {
  return (
    <section className="relative overflow-hidden rounded-monkey bg-gradient-to-br from-monkey-purple to-monkey-green p-5 text-white shadow-soft">
      <p className="text-sm font-medium opacity-90">Progreso del día</p>
      <div className="mt-2 flex items-end justify-between">
        <strong className="text-5xl leading-none">{percent}%</strong>
        <span className="text-5xl">🐵</span>
      </div>
      <div className="mt-5 h-3 rounded-full bg-white/25">
        <div className="h-3 rounded-full bg-monkey-yellow" style={{ width: `${percent}%` }} />
      </div>
    </section>
  );
}
