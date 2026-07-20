"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
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

function getReportReasons(
  t: ReturnType<typeof useTranslations>,
): { value: ReportReason; label: string; description: string }[] {
  return [
    {
      value: "duplicate",
      label: t("reasons.duplicate.label"),
      description: t("reasons.duplicate.description"),
    },
    {
      value: "offensive",
      label: t("reasons.offensive.label"),
      description: t("reasons.offensive.description"),
    },
    {
      value: "wrong_language",
      label: t("reasons.wrongLanguage.label"),
      description: t("reasons.wrongLanguage.description"),
    },
    {
      value: "more_than_a_word",
      label: t("reasons.moreThanAWord.label"),
      description: t("reasons.moreThanAWord.description"),
    },
    {
      value: "other",
      label: t("reasons.other.label"),
      description: t("reasons.other.description"),
    },
  ];
}

export function ReportEntryDialog({
  entryId,
  open,
  onOpenChange,
}: ReportEntryDialogProps) {
  const t = useTranslations("ReportEntryDialog");
  const REPORT_REASONS = getReportReasons(t);
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
          toast.success(t("successToast"));
          onOpenChange(false);
        },
      },
    );
  };

  const errorMessage = report.isError
    ? report.error instanceof ReportError
      ? report.error.message
      : t("genericError")
    : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[460px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Flag className="w-4 h-4 text-red-500/80" />
            <DialogTitle>{t("title")}</DialogTitle>
          </div>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="report-reason">{t("reasonLabel")}</Label>
            <Select
              value={reason}
              onValueChange={(v) => setReason(v as ReportReason)}
            >
              <SelectTrigger id="report-reason" className="w-full">
                <SelectValue placeholder={t("reasonPlaceholder")} />
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
            <Label htmlFor="report-details">{t("detailsLabel")}</Label>
            <Textarea
              id="report-details"
              value={details}
              onChange={(e) => setDetails(e.target.value.slice(0, 2000))}
              placeholder={t("detailsPlaceholder")}
              rows={4}
              maxLength={2000}
              className="resize-none"
            />
            <p className="text-[10px] text-black/40 text-end tabular-nums">
              {t("charCount", { count: details.length, max: 2000 })}
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
            {t("cancel")}
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
                <Flag className="w-3.5 h-3.5 me-1.5" />
                {t("submitReport")}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
