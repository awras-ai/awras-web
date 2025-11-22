import { Hero } from "@/components/hero";
import { VisionSection } from "@/components/vision-section";
import { WaitlistSection } from "@/components/waitlist-section";
import { Footer } from "@/components/footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-black selection:bg-black selection:text-white">
      <Hero />
      <VisionSection />
      <WaitlistSection />
      <Footer />
    </main>
  );
}
