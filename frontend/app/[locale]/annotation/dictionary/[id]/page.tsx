import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { DictionaryAnnotationContent } from "./DictionaryAnnotationContent";

type Props = { params: Promise<{ id: string; locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "DictionaryAnnotation" });

  return {
    title: t("metaTitle"),
  };
}

export default async function DictionaryAnnotationPage({ params }: Props) {
  const { id } = await params;
  return <DictionaryAnnotationContent datasetId={id} />;
}
