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

        {/* Engaging CTAs */}
        <div className="flex flex-col justify-center items-center gap-4 pt-4 sm:pt-8 z-30">
          <div className="relative inline-flex">
            <Link
              href="/annotation"
              className="peer group inline-flex items-center justify-center gap-3 px-6 py-3 sm:px-8 sm:py-3.5 bg-black text-white rounded-full overflow-hidden focus:outline-none"
            >
              {/* Hover subtle glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#14b8a6]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-in-out"></div>


              <span className="text-sm sm:text-base font-bold tracking-wide relative z-10">
                {t("cta")}
              </span>

              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 relative z-10 transition-transform duration-300 group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
            </Link>
          </div>

          <div className="relative inline-flex">
            <a
              href="https://discord.gg/kmhEuEsSR"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2.5 px-6 py-3 text-sm font-semibold text-black/70 border border-black/10 rounded-full focus:outline-none hover:text-black hover:border-black/30 transition-colors"
            >
              <svg className="w-4 h-4 text-[#5865F2]" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" />
              </svg>
              <span>{t("discordCta")}</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}