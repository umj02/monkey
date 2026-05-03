import { AssetThumb } from "@/components/asset-thumb";

export function ProgressCard({ percent }: { percent: number }) {
  const isComplete = percent >= 100;

  return (
    <section className="relative h-[154px] overflow-hidden rounded-card bg-gradient-to-br from-monkey-purple via-[#7C6CF5] to-monkey-green p-5 text-white shadow-soft">
      <div className="absolute -right-6 -top-8 h-36 w-36 rounded-full bg-white/10" />
      <div className="absolute right-2 top-6 h-24 w-24 rounded-full bg-white/10" />
      <AssetThumb
        icon="hero-sentado"
        size={132}
        className="absolute -bottom-4 right-0 animate-floaty"
        imageClassName="object-bottom"
      />
      <div className="relative z-10 max-w-[240px]">
        <p className="text-sm font-bold opacity-95">
          {isComplete ? "¡Excelente!" : "Progreso del día"}
        </p>
        {isComplete ? (
          <h2 className="mt-2 text-[21px] font-black leading-tight tracking-tight">
            Has logrado cumplir tu progreso de hoy
          </h2>
        ) : (
          <strong className="mt-2 block text-[46px] font-black leading-none tracking-tight">
            {percent}%
          </strong>
        )}
        <div className="mt-5 h-3 overflow-hidden rounded-pill bg-white/30">
          <div
            className="h-full rounded-pill bg-monkey-yellow transition-all duration-500"
            style={{ width: `${Math.min(percent, 100)}%` }}
          />
        </div>
      </div>
    </section>
  );
}
