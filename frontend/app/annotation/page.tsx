import type { Metadata } from "next";
import { AnnotationHubContent } from "./AnnotationHubContent";

export const metadata: Metadata = {
  title: "Annotation",
  description: "Choose an annotation task",
};

export default function AnnotationPage() {
  return <AnnotationHubContent />;
}
