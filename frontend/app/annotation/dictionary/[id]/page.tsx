import type { Metadata } from "next";
import { DictionaryAnnotationContent } from "./DictionaryAnnotationContent";

export const metadata: Metadata = {
  title: "Annotate Dictionary",
};

type Props = { params: Promise<{ id: string }> };

export default async function DictionaryAnnotationPage({ params }: Props) {
  const { id } = await params;
  return <DictionaryAnnotationContent datasetId={id} />;
}
