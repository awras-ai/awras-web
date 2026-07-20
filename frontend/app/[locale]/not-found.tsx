import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Page Not Found",
  description:
    "The page you are looking for does not exist or has been moved. Explore Awras - Algerian AI ecosystem.",
  robots: {
    index: false,
    follow: true,
  },
};

export default function NotFound() {
  return (
    <main className="min-h-screen bg-white flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto w-full text-center">
        {/* Section Label */}
        <p className="text-xs font-semibold text-black/40 tracking-widest uppercase mb-6">
          Error 404
        </p>

        {/* Heading */}
        <h1 className="text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl mb-6">
          Page <span style={{ color: "#14b8a6" }}>not found.</span>
        </h1>

        {/* Description */}
        <p className="text-lg text-black/60 font-light leading-relaxed max-w-md mx-auto mb-12">
          The page you are looking for does not exist or has been moved.
        </p>

        {/* CTA Button */}
        <Link href="/">
          <Button className="group rounded-full px-6 py-5 text-[14px] font-medium shadow-sm">
            <span>Go Home</span>
            <ArrowUpRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Button>
        </Link>
      </div>
    </main>
  );
}
