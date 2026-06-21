"use client";

import { useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import { Loader2 } from "lucide-react";

export function SignupContent() {
  useEffect(() => {
    authClient.signOut().then(() => {
      authClient.signIn.oauth2({
        providerId: "keycloak",
        callbackURL: "/dashboard",
        newUserCallbackURL: "/goodbye",
        errorCallbackURL: "/",
      });
    });
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Redirecting to login...</p>
      </div>
    </div>
  );
}
