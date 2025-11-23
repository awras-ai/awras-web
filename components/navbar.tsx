"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4 bg-white/80 backdrop-blur-xl border-b border-neutral-200/50 shadow-sm">
      <div className="flex items-center gap-2">
        <Link href="/" className="text-xl font-bold tracking-tighter">
          Awras
        </Link>
      </div>
      <div className="flex items-center gap-6">
        <Link
          href="#vision"
          className="text-sm font-medium hover:text-neutral-600 transition-colors"
        >
          Vision
        </Link>
        <Link
          href="#process"
          className="text-sm font-medium hover:text-neutral-600 transition-colors"
        >
          Process
        </Link>
        <Link href="#waitlist">
          <Button
            size="sm"
            className="rounded-sm px-6 bg-black text-white hover:bg-neutral-800 transition-colors"
          >
            Join Waitlist
          </Button>
        </Link>
      </div>
    </nav>
  );
}
