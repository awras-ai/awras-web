"use client";

import { useState, useEffect } from "react";
import { Flag, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useReportEntry } from "@/hooks/useDictionary";
import { ReportError } from "@/lib/api/dictionary";
import type { ReportReason } from "@/lib/types/dictionary";

interface ReportEntryDialogProps {
  entryId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const REPORT_REASONS: {
  value: ReportReason;
  label: string;
  description: string;
}[] = [
  {
    value: "duplicate",
    label: "Duplicate",
    description: "This entry already exists in the dataset.",
  },
  {
    value: "offensive",
    label: "Offensive",
    description: "Contains inappropriate or offensive content.",
  },
  {
    value: "wrong_language",
    label: "Wrong language",
    description: "The word or meaning is in the wrong language.",
  },
  {
    value: "more_than_a_word",
    label: "More than a word",
    description:
      "Contains a phrase or multiple words instead of a single word.",
  },
  {
    value: "other",
    label: "Other",
    description: "Something else is wrong with this entry.",
  },
];

export function ReportEntryDialog({
  entryId,
  open,
  onOpenChange,
}: ReportEntryDialogProps) {
  const report = useReportEntry();

  const [reason, setReason] = useState<ReportReason | "">("");
  const [details, setDetails] = useState("");

  useEffect(() => {
    if (!open) {
      setReason("");
      setDetails("");
      report.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleSubmit = () => {
    if (!reason) return;

    report.mutate(
      {
        entryId,
        data: {
          reason,
          ...(details.trim() ? { details: details.trim() } : {}),
        },
      },
      {
        onSuccess: () => {
          toast.success("Report submitted. Thanks for the heads up.");
          onOpenChange(false);
        },
      },
    );
  };

  const errorMessage = report.isError
    ? report.error instanceof ReportError
      ? report.error.message
      : "Failed to submit report. Please try again."
    : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[460px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Flag className="w-4 h-4 text-red-500/80" />
            <DialogTitle>Report this entry</DialogTitle>
          </div>
          <DialogDescription>
            Flag this entry as problematic. It will be removed from the queue
            and counted toward dataset completion.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="report-reason">Reason</Label>
            <Select
              value={reason}
              onValueChange={(v) => setReason(v as ReportReason)}
            >
              <SelectTrigger id="report-reason" className="w-full">
                <SelectValue placeholder="Select a reason..." />
              </SelectTrigger>
              <SelectContent>
                {REPORT_REASONS.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    <div className="flex flex-col items-start gap-0.5 py-0.5">
                      <span className="text-sm font-medium">{r.label}</span>
                      {/* <span className="text-xs text-black/50 font-normal"> */}
                      {/*   {r.description} */}
                      {/* </span> */}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="report-details">Details (optional)</Label>
            <Textarea
              id="report-details"
              value={details}
              onChange={(e) => setDetails(e.target.value.slice(0, 2000))}
              placeholder="Add more context to help us understand the issue..."
              rows={4}
              maxLength={2000}
              className="resize-none"
            />
            <p className="text-[10px] text-black/40 text-right tabular-nums">
              {details.length} / 2000
            </p>
          </div>

          {errorMessage && (
            <p className="text-xs text-red-500">{errorMessage}</p>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={report.isPending}
            className="border-black/10 text-black/60"
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={!reason || report.isPending}
            className="rounded-full px-5"
          >
            {report.isPending ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <>
                <Flag className="w-3.5 h-3.5 mr-1.5" />
                Submit report
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
