import { Hero } from "@/components/hero";
import { VisionSection } from "@/components/vision-section";
import { ProcessSection } from "@/components/process-section";
import { WaitlistSection } from "@/components/waitlist-section";
import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-black selection:bg-black selection:text-white relative">
      <Navbar />
      <div className="squares-background" />
      <div className="relative z-10">
        <Hero />
        <VisionSection />
        <ProcessSection />
        {/* <WaitlistSection /> */}
        <Footer />
      </div>
    </main>
  );
}
