import { Hero } from "@/components/hero";
import { Marquee } from "@/components/marquee";
import { Footer } from "@/components/footer";
import { FAQSection } from "@/components/faq-section";
import { Mission } from "@/components/mission";
import { Navbar } from "@/components/navbar";
// import { ModelComparisonSection } from "@/components/model-comparison";
import { AnnouncementBar } from "@/components/announcement-bar";
import { ProcessSection } from "@/components/process-section";

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-black selection:bg-black selection:text-white relative">
      <div className="sticky top-0 z-50 w-full">
        <AnnouncementBar />
        <Navbar />
      </div>
      <div className="squares-background" />
      <div className="relative z-10">
        <Hero />
        <Marquee />
        <Mission />
        {/* <ModelComparisonSection /> */}
        {/* <VisionSection /> */}
        <ProcessSection />
        {/* <ProcessTimelineSection /> */}
        <FAQSection />
        <Footer />
      </div>
    </main>
  );
}
