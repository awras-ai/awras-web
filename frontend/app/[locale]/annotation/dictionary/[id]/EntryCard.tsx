"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import {
  Loader2,
  Pencil,
  X,
  SkipForward,
  CheckCheck,
  Flag,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAnnotateEntry } from "@/hooks/useDictionary";
import { EntryFormFields } from "./EntryFormFields";
import { ReportEntryDialog } from "./ReportEntryDialog";
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
  const t = useTranslations("EntryCard");
  const queryClient = useQueryClient();
  const annotate = useAnnotateEntry();

  const [editMode, setEditMode] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
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
                {t("word")}
              </p>
              <div className="flex items-baseline justify-between gap-4">
                {formWordArabizi ? (
                  <span className="text-base font-semibold text-black/70">
                    {formWordArabizi}
                  </span>
                ) : (
                  <span className="text-sm text-black/20 italic">
                    {t("noArabizi")}
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
                {t("meaning")}
              </p>
              <div dir="rtl" className="space-y-1">
                {renderMultiline(formMeaning)}
              </div>
            </div>

            {/* Examples */}
            <div>
              <p className="text-xs font-semibold text-black/40 tracking-widest uppercase mb-2">
                {t("examples")}
              </p>
              {entry.examples ? (
                <div dir="rtl" className="space-y-1">
                  {renderMultiline(formExamples)}
                </div>
              ) : (
                <span className="text-sm text-black/20 italic">
                  {t("noExamplesYet")}
                </span>
              )}
            </div>
          </>
        )}

        {/* Divider */}
        <div className="border-t border-black/10" />

        {/* Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {editMode ? (
            <Button
              variant="outline"
              size="icon-lg"
              onClick={handleCancelEdit}
              className="border-black/10 text-black/60 sm:hidden"
              aria-label={t("cancelEditAria")}
            >
              <X className="w-4 h-4" />
            </Button>
          ) : null}
          {editMode ? (
            <Button
              variant="outline"
              size="sm"
              onClick={handleCancelEdit}
              className="border-black/10 text-black/60 hidden sm:inline-flex"
            >
              <X className="w-3.5 h-3.5 me-1.5" />
              {t("cancel")}
            </Button>
          ) : (
            <>
              <Button
                variant="outline"
                size="icon-lg"
                onClick={() => setEditMode(true)}
                disabled={annotate.isPending}
                className="border-black/10 text-black/60 sm:hidden"
                aria-label={t("editAria")}
              >
                <Pencil className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditMode(true)}
                className="border-black/10 text-black/60 hidden sm:inline-flex"
              >
                <Pencil className="w-3.5 h-3.5 me-1.5" />
                {t("edit")}
              </Button>

              <Button
                variant="outline"
                size="icon-lg"
                onClick={() => setReportOpen(true)}
                disabled={annotate.isPending}
                className="border-red-500/20 text-red-500/70 hover:bg-red-500/5 hover:text-red-500 hover:border-red-500/40 sm:hidden"
                aria-label={t("reportAria")}
              >
                <Flag className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setReportOpen(true)}
                disabled={annotate.isPending}
                className="border-red-500/20 text-red-500/70 hover:bg-red-500/5 hover:text-red-500 hover:border-red-500/40 hidden sm:inline-flex"
              >
                <Flag className="w-3.5 h-3.5 me-1.5" />
                {t("report")}
              </Button>
            </>
          )}

          <div className="flex-1" />

          {/* Skip */}
          <Button
            variant="outline"
            size="icon-lg"
            onClick={handleSkip}
            disabled={annotate.isPending}
            className="border-black/10 text-black/60 sm:hidden"
            aria-label={t("skipAria")}
          >
            <SkipForward className="w-4 h-4 rtl:rotate-180" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSkip}
            disabled={annotate.isPending}
            className="border-black/10 text-black/60 hidden sm:inline-flex"
          >
            <SkipForward className="w-3.5 h-3.5 me-1.5 rtl:rotate-180" />
            {t("skip")}
          </Button>

          {/* Submit */}
          <Button
            size="icon-lg"
            onClick={handleSubmit}
            disabled={annotate.isPending}
            className="group sm:hidden"
            aria-label={t("submitAria")}
          >
            {annotate.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <CheckCheck className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" />
            )}
          </Button>
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={annotate.isPending}
            className="px-5 group hidden sm:inline-flex"
          >
            {annotate.isPending ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <>
                <CheckCheck className="w-3.5 h-3.5 me-1.5 transition-transform duration-300 group-hover:scale-110" />
                {t("submit")}
              </>
            )}
          </Button>
        </div>

        {/* Mutation error */}
        {annotate.isError && (
          <p className="text-xs text-red-500 text-center">
            {t("failedToSubmit")}
          </p>
        )}

        <ReportEntryDialog
          entryId={entry.id}
          open={reportOpen}
          onOpenChange={setReportOpen}
        />
      </CardContent>
    </Card>
  );
}
