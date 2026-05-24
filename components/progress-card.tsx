import { AssetThumb } from "@/components/asset-thumb";

export function ProgressCard({ percent }: { percent: number }) {
  const isComplete = percent >= 100;

  return (
    <section className="relative h-[154px] overflow-hidden rounded-card bg-gradient-to-br from-monkey-purple via-[#7C6CF5] to-monkey-green p-5 text-white shadow-soft">
      <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,.08),transparent_38%,rgba(255,255,255,.12)_62%,transparent)] animate-heroShimmer" />
      <div className="absolute -right-4 top-[-18px] h-36 w-36 rounded-full bg-white/10 animate-heroBlob" />
      <div className="absolute right-10 top-10 h-24 w-24 rounded-full bg-white/10 animate-heroBlobSlow" />
      <div className="absolute right-[38px] top-1/2 h-32 w-32 -translate-y-1/2 rounded-full bg-white/10 blur-[1px]" />
      <AssetThumb
        icon="monkey-hero-sentado"
        size={132}
        className="absolute bottom-3 right-4 animate-floaty"
        imageClassName="object-contain object-center drop-shadow-[0_16px_20px_rgba(17,24,39,.16)]"
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
