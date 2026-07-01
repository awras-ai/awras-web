import Keycloak from "keycloak-js";

// keycloak-js is browser-only. This module must never be imported during SSR.
// Use getKeycloak() only inside useEffect or other client-side call sites.
let instance: Keycloak | null = null;

export function getKeycloak(): Keycloak {
  if (typeof window === "undefined") {
    throw new Error("Keycloak can only be instantiated in the browser.");
  }

  if (!instance) {
    instance = new Keycloak({
      url: process.env.NEXT_PUBLIC_KEYCLOAK_URL!,
      realm: process.env.NEXT_PUBLIC_KEYCLOAK_REALM!,
      clientId: process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID!,
    });
  }

  return instance;
}
