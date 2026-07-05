"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Loader2,
  Pencil,
  X,
  SkipForward,
  CheckCheck,
  CheckCircle,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useKeycloak } from "@/context/KeycloakContext";
import { AnnotationHeader } from "@/components/annotation/AnnotationHeader";
import {
  useDatasetStats,
  useNextEntry,
  useAnnotateEntry,
} from "@/hooks/useDictionary";
import { NoEntriesAvailableError } from "@/lib/api/dictionary";

interface Props {
  datasetId: string;
}

export function DictionaryAnnotationContent({ datasetId }: Props) {
  const { initialized, authenticated, keycloak } = useKeycloak();
  const queryClient = useQueryClient();

  const { data: statsData } = useDatasetStats(datasetId);
  const nextEntry = useNextEntry(datasetId);
  const annotate = useAnnotateEntry();

  const entry = nextEntry.data;
  const isNoEntries =
    nextEntry.isError && nextEntry.error instanceof NoEntriesAvailableError;

  // Form state
  const [editMode, setEditMode] = useState(false);
  const [formWord, setFormWord] = useState("");
  const [formWordArabizi, setFormWordArabizi] = useState("");
  const [formMeaning, setFormMeaning] = useState("");
  const [formExamples, setFormExamples] = useState("");

  // Auth guard
  useEffect(() => {
    if (!initialized) return;
    if (!authenticated) {
      keycloak?.login({
        redirectUri: `${window.location.origin}/annotation/dictionary/${datasetId}`,
      });
    }
  }, [initialized, authenticated, keycloak, datasetId]);

  // Reset form when a new entry loads
  useEffect(() => {
    if (entry) {
      setFormWord(entry.word);
      setFormWordArabizi(entry.word_arabizi ?? "");
      setFormMeaning(entry.meaning);
      setFormExamples(entry.examples ?? "");
      setEditMode(false);
    }
  }, [entry?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!initialized || !authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: "#14b8a6" }} />
      </div>
    );
  }

  const handleSubmit = () => {
    if (!entry) return;

    const correctedWord =
      formWord.trim() !== entry.word ? formWord.trim() : undefined;
    const correctedArabizi =
      formWordArabizi.trim() !== (entry.word_arabizi ?? "")
        ? formWordArabizi.trim()
        : undefined;
    const correctedMeaning =
      formMeaning.trim() !== entry.meaning ? formMeaning.trim() : undefined;
    const correctedExamples =
      formExamples.trim() !== (entry.examples ?? "")
        ? formExamples.trim()
        : undefined;
    const hasChanges =
      correctedWord !== undefined ||
      correctedArabizi !== undefined ||
      correctedMeaning !== undefined ||
      correctedExamples !== undefined;

    annotate.mutate({
      entryId: entry.id,
      data: hasChanges
        ? {
            corrected_word: correctedWord,
            corrected_word_arabizi: correctedArabizi,
            corrected_meaning: correctedMeaning,
            corrected_examples: correctedExamples,
          }
        : { confirmed: true },
    });
  };

  const handleSkip = () => {
    queryClient.invalidateQueries({ queryKey: ["nextEntry", datasetId] });
  };

  const handleCancelEdit = () => {
    if (entry) {
      setFormWord(entry.word);
      setFormWordArabizi(entry.word_arabizi ?? "");
      setFormMeaning(entry.meaning);
      setFormExamples(entry.examples ?? "");
    }
    setEditMode(false);
  };

  // Stats
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
              <h1 className="text-xl font-bold tracking-tight truncate">
                {datasetName ?? "Dictionary"}
              </h1>
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
            {entry && (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="border-black/10 shadow-sm">
                  <CardContent className="p-8 space-y-7">
                    {/* Word */}
                    <div>
                      <p className="text-xs font-semibold text-black/40 tracking-widest uppercase mb-2">
                        Word
                      </p>
                      {editMode ? (
                        <div className="flex gap-3">
                          <input
                            type="text"
                            value={formWordArabizi}
                            onChange={(e) => setFormWordArabizi(e.target.value)}
                            placeholder="Arabizi…"
                            className="flex-1 rounded-md border border-black/10 bg-transparent px-3 py-2.5 text-base text-black/60 leading-relaxed outline-none transition-colors placeholder:text-black/25 focus:border-[#14b8a6] focus:ring-2 focus:ring-[#14b8a6]/20"
                          />
                          <input
                            type="text"
                            value={formWord}
                            onChange={(e) => setFormWord(e.target.value)}
                            dir="rtl"
                            placeholder="الكلمة…"
                            className="flex-[2] rounded-md border border-black/10 bg-transparent px-3 py-2.5 text-lg text-black/80 leading-relaxed text-right outline-none transition-colors placeholder:text-black/25 focus:border-[#14b8a6] focus:ring-2 focus:ring-[#14b8a6]/20"
                          />
                        </div>
                      ) : (
                        <div className="flex items-baseline justify-between gap-4">
                          {formWordArabizi ? (
                            <span className="text-sm text-black/40 italic">
                              {formWordArabizi}
                            </span>
                          ) : (
                            <span className="text-sm text-black/20 italic">
                              No arabizi…
                            </span>
                          )}
                          <h2
                            dir="rtl"
                            className="text-3xl font-bold tracking-tight text-right"
                          >
                            {formWord}
                          </h2>
                        </div>
                      )}
                    </div>

                    {/* Meaning */}
                    <div>
                      <p className="text-xs font-semibold text-black/40 tracking-widest uppercase mb-2">
                        Meaning
                      </p>
                      {editMode ? (
                        <textarea
                          value={formMeaning}
                          onChange={(e) => setFormMeaning(e.target.value)}
                          dir="rtl"
                          rows={3}
                          className="w-full rounded-md border border-black/10 bg-transparent px-3 py-2.5 text-base text-black/80 leading-relaxed text-right resize-none outline-none transition-colors focus:border-[#14b8a6] focus:ring-2 focus:ring-[#14b8a6]/20"
                        />
                      ) : (
                        <div dir="rtl" className="space-y-1">
                          {formMeaning.split("\n").map((line, i) => (
                            <p key={i} className="text-lg text-black/80 leading-relaxed text-right">
                              {line || "\u00A0"}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Examples */}
                    {(entry.examples || editMode) && (
                      <div>
                        <p className="text-xs font-semibold text-black/40 tracking-widest uppercase mb-2">
                          Examples
                        </p>
                        {editMode ? (
                          <textarea
                            value={formExamples}
                            onChange={(e) => setFormExamples(e.target.value)}
                            dir="rtl"
                            rows={2}
                            placeholder="No examples yet…"
                            className="w-full rounded-md border border-black/10 bg-transparent px-3 py-2.5 text-base text-black/70 leading-relaxed text-right resize-none outline-none transition-colors placeholder:text-black/25 focus:border-[#14b8a6] focus:ring-2 focus:ring-[#14b8a6]/20"
                          />
                        ) : (
                          <div dir="rtl" className="space-y-1">
                            {formExamples.split("\n").map((line, i) => (
                              <p key={i} className="text-base text-black/60 leading-relaxed text-right">
                                {line || "\u00A0"}
                              </p>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Divider */}
                    <div className="border-t border-black/10" />

                    {/* Actions */}
                    <div className="flex items-center gap-3">
                      {/* Edit toggle */}
                      {editMode ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleCancelEdit}
                          className="border-black/10 text-black/60"
                        >
                          <X className="w-3.5 h-3.5 mr-1.5" />
                          Cancel
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditMode(true)}
                          className="border-black/10 text-black/60"
                        >
                          <Pencil className="w-3.5 h-3.5 mr-1.5" />
                          Edit
                        </Button>
                      )}

                      <div className="flex-1" />

                      {/* Skip */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleSkip}
                        disabled={annotate.isPending}
                        className="border-black/10 text-black/60"
                      >
                        <SkipForward className="w-3.5 h-3.5 mr-1.5" />
                        Skip
                      </Button>

                      {/* Submit */}
                      <Button
                        size="sm"
                        onClick={handleSubmit}
                        disabled={annotate.isPending}
                        className="rounded-full px-5 group"
                      >
                        {annotate.isPending ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <>
                            <CheckCheck className="w-3.5 h-3.5 mr-1.5 transition-transform duration-300 group-hover:scale-110" />
                            Submit
                          </>
                        )}
                      </Button>
                    </div>

                    {/* Mutation error */}
                    {annotate.isError && (
                      <p className="text-xs text-red-500 text-center">
                        Failed to submit. Please try again.
                      </p>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </main>
    </div>
  );
}
