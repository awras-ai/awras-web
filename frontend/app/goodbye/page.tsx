import type { Metadata } from "next";
import { GoodbyeContent } from "./GoodbyeContent";

export const metadata: Metadata = {
  title: "Demo Ended",
  description:
    "The Awras demo period has ended. Thank you for your interest in Algerian Darija AI preservation.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function GoodbyePage() {
  return <GoodbyeContent />;
}
