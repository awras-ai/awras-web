"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

interface TimeLeft {
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
}

function calculateTimeLeft(targetDate: Date): TimeLeft {
  const difference = targetDate.getTime() - new Date().getTime();

  if (difference <= 0) {
    return { hours: 0, minutes: 0, seconds: 0, total: 0 };
  }

  return {
    hours: Math.floor(difference / (1000 * 60 * 60)),
    minutes: Math.floor((difference / 1000 / 60) % 60),
    seconds: Math.floor((difference / 1000) % 60),
    total: difference,
  };
}

function formatTimeLeft(timeLeft: TimeLeft): string {
  const pad = (num: number) => num.toString().padStart(2, "0");
  return `${pad(timeLeft.hours)}:${pad(timeLeft.minutes)}:${pad(timeLeft.seconds)}`;
}

export function AnnouncementBar() {
  const [isVisible, setIsVisible] = useState(true);
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);

  // Feb 16, 2026 at 12:00 AM
  const countdownEndDate = new Date("2026-02-16T00:00:00");

  useEffect(() => {
    // Calculate initial time left
    setTimeLeft(calculateTimeLeft(countdownEndDate));

    // Update every second
    const countdownInterval = setInterval(() => {
      const remaining = calculateTimeLeft(countdownEndDate);
      setTimeLeft(remaining);

      // Clear interval when time is up
      if (remaining.total <= 0) {
        clearInterval(countdownInterval);
      }
    }, 1000);

    return () => clearInterval(countdownInterval);
  }, [countdownEndDate]);

  // Don't render if countdown is finished or manually dismissed
  if (!isVisible || (timeLeft && timeLeft.total <= 0)) {
    return null;
  }

  return (
    <div className="sticky top-0 z-50 w-full bg-[#235CF3] text-white py-2 px-4">
      <div className="max-w-7xl mx-auto flex items-center justify-center relative">
        <div className="flex items-center gap-2 text-sm font-medium">
          <span>✨</span>
          <span>
            awras-chat is now available for{" "}
            {timeLeft ? formatTimeLeft(timeLeft) : "00:00:00"} hours !
          </span>
        </div>

        {/* Close button */}
        <button
          onClick={() => setIsVisible(false)}
          className="absolute right-0 p-1 hover:bg-white/10 rounded-md transition-colors"
          aria-label="Dismiss announcement"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
