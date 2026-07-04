"use client";

import { useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, ChevronRight, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useKeycloak } from "@/context/KeycloakContext";
import { AnnotationHeader } from "@/components/annotation/AnnotationHeader";
import { useDatasets, useDatasetStats } from "@/hooks/useDictionary";
import type { Dataset } from "@/lib/types/dictionary";

function DatasetCard({ dataset }: { dataset: Dataset }) {
  const { data: statsData } = useDatasetStats(dataset.id);
  const overall = statsData?.overall_stats;
  const pct = overall?.completion_percentage ?? 0;
  const completed = overall?.completed_count ?? 0;
  const total = overall?.total_entries ?? 0;

  return (
    <Link href={`/annotation/dictionary/${dataset.id}`}>
      <Card className="border-black/10 shadow-sm hover:bg-neutral-50 transition-colors duration-200 cursor-pointer group h-full">
        <CardContent className="p-6 md:p-8 flex flex-col gap-4 h-full">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h2 className="text-base font-semibold tracking-tight truncate mb-1">
                {dataset.name}
              </h2>
              <p className="text-sm text-black/60 leading-relaxed line-clamp-2">
                {dataset.description}
              </p>
            </div>
            <ChevronRight className="w-4 h-4 text-black/30 flex-shrink-0 mt-0.5 transition-colors group-hover:text-[#14b8a6]" />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {dataset.language && (
              <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-black/5 text-black/60">
                {dataset.language}
              </span>
            )}
            {dataset.category && (
              <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-black/5 text-black/60">
                {dataset.category}
              </span>
            )}
          </div>

          <div className="mt-auto space-y-1.5">
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
            <Progress
              value={pct}
              className="h-1.5 bg-black/5"
            />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export function DictionaryListContent() {
  const { initialized, authenticated, keycloak } = useKeycloak();
  const { data, isLoading } = useDatasets();

  useEffect(() => {
    if (!initialized) return;
    if (!authenticated) {
      keycloak?.login({
        redirectUri: `${window.location.origin}/annotation/dictionary`,
      });
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
          <Link
            href="/annotation"
            className="inline-flex items-center gap-1.5 text-sm text-black/40 hover:text-black transition-colors mb-10"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to tasks
          </Link>

          <p className="text-xs font-semibold text-black/40 tracking-widest uppercase mb-3">
            01 — Datasets
          </p>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-12">
            Choose a{" "}
            <span style={{ color: "#14b8a6" }}>dictionary.</span>
          </h1>

          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="border-black/10 shadow-sm animate-pulse">
                  <CardContent className="p-6 md:p-8 space-y-3">
                    <div className="h-4 bg-black/5 rounded w-3/4" />
                    <div className="h-3 bg-black/5 rounded w-full" />
                    <div className="h-3 bg-black/5 rounded w-2/3" />
                    <div className="flex gap-2 pt-1">
                      <div className="h-5 bg-black/5 rounded-full w-16" />
                      <div className="h-5 bg-black/5 rounded-full w-16" />
                    </div>
                    <div className="h-1.5 bg-black/5 rounded-full mt-4" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : !data?.datasets.length ? (
            <p className="text-black/40 text-lg">No datasets available yet.</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {data.datasets.map((dataset) => (
                <DatasetCard key={dataset.id} dataset={dataset} />
              ))}
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
