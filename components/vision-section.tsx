"use client";

import { motion } from "framer-motion";
import { BrainCircuit, Mic, MessageSquareShare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
  {
    title: "LLM",
    description:
      "Large Language Model fine-tuned on vast datasets of Algerian Darija to understand context, nuance, and cultural references.",
    icon: BrainCircuit,
    delay: 0.2,
  },
  {
    title: "ASR",
    description:
      "Automatic Speech Recognition capable of transcribing spoken Darija with high accuracy, handling various regional accents.",
    icon: Mic,
    delay: 0.3,
  },
  {
    title: "TTS",
    description:
      "Text-to-Speech synthesis that produces natural-sounding speech with authentic Algerian intonation and pronunciation.",
    icon: MessageSquareShare,
    delay: 0.4,
  },
];

export function VisionSection() {
  return (
    <section
      id="vision"
      className="py-32 bg-background border-b border-border/40 relative z-0"
    >
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Side: Title */}
          <div className="lg:col-span-4 lg:sticky lg:top-32">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tighter">
                The Ecosystem
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed">
                We are building the foundational layer for Algerian AI
                applications. A complete suite of tools designed to digitize our
                dialect.
              </p>
            </motion.div>
          </div>

          {/* Right Side: Cards */}
          <div className="lg:col-span-8 grid grid-cols-1 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: feature.delay }}
              >
                <Card className="bg-secondary/30 border-border/40 shadow-none hover:bg-secondary/50 transition-colors duration-300">
                  <CardHeader className="flex flex-row items-center gap-4 pb-2">
                    <div className="w-10 h-10 bg-black flex items-center justify-center">
                      <feature.icon className="w-5 h-5 text-white" />
                    </div>
                    <CardTitle className="text-xl font-bold tracking-tight">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed pl-[3.5rem]">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
