import { Database, Brain, Rocket, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { getTranslations } from "next-intl/server";

const stepIcons = {
  collection: Database,
  training: Brain,
  deployment: Rocket,
  feedback: Users,
} as const;

const stepKeys = ["collection", "training", "deployment", "feedback"] as const;

export async function ProcessSection() {
  const t = await getTranslations("Process");

  const processSteps = stepKeys.map((key, index) => ({
    id: String(index + 1).padStart(2, "0"),
    label: t(`steps.${key}.label`),
    title: t(`steps.${key}.title`),
    description: t(`steps.${key}.description`),
    icon: stepIcons[key],
  }));

  return (
    <section
      id="process"
      className="py-12 md:py-20 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-6xl mx-auto w-full">
        {/* Header Section */}
        <div className="mb-8">
          <p className="text-xs font-semibold text-black/40 tracking-widest uppercase mb-3">
            02 — {t("label")}
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
        <Card className="border-black/10 p-0 shadow-sm overflow-hidden">
          <CardContent className="p-0">
            {processSteps.map((step, index) => (
              <div
                key={step.id}
                className={cn(
                  "flex flex-col md:flex-row md:items-start gap-4 md:gap-10 px-6 md:px-10 transition-colors duration-200 hover:bg-gray-50",
                  index === 0 ? "pt-8 md:pt-12" : "pt-8 md:pt-10",
                  index === processSteps.length - 1 ? "pb-8 md:pb-12" : "pb-8 md:pb-10 border-b border-black/10"
                )}
              >
                {/* Left Column: Number & Label */}
                <div className="flex flex-col w-36 md:w-44 shrink-0">
                  <div className="w-fit">
                    <span
                      className="text-4xl md:text-5xl font-bold leading-none"
                      style={{ color: "#14b8a6" }}
                    >
                      {step.id}
                    </span>
                    <div
                      className="h-1.5 w-12 mt-2"
                      style={{ backgroundColor: "#14b8a6" }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-black/40 tracking-widest mt-4 uppercase">
                    {step.label}
                  </span>
                </div>

                {/* Right Column: Text Content */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-full border border-black/10 flex items-center justify-center bg-black/5 shrink-0">
                      <step.icon className="w-5 h-5 text-black/70" />
                    </div>
                    <h3 className="text-xl font-bold">
                      {step.title}
                    </h3>
                  </div>
                  <p className="text-black/60 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
