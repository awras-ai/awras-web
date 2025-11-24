import { WaitlistForm } from "@/components/waitlist-form";

export function WaitlistSection() {
  return (
    <section
      id="waitlist"
      className="py-32 px-4 bg-white relative overflow-hidden"
    >
      {/* Background accent */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-black/5 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-5xl md:text-6xl font-black tracking-tight mb-6 leading-tight">
          Be the first to access Awras
        </h2>
        <p className="text-lg md:text-xl text-black/60 font-light mb-12 max-w-2xl mx-auto leading-relaxed">
          We are launching our Darija-finetuned chatbot soon. Sign up for early
          access and help shape the future of AI in Algeria.
        </p>
        <WaitlistForm />
      </div>
    </section>
  );
}
