"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useCreateEntry } from "@/hooks/useDictionary";
import { EntryFormFields } from "./EntryFormFields";
import type { CreateEntryRequest } from "@/lib/types/dictionary";

interface AddWordDialogProps {
  datasetId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddWordDialog({
  datasetId,
  open,
  onOpenChange,
}: AddWordDialogProps) {
  const queryClient = useQueryClient();
  const create = useCreateEntry();

  const [word, setWord] = useState("");
  const [wordArabizi, setWordArabizi] = useState("");
  const [meaning, setMeaning] = useState("");
  const [examples, setExamples] = useState("");

  useEffect(() => {
    if (open) {
      setWord("");
      setWordArabizi("");
      setMeaning("");
      setExamples("");
    }
  }, [open]);

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
        onOpenChange(false);
      },
    });
  };

  const isValid = word.trim().length > 0 && meaning.trim().length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Add a new word</DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
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

          {create.isError && (
            <p className="text-xs text-red-500 text-center">
              Failed to create entry. Please try again.
            </p>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={create.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!isValid || create.isPending}
            className="rounded-full px-5"
          >
            {create.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "Add word"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
