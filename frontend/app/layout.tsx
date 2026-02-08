import type { Metadata } from "next";
import { Toaster } from "@/components/ui/sonner";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ReactQueryProvider } from "./providers";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://awras.io"),
  title: {
    default: "Awras - Preserving Algerian Darija with AI",
    template: "%s | Awras",
  },
  description:
    "An ecosystem dedicated to preserving and empowering the Algerian dialect (Darija) through advanced Artificial Intelligence.",
  keywords: [
    "Algeria",
    "AI",
    "Darija",
    "Artificial Intelligence",
    "NLP",
    "North Africa",
    "Maghreb",
    "LLM",
    "dz",
    "hadra",
    "hadretna",
    "Language Preservation",
  ],
  authors: [{ name: "Awras Team" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://awras.io",
    title: "Awras - The Future of Algerian AI",
    description:
      "Preserving and empowering Algerian Darija using state-of-the-art Artificial Intelligence.",
    siteName: "Awras",
  },
  twitter: {
    card: "summary_large_image",
    title: "Awras - The Future of Algerian AI",
    description:
      "Preserving and empowering Algerian Darija using state-of-the-art Artificial Intelligence.",
  },
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ReactQueryProvider>{children}</ReactQueryProvider>
        <Toaster />
      </body>
    </html>
  );
}
