import type { Metadata } from "next";
import { LoginContent } from "./LoginContent";

export const metadata: Metadata = {
  title: "Sign In",
  description:
    "Sign in to your Awras account to access the Algerian AI ecosystem and contribute to Darija language preservation.",
  openGraph: {
    title: "Sign In | Awras - Algerian AI Platform",
    description:
      "Access your Awras account to contribute to Algerian Darija AI research and language preservation.",
    url: "https://awras.site/login",
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
    title: "Sign In | Awras - Algerian AI Platform",
    description:
      "Access your Awras account to contribute to Algerian Darija AI research.",
    images: ["/og-image.jpg"],
  },
};

export default function LoginPage() {
  return <LoginContent />;
}
