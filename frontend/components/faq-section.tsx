import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const faqData = [
  {
    question: "What is Awras?",
    answer: "Awras is an open-source initiative dedicated to developing AI models that understand and preserve the Algerian dialect (Darija). We build language models, speech recognition systems, and text-to-speech technologies tailored for Algerian culture and identity."
  },
  {
    question: "How can I access Awras AI models?",
    answer: "Our AI models are publicly available and can be accessed through our platform. You can interact with them directly on our website or integrate them into your applications using our API. All models are open-source and available on our GitHub repository."
  },
  {
    question: "Who can contribute to Awras?",
    answer: "Anyone passionate about preserving Algerian culture through AI can contribute. We welcome developers, linguists, data scientists, designers, and community members. Whether you want to contribute code, data, translations, or feedback, there's a place for you in our community."
  },
  {
    question: "How does Awras ensure the data represents Algerian culture?",
    answer: "We collect data from diverse sources across Algeria, including different regions, age groups, and social contexts. Our team includes native Darija speakers who review and validate the data to ensure it accurately represents the richness and diversity of Algerian dialect and culture."
  },
  {
    question: "Is the data collected by Awras publicly available?",
    answer: "Yes, transparency is a core value at Awras. All datasets we collect and curate are made publicly available under open licenses. This ensures that researchers, developers, and the community can benefit from and build upon our work."
  },
  {
    question: "How can I contribute data to Awras?",
    answer: "You can contribute by submitting text samples, audio recordings, or translations through our contribution portal. We also organize community events and data collection campaigns where you can participate and help us build high-quality datasets."
  },
  {
    question: "What types of AI models does Awras develop?",
    answer: "We focus on three main areas: Large Language Models (LLM) for understanding and generating Algerian Darija text, Automatic Speech Recognition (ASR) for transcribing spoken Darija, and Text-to-Speech (TTS) for generating natural-sounding Algerian voice synthesis."
  },
  {
    question: "How does Awras benefit Algeria?",
    answer: "Awras helps bridge the digital divide by making AI technology accessible in Algerian Darija. This enables better accessibility for non-French/Arabic speakers, preserves our linguistic heritage, and creates opportunities for local businesses and developers to build culturally-relevant AI applications."
  },
  {
    question: "Can Awras models be used for commercial purposes?",
    answer: "Yes, our models are released under permissive open-source licenses that allow commercial use. We encourage businesses and entrepreneurs to use our models to build products and services that serve the Algerian market and diaspora."
  },
  {
    question: "How can I stay updated on Awras developments?",
    answer: "Follow us on GitHub for technical updates, join our community forums for discussions, and subscribe to our newsletter for major announcements. We also regularly post updates on our social media channels about new model releases, community events, and partnership opportunities."
  },
  {
    question: "I'm new to AI. How can I learn more and get involved?",
    answer: "We welcome newcomers! Start by exploring our documentation and tutorials. Join our community channels where experienced members are happy to help. We also organize workshops and mentorship programs for those looking to learn about AI and contribute to open-source projects."
  },
  {
    question: "How can I support Awras?",
    answer: "You can support us by contributing your time and skills, spreading the word about our mission, or making a donation to help cover infrastructure and development costs. Every contribution, big or small, helps us advance our mission of preserving Algerian culture through AI."
  }
]

export function FAQSection() {
  return (
    <section id="faq" className="py-24 md:py-32 bg-background">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-muted-foreground text-lg">
            Find answers to common questions about Awras
          </p>
        </div>

        {/* FAQ Accordion */}
        <Accordion type="single" collapsible className="w-full">
          {faqData.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="text-left text-base font-medium hover:no-underline py-5">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        {/* Contact CTA */}
        <div className="mt-12 text-center">
          <p className="text-muted-foreground">
            Still have questions?{" "}
            <a 
              href="mailto:contact@awras.ai" 
              className="text-foreground font-medium hover:underline"
            >
              Contact us
            </a>
          </p>
        </div>
      </div>
    </section>
  )
}
