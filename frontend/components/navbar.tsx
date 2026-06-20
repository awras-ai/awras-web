"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: "#mission", label: "Mission" },
    { href: "#process", label: "Process" },
    { href: "#faq", label: "FAQ" },
    // { href: "#about", label: "About" },
    // { href: "/contact", label: "Contact" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-neutral-200/50">
      <div className="flex justify-between items-center h-16 sm:h-20 max-w-6xl mx-auto px-4">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-3"
          aria-label="Awras Home"
        >
          <span className="text-2xl font-bold tracking-tighter text-black">
            awras
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="relative px-4 py-2 text-[14px] font-medium tracking-tight text-neutral-800 hover:text-black transition-colors"
            >
              {link.label}
            </Link>
          ))}

          <div className="mx-3 w-px h-5 bg-neutral-300" aria-hidden="true" />

          <Button
            className="ml-2 group rounded-full px-6 py-5 text-[14px] font-medium shadow-sm"
          >
            <span>Explore More</span>
            <ArrowUpRight
              className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              aria-hidden="true"
            />
          </Button>
        </div>

        {/* Mobile Controls */}
        <div className="flex md:hidden items-center gap-2">
          <button
            type="button"
            className="inline-flex items-center justify-center p-2 rounded-full text-neutral-800 hover:bg-neutral-100 focus:outline-none"
            aria-controls="mobile-menu"
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <span className="sr-only">
              {mobileMenuOpen ? "Close menu" : "Open menu"}
            </span>
            {mobileMenuOpen ? (
              <X className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Menu className="h-5 w-5" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {mobileMenuOpen && (
        <div
          id="mobile-menu"
          className="md:hidden border-t border-neutral-200/50 bg-white/95 backdrop-blur-xl"
        >
          <div className="px-6 pt-4 pb-8 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block px-4 py-2 text-base font-medium text-neutral-800 hover:text-black hover:bg-neutral-50 rounded-md transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-6">
              <Button className="w-full group rounded-full px-6 py-5 text-[14px] font-medium shadow-sm">
                <span>Explore More</span>
                <ArrowUpRight
                  className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  aria-hidden="true"
                />
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
