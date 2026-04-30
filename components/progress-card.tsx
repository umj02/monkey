import { MonkeyAvatar } from "@/components/monkey-avatar";

export function ProgressCard({ percent }: { percent: number }) {
  return (
    <section className="relative h-[140px] overflow-hidden rounded-card bg-gradient-to-br from-monkey-purple via-[#7C6CF5] to-monkey-green p-5 text-white shadow-soft">
      <div className="absolute -right-6 -top-8 h-32 w-32 rounded-full bg-white/10" />
      <MonkeyAvatar
        size={88}
        variant="full"
        className="absolute -bottom-2 right-2 animate-floaty"
        imageClassName="object-bottom"
      />
      <p className="text-sm font-bold opacity-95">Progreso del día</p>
      <strong className="mt-2 block text-[46px] font-black leading-none tracking-tight">{percent}%</strong>
      <div className="mt-5 h-3 overflow-hidden rounded-pill bg-white/30">
        <div className="h-full rounded-pill bg-monkey-yellow transition-all duration-500" style={{ width: `${percent}%` }} />
      </div>
    </section>
  );
}
