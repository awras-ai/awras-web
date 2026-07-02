import type { Metadata } from "next";
import { Toaster } from "@/components/ui/sonner";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import Script from "next/script";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const interDisplay = Inter({
  variable: "--font-inter-display",
  subsets: ["latin"],
  weight: ["700"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://awras.site"),
  title: {
    default: "Awras - Preserving Algerian Darija with AI",
    template: "%s | Awras",
  },
  description:
    "An ecosystem dedicated to preserving and empowering the Algerian dialect (Darija) through advanced Artificial Intelligence.",
  keywords: [
    "Algeria",
    "AI",
    "Darija",
    "Artificial Intelligence",
    "NLP",
    "North Africa",
    "Maghreb",
    "LLM",
    "dz",
    "hadra",
    "hadretna",
    "Language Preservation",
  ],
  authors: [{ name: "Awras Team" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://awras.site",
    title: "Awras - The Future of Algerian AI",
    description:
      "Preserving and empowering Algerian Darija using state-of-the-art Artificial Intelligence.",
    siteName: "Awras",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Awras - Algerian AI Ecosystem",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Awras - The Future of Algerian AI",
    description:
      "Preserving and empowering Algerian Darija using state-of-the-art Artificial Intelligence.",
    images: ["/og-image.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Awras",
    url: "https://awras.site",
    logo: "https://awras.site/logo.png",
    description:
      "An ecosystem dedicated to preserving and empowering the Algerian dialect (Darija) through advanced Artificial Intelligence.",
    sameAs: [
      "https://github.com/awras-ai",
    ],
    knowsAbout: [
      "Artificial Intelligence",
      "Natural Language Processing",
      "Algerian Darija",
      "Arabic Dialects",
      "Speech Recognition",
      "Machine Learning",
    ],
    areaServed: {
      "@type": "Country",
      name: "Algeria",
    },
    contactPoint: {
      "@type": "ContactPoint",
      email: "awras.ai.dz@gmail.com",
      contactType: "General Inquiry",
    },
  };

  const webSiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Awras",
    url: "https://awras.site",
    potentialAction: {
      "@type": "SearchAction",
      target: "https://awras.site/search?q={search_term_string}",
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <html lang="en">
      <head>
        <Script
          id="organization-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <Script
          id="website-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteSchema) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${interDisplay.variable} antialiased`}
      >
        <Providers>{children}</Providers>
        <Toaster />
        <Script
          data-goatcounter="https://awras.goatcounter.com/count"
          src="//gc.zgo.at/count.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
