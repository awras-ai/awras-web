"use client";

import React, { useEffect } from "react";
import { Loader2 } from "lucide-react";
import confetti from "canvas-confetti";
import { useWaitlist } from "@/hooks/useWaitlist";

export function WaitlistForm() {
  const {
    email,
    setEmail,
    count,
    countLoading,
    subscription,
    handleSubmit,
    handleReset,
  } = useWaitlist();

  // Trigger confetti on successful subscription
  useEffect(() => {
    if (subscription.isSuccess) {
      const duration = 1500;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

      const randomInRange = (min: number, max: number) =>
        Math.random() * (max - min) + min;

      const interval = window.setInterval(() => {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        });
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        });
      }, 250);
    }
  }, [subscription.isSuccess]);

  return (
    <div className="w-full max-w-2xl mx-auto">
      {subscription.isSuccess ? (
        <div className="flex flex-col items-center justify-center gap-4">
          <p className="text-sm text-foreground font-medium text-center">
            Thank you for joining the waitlist!
          </p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground font-light px-2">
            {countLoading ? (
              "Loading..."
            ) : (
              <>
                <div className="relative">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="absolute inset-0 w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
                </div>
                <span className="font-bold text-foreground">{count}</span>{" "}
                People have already joined the waitlist.
              </>
            )}
          </div>
          <p className="text-xs text-muted-foreground font-light px-2 text-center">
            We'll contact you as soon as we launch!
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              required
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={subscription.isPending}
              className="flex-1 rounded-sm border border-border bg-white px-6 py-4 text-base outline-none placeholder:text-muted-foreground focus:border-foreground/50 focus:ring-2 focus:ring-foreground/10 disabled:opacity-50"
            />

            <button
              type="submit"
              disabled={subscription.isPending || !email.trim()}
              className="inline-flex items-center justify-center rounded-sm bg-black px-8 py-4 text-base font-semibold text-white hover:bg-black/90 focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:opacity-50 transition-all whitespace-nowrap"
            >
              {subscription.isPending ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Joining...
                </>
              ) : (
                "Join Waitlist"
              )}
            </button>
          </div>

          {subscription.isError && (
            <p className="text-sm text-red-500 px-2 animate-in slide-in-from-top">
              {subscription.error.message}
            </p>
          )}

          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground font-light px-2">
            {countLoading ? (
              "Loading..."
            ) : (
              <>
                <div className="relative">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="absolute inset-0 w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
                </div>
                <span className="font-bold text-foreground">{count}</span>{" "}
                People have already joined the waitlist.
              </>
            )}
          </div>
        </form>
      )}
    </div>
  );
}
