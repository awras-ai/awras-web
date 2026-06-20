import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Script from "next/script";

const faqData = [
  {
    question: "What is Awras?",
    answer:
      "Awras is an open-ended project focused on the linguistic preservation and digital evolution of the Algerian dialect. By developing specialized datasets and models for LLM (Large Language Model), ASR (Automatic Speech Recognition) and TTS (Text-to-Speech), we are ensuring that Darija is a first-class citizen in the age of generative AI.",
  },
  {
    question: "Why darija matters?",
    answer:
      "Either you consider it as a language or a dialect, it is somthing that is being spoken for a long time, many parts of our history is only told or registered in videos. making these models will enable us to mine the knowledge and culture that is being stored in these videos, and make it accessible. \n Also because it's cool 🙂.",
  },
  {
    question: "How can I contribute to Awras?",
    answer:
      "Anyone passionate about building cool stuff, you don't need to be a coder to build the future of Darija! Engineers can join our dev team, while native speakers can contribute high-quality voice data, translations through our community platform.",
  },
  {
    question: "How does Awras benefit Algeria?",
    answer:
      "Awras helps bridge the digital divide by making AI technology accessible in Algerian Darija. This enables better accessibility for non-French/Arabic speakers, preserves our linguistic heritage, and creates opportunities for local businesses and developers to build culturally-relevant AI applications.",
  },
  {
    question: "What is next after awras-chat-v0?",
    answer:
      "Stay tuned for our upcoming platform launch where you can easily upload and share your contributions with the community. weather it's an audio data, translation, or even a cool darija slang or rare expressions!",
  },
];

export function FAQSection() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqData.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <section id="faq" className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-white">
      <Script
        id="faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <div className="max-w-6xl mx-auto w-full">
        {/* Header Section */}
        <div className="mb-12">
          <p className="text-xs font-semibold text-black/40 tracking-widest uppercase mb-3">
            03 — FAQ
          </p>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
            Frequently Asked{" "}
            <span style={{ color: "#14b8a6" }}>Questions.</span>
          </h2>
        </div>

        {/* FAQ Accordion */}
        <Accordion type="single" collapsible className="w-full">
          {faqData.map((faq, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              className="border-b border-black/10"
            >
              <AccordionTrigger className="text-left text-base font-medium hover:no-underline py-6 text-black hover:text-black/80 transition-colors">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-black/60 leading-relaxed pb-6">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        {/* Contact CTA */}
        <div className="mt-12">
          <p className="text-black/60">
            Still have questions?{" "}
            <a
              href="mailto:awras.ai.dz@gmail.com"
              className="text-black font-medium hover:underline"
            >
              Contact us
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
