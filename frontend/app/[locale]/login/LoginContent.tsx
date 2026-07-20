"use client";

import { useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useKeycloak } from "@/context/KeycloakContext";
import { Loader2 } from "lucide-react";

export function LoginContent() {
  const t = useTranslations("Login");
  const locale = useLocale();
  const { keycloak, initialized } = useKeycloak();

  useEffect(() => {
    if (!initialized) return;
    keycloak?.login({
      redirectUri: `${window.location.origin}/${locale}/annotation`,
    });
  }, [initialized, keycloak, locale]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">{t("redirecting")}</p>
      </div>
    </div>
  );
}
