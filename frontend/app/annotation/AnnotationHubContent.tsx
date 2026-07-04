"use client";

import { useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { BookOpen, ChevronRight, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useKeycloak } from "@/context/KeycloakContext";
import { AnnotationHeader } from "@/components/annotation/AnnotationHeader";

export function AnnotationHubContent() {
  const { initialized, authenticated, keycloak } = useKeycloak();

  useEffect(() => {
    if (!initialized) return;
    if (!authenticated) {
      keycloak?.login({ redirectUri: `${window.location.origin}/annotation` });
    }
  }, [initialized, authenticated, keycloak]);

  if (!initialized || !authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: "#14b8a6" }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <AnnotationHeader />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <p className="text-xs font-semibold text-black/40 tracking-widest uppercase mb-3">
            01 — Annotation Tasks
          </p>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-12">
            Choose a{" "}
            <span style={{ color: "#14b8a6" }}>task.</span>
          </h1>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Link href="/annotation/dictionary">
              <Card className="border-black/10 shadow-sm hover:bg-neutral-50 transition-colors duration-200 cursor-pointer group">
                <CardContent className="p-6 md:p-10 flex items-start justify-between gap-4">
                  <div>
                    <div className="w-8 h-8 rounded-full border border-black/10 flex items-center justify-center bg-black/5 mb-4">
                      <BookOpen className="w-4 h-4 text-black/70" />
                    </div>
                    <h2 className="text-lg font-semibold tracking-tight mb-1">
                      Dictionary Annotation
                    </h2>
                    <p className="text-sm text-black/60 leading-relaxed">
                      Review and correct word definitions in Darija to help build our linguistic database.
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-black/30 mt-1 flex-shrink-0 transition-colors group-hover:text-[#14b8a6]" />
                </CardContent>
              </Card>
            </Link>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
