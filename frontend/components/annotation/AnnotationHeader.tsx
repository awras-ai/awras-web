"use client";

import Link from "next/link";
import { LogOut } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#14b8a6] focus-visible:ring-offset-2 transition-all hover:ring-2 hover:ring-black/10 hover:shadow-sm">
              <Avatar className="h-8 w-8 cursor-pointer transition-transform hover:scale-105">
                <AvatarFallback className="text-xs bg-black text-white font-medium">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            <DropdownMenuLabel className="font-normal">
              <p className="text-sm font-medium">{displayName}</p>
              {user?.email && (
                <p className="text-xs text-muted-foreground truncate" title={user.email}>
                  {user.email}
                </p>
              )}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              className="text-red-500 focus:text-red-500 cursor-pointer"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
