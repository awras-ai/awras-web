"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { X, ArrowRight } from "lucide-react";

const DISMISSAL_KEY = "awras-announcement-dismissed";

export function AnnouncementBar() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has dismissed the announcement
    const isDismissed = localStorage.getItem(DISMISSAL_KEY);
    setIsVisible(!isDismissed);
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem(DISMISSAL_KEY, "true");
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="relative z-50 w-full bg-[#14b8a6] text-white py-1 px-4">
      <div className="max-w-7xl mx-auto flex items-center justify-center relative">
        <Link
          href="/annotation"
          className="flex items-center gap-2 text-sm md:text-base font-medium hover:opacity-90 transition-opacity group"
        >
          <span>✨</span>
          <span>Start annotating Darija words and definitions today</span>
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </Link>

        {/* Close button */}
        <button
          onClick={handleDismiss}
          className="absolute right-0 p-1 hover:bg-white/10 rounded-md transition-colors"
          aria-label="Dismiss announcement"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
