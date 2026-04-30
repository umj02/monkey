import Image from "next/image";
import Link from "next/link";

const confetti = [
  "left-[13%] top-[18%] h-5 w-2 rotate-[-28deg] bg-[#B7F36D]",
  "right-[18%] top-[16%] h-4 w-4 rotate-45 rounded-[5px] bg-[#FFD54F]",
  "left-[28%] top-[25%] h-4 w-4 rotate-45 rounded-[5px] bg-[#FF8A30]",
  "right-[27%] top-[27%] h-4 w-4 rotate-45 rounded-[5px] bg-[#7C4DFF]",
  "right-[12%] top-[35%] h-8 w-3 rotate-[-38deg] bg-[#FFD54F]",
  "left-[13%] bottom-[35%] h-8 w-3 rotate-[-42deg] bg-white/75",
  "right-[16%] bottom-[34%] h-4 w-4 rotate-45 rounded-[5px] bg-[#FF7A30]",
  "left-[16%] bottom-[20%] h-4 w-4 rotate-45 rounded-[5px] bg-[#FFB3BA]",
  "right-[17%] bottom-[17%] h-4 w-4 rotate-45 rounded-[5px] bg-[#8EDCF6]",
  "right-[11%] bottom-[26%] h-7 w-3 rotate-[-40deg] bg-[#FFD54F]",
  "left-[21%] bottom-[31%] h-2 w-2 rounded-full bg-[#AEE6CF]",
];

function MonkeyWordmark() {
  return (
    <span className="inline-flex items-end justify-center gap-[2px] text-[58px] font-black lowercase leading-none tracking-[-0.08em] text-white drop-shadow-[0_5px_12px_rgba(22,71,18,.12)]">
      <span>monkey</span>
    </span>
  );
}

export default function BrandLogoScreen() {
  return (
    <main className="relative mx-auto flex min-h-dvh w-full max-w-[430px] overflow-hidden bg-[#FCF8EE] text-[#111827] shadow-[0_26px_80px_rgba(17,24,39,.16)]">
      <section className="relative min-h-dvh w-full overflow-hidden bg-[radial-gradient(circle_at_30%_15%,#91DA67_0%,#72C84E_38%,#4CAF50_100%)] px-6 pb-8 pt-11">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(255,255,255,.22),transparent_42%),linear-gradient(180deg,rgba(255,255,255,.08),rgba(0,0,0,.08))]" />

        {confetti.map((item, index) => (
          <span
            key={item}
            className={`absolute z-10 rounded-[4px] shadow-sm animate-floaty ${item}`}
            style={{ animationDelay: `${index * 0.16}s` }}
          />
        ))}

        <div className="relative z-20 mx-auto max-w-[330px] text-center">
          <p className="text-[18px] font-extrabold leading-none text-white/95 drop-shadow-sm">Welcome to</p>
          <h1 className="mt-3 flex justify-center" aria-label="monkey">
            <MonkeyWordmark />
          </h1>
        </div>

        <div className="pointer-events-none absolute inset-x-0 top-[235px] z-20 mx-auto h-[430px] w-[360px] animate-floaty">
          <Image
            src="/images/monkey-mascot-full.png"
            alt="Mascota Monkey Checks"
            fill
            priority
            sizes="360px"
            className="object-contain drop-shadow-[0_22px_28px_rgba(64,91,31,.24)]"
          />
        </div>

        <section className="absolute inset-x-6 bottom-9 z-30 rounded-[32px] bg-white/95 px-7 pb-8 pt-8 text-center shadow-[0_22px_50px_rgba(17,24,39,.16)] backdrop-blur-xl">
          <h2 className="mx-auto max-w-[280px] text-[24px] font-extrabold leading-[1.28] tracking-[-0.03em] text-[#1F2937]">
            Plan your day, build good habits and have fun doing it!
          </h2>

          <Link
            href="/register"
            className="mt-8 flex h-14 items-center justify-center rounded-full bg-gradient-to-r from-[#3FBF31] to-[#4CAF50] text-[16px] font-extrabold text-white shadow-[0_16px_30px_rgba(34,197,94,.35)] transition active:scale-95"
          >
            Get Started
          </Link>

          <div className="mt-6 flex justify-center gap-2" aria-label="Intro progress">
            <span className="h-2.5 w-5 rounded-full bg-[#4CAF50]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#D9D9D9]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#D9D9D9]" />
          </div>
        </section>
      </section>
    </main>
  );
}
