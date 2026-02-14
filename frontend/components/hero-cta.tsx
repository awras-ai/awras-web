"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getUserCount } from "@/lib/api/auth";

export function HeroCTA() {
  const [userCount, setUserCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserCount = async () => {
      try {
        const count = await getUserCount();
        setUserCount(count);
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
    <div className="space-y-8">
      {/* Main CTA Button */}
      <Link href="/signup">
        <Button
          size="lg"
          className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg px-8 py-6 text-base font-medium"
        >
          Get Started
        </Button>
      </Link>

      {/* User Count with Gradient Avatars */}
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
