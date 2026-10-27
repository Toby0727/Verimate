"use client";

import { useState } from "react";
import { toast } from "sonner";
import { ChoiceChips } from "@/components/shell/choice-chips";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import * as actions from "@/lib/demo/actions";
import { REPORT_SLA_HOURS } from "@/lib/rules/constants";
import type { Report } from "@/lib/rules/types";

const REASONS = [
  "Scam",
  "Fake profile",
  "Harassment",
  "Inappropriate",
  "Other",
];

export function ReportDialog({
  open,
  onOpenChange,
  target,
  targetLabel,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  target: Report["target"];
  targetLabel: string;
}) {
  const [reason, setReason] = useState<string | null>(null);
  const [note, setNote] = useState("");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Report {targetLabel}</DialogTitle>
          <DialogDescription>
            The team reviews every report within {REPORT_SLA_HOURS} hours. The
            person won't know who reported them.
          </DialogDescription>
        </DialogHeader>
        <ChoiceChips
          label="Reason"
          options={REASONS.map((r) => ({ value: r, label: r }))}
          value={reason}
          onChange={setReason}
        />
        <Textarea
          aria-label="Details"
          rows={3}
          placeholder="Anything that helps the team (optional)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
        <DialogFooter>
          <Button
            disabled={!reason}
            onClick={() => {
              if (!reason) return;
              if (actions.report(target, reason, note).ok) {
                toast.success(
                  `Thanks — we'll review within ${REPORT_SLA_HOURS} hours.`,
                );
                setReason(null);
                setNote("");
                onOpenChange(false);
              }
            }}
          >
            Submit report
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
