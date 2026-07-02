"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  ReactNode,
} from "react";
import Keycloak from "keycloak-js";
import { getKeycloak } from "@/lib/keycloak";

export interface KeycloakUser {
  name?: string;
  email?: string;
  emailVerified?: boolean;
  picture?: string;
  sub?: string;
}

interface KeycloakContextValue {
  keycloak: Keycloak | null;
  /** true once keycloak.init() has resolved (either authenticated or not) */
  initialized: boolean;
  authenticated: boolean;
  user: KeycloakUser | null;
  token: string | undefined;
}

const KeycloakContext = createContext<KeycloakContextValue>({
  keycloak: null,
  initialized: false,
  authenticated: false,
  user: null,
  token: undefined,
});

function parseUser(kc: Keycloak): KeycloakUser | null {
  if (!kc.tokenParsed) return null;
  return {
    name: kc.tokenParsed["name"] as string | undefined,
    email: kc.tokenParsed["email"] as string | undefined,
    emailVerified: kc.tokenParsed["email_verified"] as boolean | undefined,
    picture: kc.tokenParsed["picture"] as string | undefined,
    sub: kc.tokenParsed["sub"] as string | undefined,
  };
}

export function KeycloakProvider({ children }: { children: ReactNode }) {
  const [keycloak, setKeycloak] = useState<Keycloak | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [user, setUser] = useState<KeycloakUser | null>(null);
  const [token, setToken] = useState<string | undefined>(undefined);
  const didInit = useRef(false);

  useEffect(() => {
    // React StrictMode mounts → unmounts → remounts in dev.
    // Calling init() twice on the same Keycloak instance throws.
    if (didInit.current) return;
    didInit.current = true;

    const kc = getKeycloak();

    kc.onAuthSuccess = () => {
      setAuthenticated(true);
      setToken(kc.token);
      setUser(parseUser(kc));
    };

    kc.onAuthLogout = () => {
      setAuthenticated(false);
      setUser(null);
      setToken(undefined);
    };

    kc.onAuthRefreshSuccess = () => {
      setToken(kc.token);
    };

    kc.onTokenExpired = () => {
      kc.updateToken(30).catch(() => kc.clearToken());
    };

    kc.init({
      pkceMethod: "S256",
      checkLoginIframe: false,
    })
      .then((auth) => {
        setAuthenticated(auth);
        setToken(kc.token);
        setUser(auth ? parseUser(kc) : null);
        setKeycloak(kc);
        setInitialized(true);
      })
      .catch(() => {
        // Even if init fails, store the instance so consumers can call login()
        setKeycloak(kc);
        setInitialized(true);
      });
  }, []);

  return (
    <KeycloakContext.Provider
      value={{ keycloak, initialized, authenticated, user, token }}
    >
      {children}
    </KeycloakContext.Provider>
  );
}

export function useKeycloak() {
  const context = useContext(KeycloakContext);
  if (context === undefined) {
    throw new Error("useKeycloak must be used within a KeycloakProvider");
  }
  return context;
}
