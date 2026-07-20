import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";

function StatusIndicator({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-black/60 uppercase">
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
    <section className="relative flex items-center px-4 pt-24 pb-24 md:pt-30 md:pb-40 overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 end-0 w-96 h-96 bg-black/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 start-0 w-96 h-96 bg-black/5 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-6xl mx-auto w-full space-y-8 md:space-y-12">
        {/* Desktop: status indicator at top right of content */}
        <div className="hidden md:flex justify-end">
          <StatusIndicator label={t("badge")} />
        </div>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-12">
          <div className="space-y-6 max-w-2xl">
            {/* Mobile: status indicator above title */}
            <div className="md:hidden">
              <StatusIndicator label={t("badge")} />
            </div>

            {/* Main heading */}
            <h1 className="text-5xl font-bold tracking-tighter sm:text-6xl md:text-7xl font-[family-name:var(--font-inter-display)]">
              {t.rich("headline", {
                accent: (chunks) => (
                  <span style={{ color: "#14b8a6" }}>{chunks}</span>
                ),
              })}
            </h1>

            {/* Description */}
            <p className="text-lg md:text-xl text-black/60 font-light leading-relaxed">
              {t("description")}
            </p>
          </div>

          {/* CTA Button */}
          <div className="flex-shrink-0">
            <Button size="lg" asChild>
              <Link href="/annotation">{t("cta")}</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
