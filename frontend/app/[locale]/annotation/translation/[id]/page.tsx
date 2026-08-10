import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { TranslationAnnotationContent } from "./TranslationAnnotationContent";

type Props = { params: Promise<{ id: string; locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({
    locale,
    namespace: "TranslationAnnotation",
  });

  return {
    title: t("metaTitle"),
  };
}

export default async function TranslationAnnotationPage({ params }: Props) {
  const { id } = await params;
  return <TranslationAnnotationContent datasetId={id} />;
}
