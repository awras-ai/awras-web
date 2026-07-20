import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Script from "next/script";
import { getTranslations } from "next-intl/server";

const faqKeys = [
  "whatIsAwras",
  "whyDarijaMatters",
  "howToContribute",
  "howAwrasBenefits",
  "whatIsNext",
] as const;

export async function FAQSection() {
  const t = await getTranslations("FAQ");

  const faqData = faqKeys.map((key) => ({
    question: t(`items.${key}.question`),
    answer: t(`items.${key}.answer`),
  }));

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
            03 — {t("label")}
          </p>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
            {t.rich("headline", {
              accent: (chunks) => (
                <span style={{ color: "#14b8a6" }}>{chunks}</span>
              ),
            })}
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
              <AccordionTrigger className="text-start text-base font-medium hover:no-underline py-6 text-black hover:text-black/80 transition-colors">
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
            {t("contactPrompt")}{" "}
            <a
              href="mailto:awras.ai.dz@gmail.com"
              className="text-black font-medium hover:underline"
            >
              {t("contactLink")}
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
