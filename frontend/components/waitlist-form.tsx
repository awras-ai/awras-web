"use client";

import React from "react";
import { Loader2, Check } from "lucide-react";
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

  return (
    <div className="w-full max-w-2xl mx-auto">
      {subscription.isSuccess ? (
        <div className="flex flex-col items-center justify-center p-8 md:p-10 bg-black text-white border border-border text-center animate-in fade-in zoom-in duration-300 rounded-lg">
          <div className="h-14 w-14 bg-white text-black rounded-full flex items-center justify-center mb-6">
            <Check className="h-8 w-8" />
          </div>
          <h3 className="text-2xl font-black mb-3">You are on the list!</h3>
          <p className="text-white/80 font-light mb-8 max-w-sm">
            Thank you for joining Awras. We will email you as soon as we launch.
          </p>
          <button
            onClick={handleReset}
            className="text-sm font-semibold underline underline-offset-4 hover:text-white/70"
          >
            Add another email
          </button>
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

          <p className="text-xs text-muted-foreground font-light px-2 text-center">
            {countLoading ? (
              "Loading..."
            ) : (
              <>
                <span className="font-bold text-foreground">{count}+</span>{" "}
                builders have already joined the waitlist
              </>
            )}
          </p>
        </form>
      )}
    </div>
  );
}
