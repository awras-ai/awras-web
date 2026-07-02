"use client";

import { useEffect } from "react";
import { useKeycloak } from "@/context/KeycloakContext";
import { Loader2 } from "lucide-react";

export function LoginContent() {
  const { keycloak, initialized } = useKeycloak();

  useEffect(() => {
    if (!initialized) return;
    keycloak?.login({
      redirectUri: `${window.location.origin}/dashboard`,
    });
  }, [initialized, keycloak]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Redirecting to login...</p>
      </div>
    </div>
  );
}
