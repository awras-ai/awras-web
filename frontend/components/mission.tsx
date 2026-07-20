import { Card, CardContent } from "@/components/ui/card";
import { getTranslations } from "next-intl/server";

export async function Mission() {
  const t = await getTranslations("Mission");

  return (
    <section id="mission" className="py-16 md:py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto w-full">
        {/* Header Section */}
        <div className="mb-12">
          <p className="text-xs font-semibold text-black/40 tracking-widest uppercase mb-3">
            01 — {t("label")}
          </p>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
            {t.rich("headline", {
              break: () => <br className="hidden sm:block" />,
              accent: (chunks) => (
                <span style={{ color: "#14b8a6" }}>{chunks}</span>
              ),
            })}
          </h2>
        </div>

        {/* Content Card */}
        <Card className="border-black/10 shadow-sm">
          <CardContent className="p-6 md:p-10">
            <p className="text-lg text-black/60 leading-relaxed">
              {t("body")}
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
