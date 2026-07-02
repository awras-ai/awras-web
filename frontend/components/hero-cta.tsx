"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useKeycloak } from "@/context/KeycloakContext";
import posthog from "posthog-js";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_BASE_URL;

export function HeroCTA() {
  const [userCount, setUserCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const { authenticated } = useKeycloak();

  const href = authenticated
    ? process.env.NEXT_PUBLIC_CHAT_PLATFORM_URL || "https://chat.awras.site"
    : "/signup";

  useEffect(() => {
    const fetchUserCount = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}api/v1/auth/count`);
        if (res.ok) {
          const data = await res.json();
          setUserCount(data.count);
        }
      } catch (error) {
        console.error("Failed to fetch user count:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserCount();

    const userCountInterval = setInterval(fetchUserCount, 10000);

    return () => clearInterval(userCountInterval);
  }, []);

  return (
    <div className="">
      <Button
        asChild
        size="lg"
        className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg px-8 py-6 text-base font-medium"
      >
        <a
          href={href}
          onClick={() => posthog.capture("cta_clicked", { location: "hero" })}
        >
          Get Started
        </a>
      </Button>

      <div className="flex justify-center items-center gap-4 pt-4">
        <div className="flex flex-col items-start">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
            <span className="text-sm text-muted-foreground">
              {loading
                ? "Loading users..."
                : userCount
                  ? `${userCount} users already joined`
                  : "Join the community"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
