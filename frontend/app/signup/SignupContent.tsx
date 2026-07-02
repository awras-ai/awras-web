"use client";

import { useEffect } from "react";
import { useKeycloak } from "@/context/KeycloakContext";
import { Loader2 } from "lucide-react";

export function SignupContent() {
  const { keycloak, initialized } = useKeycloak();

  useEffect(() => {
    if (!initialized) return;
    keycloak?.login({
      action: "register",
      redirectUri: `${window.location.origin}/dashboard`,
    });
  }, [initialized, keycloak]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Redirecting to sign up...</p>
      </div>
    </div>
  );
}
