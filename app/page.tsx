import Image from "next/image";
import Link from "next/link";

const confetti = [
  { className: "c-green", style: { left: "58%", top: "9%", width: 10, height: 34, rotate: "-14deg" } },
  { className: "c-pink", style: { left: "67%", top: "8%", width: 8, height: 15, rotate: "35deg" } },
  { className: "c-yellow", style: { right: "13%", top: "10%", width: 16, height: 16, rotate: "45deg" } },
  { className: "c-orange", style: { left: "24%", top: "17%", width: 16, height: 16, rotate: "45deg" } },
  { className: "c-purple", style: { right: "27%", top: "17%", width: 16, height: 16, rotate: "45deg" } },
  { className: "c-yellow", style: { right: "10%", top: "21%", width: 12, height: 34, rotate: "-38deg" } },
  { className: "c-white", style: { left: "10%", top: "43%", width: 13, height: 32, rotate: "-42deg" } },
  { className: "c-orange", style: { right: "14%", top: "43%", width: 17, height: 17, rotate: "45deg" } },
  { className: "c-pink", style: { left: "9%", top: "66%", width: 16, height: 16, rotate: "45deg" } },
  { className: "c-yellow", style: { right: "11%", top: "58%", width: 12, height: 34, rotate: "-39deg" } },
  { className: "c-blue", style: { right: "14%", top: "63%", width: 16, height: 16, rotate: "45deg" } },
];

export default function BrandLogoScreen() {
  return (
    <main className="brand-screen" aria-label="Monkey Checks brand screen">
      <section className="brand-hero">
        <div className="brand-light" />

        {confetti.map((item, index) => (
          <span
            key={`${item.className}-${index}`}
            className={`brand-confetti ${item.className}`}
            style={{ ...item.style, animationDelay: `${index * 0.12}s` }}
          />
        ))}

        <div className="brand-copy">
          <p>Welcome to</p>
          <h1>monkey</h1>
        </div>

        <div className="brand-monkey" aria-hidden="true">
          <Image
            src="/images/monkey-mascot-full.png"
            alt="Mascota Monkey Checks"
            fill
            priority
            sizes="360px"
            className="brand-monkey-img"
          />
        </div>

        <section className="brand-card">
          <h2>Plan your day, build good habits and have fun doing it!</h2>
          <Link href="/register" className="brand-cta">
            Get Started
          </Link>
          <div className="brand-dots" aria-label="Intro progress">
            <span className="active" />
            <span />
            <span />
          </div>
        </section>
      </section>
    </main>
  );
}
