"use client";

import { useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { BookOpen, Languages, Type, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useKeycloak } from "@/context/KeycloakContext";
import { AnnotationHeader } from "@/components/annotation/AnnotationHeader";
import { usePrimaryDataset } from "@/hooks/useDictionary";

function ComingSoonBadge() {
  return (
    <span className="absolute top-4 right-4 text-[10px] font-semibold px-2.5 py-1 rounded-full bg-black/5 text-black/40 uppercase tracking-wider">
      Coming Soon
    </span>
  );
}

function ComingSoonCard({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <Card className="border-black/10 shadow-sm opacity-50 cursor-default relative h-full">
      <CardContent className="p-6 md:p-8 relative h-full flex flex-col">
        <ComingSoonBadge />
        <div className="w-8 h-8 rounded-full border border-black/10 flex items-center justify-center bg-black/5 mb-4">
          <Icon className="w-4 h-4 text-black/40" />
        </div>
        <h2 className="text-lg font-semibold tracking-tight mb-1">{title}</h2>
        <p className="text-sm text-black/60 leading-relaxed">{description}</p>
      </CardContent>
    </Card>
  );
}

export function AnnotationHubContent() {
  const { initialized, authenticated, keycloak } = useKeycloak();
  const { dataset, stats } = usePrimaryDataset();

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

  const overall = stats?.overall_stats;
  const pct = overall?.completion_percentage ?? 0;
  const completed = overall?.completed_count ?? 0;
  const total = overall?.total_entries ?? 0;

  const dictionaryHref = dataset?.id
    ? `/annotation/dictionary/${dataset.id}`
    : "/annotation/dictionary";

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
            <Link href={dictionaryHref}>
              <Card className="border-black/10 shadow-sm hover:bg-neutral-50 transition-colors duration-200 cursor-pointer group h-full">
                <CardContent className="p-6 md:p-8 flex flex-col gap-4 h-full">
                  <div className="flex-1">
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

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs text-black/40">
                      <span>Overall progress</span>
                      {total > 0 ? (
                        <span>
                          {completed.toLocaleString()} / {total.toLocaleString()}
                        </span>
                      ) : (
                        <span>—</span>
                      )}
                    </div>
                    <Progress value={pct} className="h-1.5 bg-black/5" />
                  </div>
                </CardContent>
              </Card>
            </Link>

            <ComingSoonCard
              icon={Languages}
              title="Translation Dataset"
              description="Translate phrases from English to Arabic Darija to expand our parallel corpus."
            />

            <ComingSoonCard
              icon={Type}
              title="Transliteration Dataset"
              description="Convert Arabizi text to Arabic Darija script to normalize user-generated content."
            />
          </div>
        </motion.div>
      </main>
    </div>
  );
}
