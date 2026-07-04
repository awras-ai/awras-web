import type { Metadata } from "next";
import { DictionaryListContent } from "./DictionaryListContent";

export const metadata: Metadata = {
  title: "Dictionary Datasets",
  description: "Choose a dictionary dataset to annotate",
};

export default function DictionaryListPage() {
  return <DictionaryListContent />;
}
