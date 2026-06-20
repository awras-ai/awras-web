import { Database, Brain, Rocket, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const processSteps = [
  {
    id: "01",
    label: "COLLECTION",
    title: "Data Collection",
    description:
      "Gathering diverse datasets of Algerian Darija from various sources including text, audio, and cultural content to build a comprehensive foundation.",
    icon: Database,
  },
  {
    id: "02",
    label: "TRAINING",
    title: "Model Training",
    description:
      "Fine-tuning advanced AI models on the collected data, ensuring they understand context, cultural nuances, and regional variations of Algerian dialect.",
    icon: Brain,
  },
  {
    id: "03",
    label: "DEPLOYMENT",
    title: "Evaluation & Deployment",
    description:
      "Rigorous testing and validation of model performance followed by deployment to production environments for real-world usage.",
    icon: Rocket,
  },
  {
    id: "04",
    label: "FEEDBACK",
    title: "User Feedback & Improvement",
    description:
      "Continuous learning from user interactions and feedback to refine models, improve accuracy, and adapt to evolving language usage patterns.",
    icon: Users,
  },
];

export function ProcessSection() {
  return (
    <section
      id="process"
      className="py-12 md:py-20 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-6xl mx-auto w-full">
        {/* Header Section */}
        <div className="mb-8">
          <p className="text-xs font-semibold text-black/40 tracking-widest uppercase mb-3">
            02 — The Process
          </p>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
            How we build <br className="hidden sm:block" />
            <span style={{ color: "#14b8a6" }}>Stuff.</span>
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
