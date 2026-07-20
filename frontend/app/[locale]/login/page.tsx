import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { LoginContent } from "./LoginContent";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Login" });
  const tMeta = await getTranslations({ locale, namespace: "Metadata" });

  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    openGraph: {
      title: t("ogTitle"),
      description: t("ogDescription"),
      url: "https://awras.site/login",
      images: [
        {
          url: "/og-image.jpg",
          width: 1200,
          height: 630,
          alt: tMeta("ogImageAlt"),
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

export default function LoginPage() {
  return <LoginContent />;
}
