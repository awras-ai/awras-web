"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Loader2, X, CheckCheck } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCreateEntry } from "@/hooks/useDictionary";
import { EntryFormFields } from "./EntryFormFields";
import type { CreateEntryRequest } from "@/lib/types/dictionary";

interface CreateEntryCardProps {
  datasetId: string;
  onDone: () => void;
}

export function CreateEntryCard({ datasetId, onDone }: CreateEntryCardProps) {
  const t = useTranslations("CreateEntryCard");
  const queryClient = useQueryClient();
  const create = useCreateEntry();

  const [word, setWord] = useState("");
  const [wordArabizi, setWordArabizi] = useState("");
  const [meaning, setMeaning] = useState("");
  const [examples, setExamples] = useState("");

  const handleSubmit = () => {
    const data: CreateEntryRequest = {
      dataset_id: datasetId,
      word: word.trim(),
      meaning: meaning.trim(),
    };
    if (wordArabizi.trim()) data.word_arabizi = wordArabizi.trim();
    if (examples.trim()) data.examples = examples.trim();

    create.mutate(data, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["nextEntry", datasetId] });
        onDone();
      },
    });
  };

  const isValid = word.trim().length > 0 && meaning.trim().length > 0;

  return (
    <Card className="border-black/10 shadow-sm">
      <CardContent className="p-8 space-y-7">
        <EntryFormFields
          word={word}
          onWordChange={setWord}
          wordArabizi={wordArabizi}
          onWordArabiziChange={setWordArabizi}
          meaning={meaning}
          onMeaningChange={setMeaning}
          examples={examples}
          onExamplesChange={setExamples}
        />

        <div className="border-t border-black/10" />

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={onDone}
            disabled={create.isPending}
            className="border-black/10 text-black/60"
          >
            <X className="w-3.5 h-3.5 me-1.5" />
            {t("cancel")}
          </Button>

          <div className="flex-1" />

          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={!isValid || create.isPending}
            className="rounded-full px-5 group"
          >
            {create.isPending ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <>
                <CheckCheck className="w-3.5 h-3.5 me-1.5 transition-transform duration-300 group-hover:scale-110" />
                {t("addWord")}
              </>
            )}
          </Button>
        </div>

        {create.isError && (
          <p className="text-xs text-red-500 text-center">
            {t("failedToCreate")}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
