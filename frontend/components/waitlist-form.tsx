"use client";

import type React from "react";
import { useState } from "react";
import { Loader2, Check } from "lucide-react";

export function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");

    setTimeout(() => {
      console.log("[v0] Mock API request: Email collected", email);
      setStatus("success");
      setEmail("");
    }, 1500);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {status === "success" ? (
        <div className="flex flex-col items-center justify-center p-8 md:p-10 bg-black text-white border border-border text-center animate-in fade-in zoom-in duration-300">
          <div className="h-14 w-14 bg-white text-black flex items-center justify-center mb-6">
            <Check className="h-7 w-7" />
          </div>
          <h3 className="text-2xl font-black mb-3">You're on the list!</h3>
          <p className="text-white/80 font-light mb-8 max-w-sm">
            Thank you for joining Awras. We'll keep you updated on our progress
            and be the first to know when we launch.
          </p>
          <button
            onClick={() => setStatus("idle")}
            className="text-sm font-semibold underline underline-offset-4 hover:text-white/70 transition-colors"
          >
            Register another email
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              required
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 rounded-sm border border-border bg-white px-6 py-4 text-base outline-none transition-all placeholder:text-muted-foreground focus:border-foreground/50 focus:ring-2 focus:ring-foreground/10 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={status === "loading"}
            />
            <button
              type="submit"
              disabled={status === "loading"}
              className="inline-flex items-center justify-center rounded-sm bg-black px-8 py-4 text-base font-semibold text-white transition-all hover:shadow-lg hover:bg-black/90 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 whitespace-nowrap"
            >
              {status === "loading" ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Joining...
                </>
              ) : (
                "Join Waitlist"
              )}
            </button>
          </div>
          <p className="text-xs text-muted-foreground font-light px-2">
            We should write how many people have already joined the waitlist
            here.
          </p>
        </form>
      )}
    </div>
  );
}
