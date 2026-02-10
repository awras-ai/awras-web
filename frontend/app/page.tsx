import { Hero } from "@/components/hero";
import { VisionSection } from "@/components/vision-section";
import { ProcessSection } from "@/components/process-section";
import { ProcessTimelineSection } from "@/components/process-timeline-section";
import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";
import { FAQSection } from "@/components/faq-section";
import { ModelComparisonSection } from "@/components/model-comparison";

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-black selection:bg-black selection:text-white relative">
      <Navbar />
      <div className="squares-background" />
      <div className="relative z-10">
        <Hero />
        <ModelComparisonSection />
        <VisionSection />
        <ProcessSection />
        {/* <ProcessTimelineSection /> */}
        <FAQSection />
        <Footer />
      </div>
    </main>
  );
}
