"use client";

import { motion } from "framer-motion";
import { Timeline } from "@/components/ui/timeline";
import { Database, Brain, Rocket, Users } from "lucide-react";

const processSteps = [
  {
    title: "Data Collection",
    description:
      "Gathering diverse datasets of Algerian Darija from various sources including text, audio, and cultural content to build a comprehensive foundation.",
    icon: Database,
  },
  {
    title: "Model Training",
    description:
      "Fine-tuning advanced AI models on the collected data, ensuring they understand context, cultural nuances, and regional variations of Algerian dialect.",
    icon: Brain,
  },
  {
    title: "Evaluation & Deployment",
    description:
      "Rigorous testing and validation of model performance followed by deployment to production environments for real-world usage.",
    icon: Rocket,
  },
  {
    title: "User Feedback & Improvement",
    description:
      "Continuous learning from user interactions and feedback to refine models, improve accuracy, and adapt to evolving language usage patterns.",
    icon: Users,
  },
];

const timelineData = processSteps.map((step) => ({
  title: step.title,
  content: (
    <div className="flex items-start gap-4">
      <div className="w-10 h-10 bg-black flex items-center justify-center shrink-0">
        <step.icon className="w-5 h-5 text-white" />
      </div>
      <p className="text-muted-foreground leading-relaxed">
        {step.description}
      </p>
    </div>
  ),
}));

export function ProcessTimelineSection() {
  return (
    <section
      id="process-timeline"
      className="py-24 md:py-32 bg-background border-b border-border/40 relative z-0"
    >
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Left Side: Title */}
          <div className="lg:col-span-4 lg:sticky lg:top-32">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tighter">
                The Process
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Our strategic timeline to build and deploy Algerian Darija
                language models. Each phase builds upon the previous to create
                a comprehensive AI ecosystem.
              </p>
            </motion.div>
          </div>

          {/* Right Side: Timeline */}
          <div className="lg:col-span-8">
            <Timeline data={timelineData} />
          </div>
        </div>
      </div>
    </section>
  );
}
