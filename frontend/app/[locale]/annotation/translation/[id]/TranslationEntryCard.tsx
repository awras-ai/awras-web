"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Loader2, Pencil, X, SkipForward, CheckCheck } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAnnotateTranslationEntry } from "@/hooks/useTranslation";
import { TranslationEntryFormFields } from "./TranslationEntryFormFields";
import type { Entry } from "@/lib/types/translation";

interface TranslationEntryCardProps {
  datasetId: string;
  entry: Entry;
}

export function TranslationEntryCard({
  datasetId,
  entry,
}: TranslationEntryCardProps) {
  const t = useTranslations("TranslationEntryCard");
  const queryClient = useQueryClient();
  const annotate = useAnnotateTranslationEntry();

  const [editMode, setEditMode] = useState(false);
  const [formTranslation, setFormTranslation] = useState(
    entry.reference_translation,
  );

  const [lastEntryId, setLastEntryId] = useState(entry.id);
  if (lastEntryId !== entry.id) {
    setLastEntryId(entry.id);
    setFormTranslation(entry.reference_translation);
    setEditMode(false);
  }

  const handleSubmit = () => {
    const translation = formTranslation.trim();
    if (!translation) return;

    annotate.mutate({
      entryId: entry.id,
      data: { corrected_translation: translation },
    });
  };

  const handleSkip = () => {
    queryClient.invalidateQueries({
      queryKey: ["translationNextEntry", datasetId],
    });
  };

  const handleCancelEdit = () => {
    setFormTranslation(entry.reference_translation);
    setEditMode(false);
  };

  return (
    <Card className="border-black/10 shadow-sm">
      <CardContent className="p-8 space-y-7">
        {/* Source text (always visible, read-only) */}
        <div>
          <p className="text-xs font-semibold text-black/40 tracking-widest uppercase mb-2">
            {t("sourceText")}
          </p>
          <p className="text-lg text-black/80 leading-relaxed">
            {entry.source_text}
          </p>
        </div>

        {editMode ? (
          <TranslationEntryFormFields
            translation={formTranslation}
            onTranslationChange={setFormTranslation}
          />
        ) : (
          /* Reference translation */
          <div>
            <p className="text-xs font-semibold text-black/40 tracking-widest uppercase mb-2">
              {t("referenceTranslation")}
            </p>
            <p dir="rtl" className="text-lg text-black/80 leading-relaxed text-right">
              {entry.reference_translation}
            </p>
          </div>
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
          )}
          {!editMode && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditMode(true)}
              disabled={annotate.isPending}
              className="border-black/10 text-black/60 hidden sm:inline-flex"
            >
              <Pencil className="w-3.5 h-3.5 me-1.5" />
              {t("edit")}
            </Button>
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

          {/* Confirm */}
          <Button
            size="icon-lg"
            onClick={handleSubmit}
            disabled={annotate.isPending || editMode && !formTranslation.trim()}
            className="group sm:hidden"
            aria-label={t("confirmAria")}
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
            disabled={annotate.isPending || editMode && !formTranslation.trim()}
            className="px-5 group hidden sm:inline-flex"
          >
            {annotate.isPending ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <>
                <CheckCheck className="w-3.5 h-3.5 me-1.5 transition-transform duration-300 group-hover:scale-110" />
                {t("confirm")}
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
      </CardContent>
    </Card>
  );
}
