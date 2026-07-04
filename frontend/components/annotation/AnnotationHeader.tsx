"use client";

import Link from "next/link";
import { LogOut } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useKeycloak } from "@/context/KeycloakContext";

export function AnnotationHeader() {
  const { keycloak, user } = useKeycloak();

  const displayName = user?.name || user?.email || "User";
  const initials = displayName
    .split(" ")
    .map((p: string) => p.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handleLogout = () => {
    keycloak?.logout({ redirectUri: `${window.location.origin}/` });
  };

  return (
    <header className="border-b border-black/10 bg-white/80 backdrop-blur-xl sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold tracking-tighter">
          Awras
        </Link>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-xs bg-black text-white font-medium">
                {initials}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium text-black/70 hidden sm:block truncate max-w-[160px]">
              {displayName}
            </span>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="border-black/10 text-black/60 hover:text-black hover:border-black/20"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
