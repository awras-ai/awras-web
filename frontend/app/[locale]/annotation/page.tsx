import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { AnnotationHubContent } from "./AnnotationHubContent";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "AnnotationHub" });

  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

export default function AnnotationPage() {
  return <AnnotationHubContent />;
}
