import { motion } from "framer-motion";
import { Database, Brain, Rocket, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const processSteps = [
  {
    title: "Data Collection",
    description:
      "Gathering diverse datasets of Algerian Darija from various sources including text, audio, and cultural content to build a comprehensive foundation.",
    icon: Database,
    delay: 0.2,
  },
  {
    title: "Model Training",
    description:
      "Fine-tuning advanced AI models on the collected data, ensuring they understand context, cultural nuances, and regional variations of Algerian dialect.",
    icon: Brain,
    delay: 0.3,
  },
  {
    title: "Evaluation & Deployment",
    description:
      "Rigorous testing and validation of model performance followed by deployment to production environments for real-world usage.",
    icon: Rocket,
    delay: 0.4,
  },
  {
    title: "User Feedback & Improvement",
    description:
      "Continuous learning from user interactions and feedback to refine models, improve accuracy, and adapt to evolving language usage patterns.",
    icon: Users,
    delay: 0.5,
  },
];

export function ProcessSection() {
  return (
    <section
      id="process"
      className="py-32 bg-background border-b border-border/40 relative z-0"
    >
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Side: Title */}
          <div className="lg:col-span-4 lg:sticky lg:top-32">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tighter">
              The Process
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Our continuous loop of improvement ensures our AI models evolve
              with the language, becoming more accurate and culturally relevant
              through each iteration.
            </p>
          </div>

          {/* Right Side: Process Steps */}
          <div className="lg:col-span-8 grid grid-cols-1 gap-6">
            {processSteps.map((step, index) => (
              <div key={step.title} className="w-full">
                <Card className="bg-secondary/30 border-border/40 shadow-none hover:bg-secondary/50 transition-colors duration-300">
                  <CardHeader className="flex flex-row items-center gap-4 pb-2">
                    <div className="relative">
                      <div className="w-10 h-10 bg-black flex items-center justify-center">
                        <step.icon className="w-5 h-5 text-white" />
                      </div>
                      {/* Process step number */}
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-black text-white text-xs flex items-center justify-center rounded-full font-bold">
                        {index + 1}
                      </div>
                    </div>
                    <CardTitle className="text-xl font-bold tracking-tight">
                      {step.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed pl-[3.5rem]">
                      {step.description}
                    </p>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
