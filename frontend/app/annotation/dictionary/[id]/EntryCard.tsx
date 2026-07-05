"use client";

import { useState, useEffect } from "react";
import { Loader2, Pencil, X, SkipForward, CheckCheck } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAnnotateEntry } from "@/hooks/useDictionary";
import { EntryFormFields } from "./EntryFormFields";
import type { Entry } from "@/lib/types/dictionary";

interface EntryCardProps {
  datasetId: string;
  entry: Entry;
}

function renderMultiline(content: string) {
  return content.split("\n").map((line, i) => (
    <p key={i} className="text-right">
      {line || "\u00A0"}
    </p>
  ));
}

export function EntryCard({ datasetId, entry }: EntryCardProps) {
  const queryClient = useQueryClient();
  const annotate = useAnnotateEntry();

  const [editMode, setEditMode] = useState(false);
  const [formWord, setFormWord] = useState("");
  const [formWordArabizi, setFormWordArabizi] = useState("");
  const [formMeaning, setFormMeaning] = useState("");
  const [formExamples, setFormExamples] = useState("");

  useEffect(() => {
    setFormWord(entry.word);
    setFormWordArabizi(entry.word_arabizi ?? "");
    setFormMeaning(entry.meaning);
    setFormExamples(entry.examples ?? "");
    setEditMode(false);
  }, [entry.id]);

  const handleSubmit = () => {
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
    setFormWord(entry.word);
    setFormWordArabizi(entry.word_arabizi ?? "");
    setFormMeaning(entry.meaning);
    setFormExamples(entry.examples ?? "");
    setEditMode(false);
  };

  return (
    <Card className="border-black/10 shadow-sm">
      <CardContent className="p-8 space-y-7">
        {editMode ? (
          <EntryFormFields
            word={formWord}
            onWordChange={setFormWord}
            wordArabizi={formWordArabizi}
            onWordArabiziChange={setFormWordArabizi}
            meaning={formMeaning}
            onMeaningChange={setFormMeaning}
            examples={formExamples}
            onExamplesChange={setFormExamples}
          />
        ) : (
          <>
            {/* Word */}
            <div>
              <p className="text-xs font-semibold text-black/40 tracking-widest uppercase mb-2">
                Word
              </p>
              <div className="flex items-baseline justify-between gap-4">
                {formWordArabizi ? (
                  <span className="text-base font-semibold text-black/70">
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
            </div>

            {/* Meaning */}
            <div>
              <p className="text-xs font-semibold text-black/40 tracking-widest uppercase mb-2">
                Meaning
              </p>
              <div dir="rtl" className="space-y-1">
                {renderMultiline(formMeaning)}
              </div>
            </div>

            {/* Examples */}
            <div>
              <p className="text-xs font-semibold text-black/40 tracking-widest uppercase mb-2">
                Examples
              </p>
              {entry.examples ? (
                <div dir="rtl" className="space-y-1">
                  {renderMultiline(formExamples)}
                </div>
              ) : (
                <span className="text-sm text-black/20 italic">
                  No examples yet…
                </span>
              )}
            </div>
          </>
        )}

        {/* Divider */}
        <div className="border-t border-black/10" />

        {/* Actions */}
        <div className="flex items-center gap-3">
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
  );
}
