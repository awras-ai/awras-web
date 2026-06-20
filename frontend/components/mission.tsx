import { Card, CardContent } from "@/components/ui/card";

export function Mission() {
  return (
    <section id="mission" className="py-16 md:py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto w-full">
        {/* Header Section */}
        <div className="mb-12">
          <p className="text-xs font-semibold text-black/40 tracking-widest uppercase mb-3">
            01 — Our Mission
          </p>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
            Preserving Darija, <br className="hidden sm:block" />
            <span style={{ color: "#14b8a6" }}>Empowering Algeria.</span>
          </h2>
        </div>

        {/* Content Card */}
        <Card className="border-black/10 shadow-sm">
          <CardContent className="p-6 md:p-10">
            <p className="text-lg text-black/60 leading-relaxed">
              Awras is on a mission to digitize the Algerian soul by building an
              AI ecosystem that truly speaks our language. We are dedicated to
              preserving Darija through high-fidelity LLMs and speech tools that
              capture the unique cultural nuances and regional accents of Algeria,
              empowering local innovation with a foundation that is authentically
              ours.
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
