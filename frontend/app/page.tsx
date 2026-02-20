import { Hero } from "@/components/hero";
import { Footer } from "@/components/footer";
import { FAQSection } from "@/components/faq-section";
import { Mission } from "@/components/mission";
// import { ModelComparisonSection } from "@/components/model-comparison";
import { AnnouncementBar } from "@/components/announcement-bar";

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-black selection:bg-black selection:text-white relative">
      <AnnouncementBar />
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
