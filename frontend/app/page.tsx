import { Hero } from "@/components/hero";
import { Footer } from "@/components/footer";
import { FAQSection } from "@/components/faq-section";
import { Mission } from "@/components/mission";

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-black selection:bg-black selection:text-white relative">
      {/* <Navbar /> */}
      <div className="squares-background" />
      <div className="relative z-10">
        <Hero />
        <Mission />
        {/* <ModelComparisonSection /> */}
        {/* <VisionSection /> */}
        {/* <ProcessSection /> */}
        {/* <ProcessTimelineSection /> */}
        <FAQSection />
        <Footer />
      </div>
    </main>
  );
}
