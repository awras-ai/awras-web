"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Loader2,
  CheckCircle,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useKeycloak } from "@/context/KeycloakContext";
import { AnnotationHeader } from "@/components/annotation/AnnotationHeader";
import {
  useDatasetStats,
  useNextEntry,
} from "@/hooks/useDictionary";
import { NoEntriesAvailableError } from "@/lib/api/dictionary";
import { EntryCard } from "./EntryCard";
import { CreateEntryCard } from "./CreateEntryCard";

interface Props {
  datasetId: string;
}

export function DictionaryAnnotationContent({ datasetId }: Props) {
  const { initialized, authenticated, keycloak } = useKeycloak();

  const { data: statsData } = useDatasetStats(datasetId);
  const nextEntry = useNextEntry(datasetId);

  const entry = nextEntry.data;
  const isNoEntries =
    nextEntry.isError && nextEntry.error instanceof NoEntriesAvailableError;

  const [addWordMode, setAddWordMode] = useState(false);

  useEffect(() => {
    if (!initialized) return;
    if (!authenticated) {
      keycloak?.login({
        redirectUri: `${window.location.origin}/annotation/dictionary/${datasetId}`,
      });
    }
  }, [initialized, authenticated, keycloak, datasetId]);

  if (!initialized || !authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: "#14b8a6" }} />
      </div>
    );
  }

  const userStats = statsData?.user_stats;
  const overallStats = statsData?.overall_stats;
  const datasetName = statsData?.dataset.name;

  const userAnnotated = userStats?.annotated_by_user ?? 0;
  const totalEntries = overallStats?.total_entries ?? 0;
  const userPct = totalEntries > 0 ? (userAnnotated / totalEntries) * 100 : 0;

  return (
    <div className="min-h-screen bg-white">
      <AnnotationHeader />

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-12 md:py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-8"
        >
          {/* Back link */}
          <Link
            href="/annotation/dictionary"
            className="inline-flex items-center gap-1.5 text-sm text-black/40 hover:text-black transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to datasets
          </Link>

          {/* Dataset name + progress */}
          <div className="space-y-3">
            <div className="flex items-baseline justify-between gap-4">
              <div className="flex items-center gap-2 min-w-0">
                <h1 className="text-xl font-bold tracking-tight truncate">
                  {datasetName ?? "Dictionary"}
                </h1>
                {!addWordMode && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setAddWordMode(true)}
                    className="border-black/10 text-black/60 flex-shrink-0 ml-1"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" />
                    Add word
                  </Button>
                )}
              </div>
              <span className="text-xs text-black/40 flex-shrink-0">
                {userAnnotated.toLocaleString()} annotated
              </span>
            </div>
            <Progress
              value={userPct}
              className="h-1.5 bg-black/5"
            />
          </div>

          {/* Loading skeleton */}
          {nextEntry.isLoading && (
            <Card className="border-black/10 shadow-sm">
              <CardContent className="p-8 space-y-5 animate-pulse">
                <div className="h-8 bg-black/5 rounded w-1/3" />
                <div className="space-y-2">
                  <div className="h-3 bg-black/5 rounded w-16" />
                  <div className="h-4 bg-black/5 rounded w-full" />
                  <div className="h-4 bg-black/5 rounded w-5/6" />
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-black/5 rounded w-16" />
                  <div className="h-4 bg-black/5 rounded w-3/4" />
                </div>
              </CardContent>
            </Card>
          )}

          {/* No entries state */}
          {isNoEntries && (
            <Card className="border-black/10 shadow-sm">
              <CardContent className="p-10 flex flex-col items-center text-center gap-3">
                <CheckCircle
                  className="w-10 h-10"
                  style={{ color: "#14b8a6" }}
                />
                <h2 className="text-lg font-semibold tracking-tight">
                  All caught up!
                </h2>
                <p className="text-sm text-black/60">
                  There are no more pending entries for you in this dataset.
                </p>
                <Link href="/annotation/dictionary" className="mt-2">
                  <Button variant="outline" size="sm" className="border-black/10">
                    Back to datasets
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {/* Generic error */}
          {nextEntry.isError && !isNoEntries && (
            <Card className="border-black/10 shadow-sm">
              <CardContent className="p-8 flex flex-col items-center text-center gap-3">
                <p className="text-sm text-black/50">
                  Failed to load the next entry.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-black/10"
                  onClick={() => nextEntry.refetch()}
                >
                  Retry
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Entry card */}
          <AnimatePresence mode="wait">
            {addWordMode ? (
              <motion.div
                key="create-entry"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.2 }}
              >
                <CreateEntryCard
                  datasetId={datasetId}
                  onDone={() => setAddWordMode(false)}
                />
              </motion.div>
            ) : (
              entry && (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.2 }}
                >
                  <EntryCard datasetId={datasetId} entry={entry} />
                </motion.div>
              )
            )}
          </AnimatePresence>
        </motion.div>
      </main>
    </div>
  );
}
