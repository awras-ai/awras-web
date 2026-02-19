import type { Metadata } from "next";
import { SignupContent } from "./SignupContent";

export const metadata: Metadata = {
  title: "Create Account",
  description:
    "Join the Awras community and contribute to the preservation of Algerian Darija. Create your free account to access AI tools and participate in language research.",
  openGraph: {
    title: "Create Account | Awras - Algerian AI Platform",
    description:
      "Join Awras and help preserve Algerian Darija through AI. Create your account to contribute to language preservation.",
    url: "https://awras.site/signup",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Awras - Algerian AI Ecosystem",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Create Account | Awras - Algerian AI Platform",
    description:
      "Join Awras and help preserve Algerian Darija through AI research and community contribution.",
    images: ["/og-image.jpg"],
  },
};

export default function SignupPage() {
  return <SignupContent />;
}
