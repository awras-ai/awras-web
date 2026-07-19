"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode } from "react";
import { KeycloakProvider } from "@/context/KeycloakContext";

const queryClient = new QueryClient();

export function Providers({ children }: { children: ReactNode }) {
  return (
    <KeycloakProvider>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </KeycloakProvider>
  );
}
