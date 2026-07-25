import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import { ArrowRight, Sparkles, PenLine } from "lucide-react";

function StatusIndicator({ label }: { label: string }) {
  return (
    <div className="inline-flex items-center gap-2 px-3.5 py-3 rounded-full bg-transparent text-xs font-semibold tracking-wider text-black/70 uppercase">
      <span className="relative flex h-2 w-2">
        <span
          className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#14b8a6] opacity-75"
          aria-hidden="true"
        ></span>
        <span
          className="relative inline-flex rounded-full h-2 w-2 bg-[#14b8a6]"
          aria-hidden="true"
        ></span>
      </span>
      {label}
    </div>
  );
}

export async function Hero() {
  const t = await getTranslations("Hero");

  return (
    <section className="relative min-h-[80vh] flex flex-col justify-center items-center text-center px-4 py-12 md:py-20 overflow-hidden bg-transparent">

      {/* Decorative Full-screen wrapper for robust positioning */}
      <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden hidden md:block ">
        {/* Hand-Drawn Cartoon Arrow (Desktop Only) - Anchored to Center */}
        <svg
          className="absolute"
          style={{ width: "300px", height: "300px", top: "65%", left: "47.3%", marginLeft: "-450px", marginTop: "-100px" }}
          viewBox="0 0 300 300"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Arrow Curve */}
          <path
            d="M 40,40 C -20,150 50,220 280,220"
            stroke="black"
            strokeWidth="10"
            strokeLinecap="round"
            fill="none"
          />
          {/* Arrow Head */}
          <path
            d="M 230,170 Q 250,200 290,220 Q 240,250 230,260"
            stroke="black"
            strokeWidth="10"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </svg>
      </div>

      {/* Massive Bottom Green Gradient (Moneco Style) */}
      <div 
        className="absolute inset-0 pointer-events-none z-10"
        style={{
          background: "radial-gradient(ellipse 120% 70% at 50% 110%, rgba(20, 184, 166, 0.35) 0%, rgba(20, 184, 166, 0.1) 50%, transparent 100%)"
        }}
      ></div>

      <div className="max-w-5xl mx-auto w-full my-auto space-y-10 md:space-y-12 relative z-20">

        {/* Centered Top Block */}
        <div className="space-y-5 max-w-3xl mx-auto relative z-30">
          <StatusIndicator label={t("badge")} />

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight text-black leading-[1.12] font-[family-name:var(--font-inter-display)]">
            {t.rich("headline", {
              accent: (chunks) => (
                <span style={{ color: "#14b8a6" }}>{chunks}</span>
              ),
            })}
          </h1>

          {/* Description */}
          <p className="text-base sm:text-lg text-black/60 font-light leading-relaxed max-w-xl mx-auto">
            {t("description")}
          </p>
        </div>

        {/* Single Engaging CTA */}
        <div className="flex justify-center pt-4 sm:pt-8 z-30">
          <div className="relative inline-flex">
            <Link
              href="/annotation"
              className="peer group inline-flex items-center justify-center gap-3 px-8 py-4 sm:px-10 sm:py-5 bg-black text-white rounded-full overflow-hidden transition-transform duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-[#14b8a6]/25 focus:outline-none"
            >
              {/* Hover subtle glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#14b8a6]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-in-out"></div>


              <span className="text-base sm:text-lg font-bold tracking-wide relative z-10">
                {t("cta")}
              </span>

              <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 relative z-10 transition-transform duration-300 group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}