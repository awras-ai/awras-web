"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, LogOut } from "lucide-react";
import { useKeycloak } from "@/context/KeycloakContext";

export function DashboardContent() {
  const { keycloak, initialized, authenticated, user } = useKeycloak();
  console.log(keycloak?.token);
  // Redirect unauthenticated users to Keycloak login
  useEffect(() => {
    if (!initialized) return;
    if (!authenticated) {
      keycloak?.login({
        redirectUri: `${window.location.origin}/dashboard`,
      });
    }
  }, [initialized, authenticated, keycloak]);

  const handleLogout = () => {
    keycloak?.logout({
      redirectUri: `${window.location.origin}/`,
    });
  };
  useEffect(() => {
    if (!authenticated || !keycloak) return;
    keycloak
      .updateToken(30) // refresh if < 30s left
      .then(() =>
        fetch(`${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}api/v1/count/`, {
          headers: { Authorization: `Bearer ${keycloak.token}` },
        }),
      )
      .then((r) => r.json())
      .then((data) => console.log(data))
      .catch(console.error);
  }, [authenticated, keycloak]);

  // Show spinner while keycloak initializes or while redirecting unauthenticated users
  if (!initialized || !authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const displayName = user?.name || user?.email || "User";
  const nameParts = displayName.split(" ");
  const initials = nameParts
    .map((p: string) => p.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-white/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold tracking-tighter">Awras</h1>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 md:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-8"
        >
          <Card>
            <CardHeader className="flex flex-row items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={user?.picture || undefined} />
                <AvatarFallback className="text-lg">{initials}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-2xl">
                  Welcome, {user?.name || "User"}!
                </CardTitle>
                <CardDescription>
                  Welcome to Awras - Your Algerian AI Platform
                </CardDescription>
              </div>
            </CardHeader>
          </Card>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Email</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{user?.email ?? "N/A"}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Account Status</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {user?.emailVerified ? "Verified" : "Pending Verification"}
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Dashboard Coming Soon</CardTitle>
              <CardDescription>
                More features and tools will be available here soon.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Stay tuned for exciting AI tools, community features, and more.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}
