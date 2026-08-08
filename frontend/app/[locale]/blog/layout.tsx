import type { Metadata } from "next";
import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Blog" });

  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    openGraph: {
      title: t("ogTitle"),
      description: t("ogDescription"),
    },
    twitter: {
      card: "summary_large_image",
      title: t("twitterTitle"),
      description: t("twitterDescription"),
    },
  };
}

export default function BlogLayout({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen bg-white text-black selection:bg-black selection:text-white relative flex flex-col">
      <div className="sticky top-0 z-50 w-full">
        <Navbar />
      </div>
      <div className="flex-1">{children}</div>
      <Footer />
    </main>
  );
}
