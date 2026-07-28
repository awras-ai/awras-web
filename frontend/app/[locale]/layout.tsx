import type { Metadata } from "next";
import { Toaster } from "@/components/ui/sonner";
import { NextIntlClientProvider } from "next-intl";
import { Geist, Geist_Mono, Inter, IBM_Plex_Sans_Arabic } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import Script from "next/script";
import {
  getMessages,
  getTranslations,
  setRequestLocale,
} from "next-intl/server";

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

const ibmPlexSansArabic = IBM_Plex_Sans_Arabic({
  variable: "--font-arabic",
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
});

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });

  return {
    metadataBase: new URL("https://awras.site"),
    title: {
      default: t("titleDefault"),
      template: "%s | Awras",
    },
    description: t("description"),
    keywords: t.raw("keywords"),
    authors: [{ name: "Awras Team" }],
    openGraph: {
      type: "website",
      locale: locale === "ar" ? "ar_DZ" : "en_US",
      url: "https://awras.site",
      title: t("ogTitle"),
      description: t("ogDescription"),
      siteName: "Awras",
      images: [
        {
          url: "/og-image.jpg",
          width: 1200,
          height: 630,
          alt: t("ogImageAlt"),
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: t("twitterTitle"),
      description: t("twitterDescription"),
      images: ["/og-image.jpg"],
    },
  };
}

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
}> &
  Props) {
  const { locale } = await params;
  // Required for statically rendered routes (e.g. /[locale]/blog/[slug]) —
  // without it next-intl falls back to the default locale at build time.
  setRequestLocale(locale);
  const dir = locale === "ar" ? "rtl" : "ltr";
  const t = await getTranslations({ locale, namespace: "Metadata" });

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Awras",
    url: "https://awras.site",
    logo: "https://awras.site/logo.png",
    description: t("description"),
    sameAs: ["https://github.com/awras-ai"],
    knowsAbout: t.raw("orgKnowsAbout"),
    areaServed: {
      "@type": "Country",
      name: t("orgAreaServed"),
    },
    contactPoint: {
      "@type": "ContactPoint",
      email: "awras.ai.dz@gmail.com",
      contactType: t("orgContactType"),
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
  const messages = await getMessages({ locale });

  return (
    <html lang={locale} dir={dir}>
      <head>
        <Script
          id="organization-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
        />
        <Script
          id="website-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteSchema) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${interDisplay.variable} ${ibmPlexSansArabic.variable} antialiased`}
      >
        <NextIntlClientProvider messages={messages}>
          <Providers>{children}</Providers>
        </NextIntlClientProvider>
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
