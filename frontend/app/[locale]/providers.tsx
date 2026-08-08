"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode } from "react";
import { KeycloakProvider } from "@/context/KeycloakContext";
import { NuqsAdapter } from "nuqs/adapters/next/app";

const queryClient = new QueryClient();

export function Providers({ children }: { children: ReactNode }) {
  return (
    <KeycloakProvider>
      <QueryClientProvider client={queryClient}>
        <NuqsAdapter>{children}</NuqsAdapter>
      </QueryClientProvider>
    </KeycloakProvider>
  );
}
