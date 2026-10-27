"use client";

import { Ban, Flag } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
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
import * as actions from "@/lib/demo/actions";
import type { Report } from "@/lib/rules/types";
import { ReportDialog } from "./report-dialog";

// Report and block controls shown on other people's profiles and posts.
export function SafetyMenu({
  personId,
  personName,
  reportTarget,
  reportLabel,
  afterBlockHref,
}: {
  personId: string;
  personName: string;
  reportTarget: Report["target"];
  reportLabel: string;
  afterBlockHref: string;
}) {
  const router = useRouter();
  const [reportOpen, setReportOpen] = useState(false);
  const [blockOpen, setBlockOpen] = useState(false);

  return (
    <div className="flex gap-2">
      <Button variant="ghost" size="sm" onClick={() => setReportOpen(true)}>
        <Flag /> Report
      </Button>
      <Button variant="ghost" size="sm" onClick={() => setBlockOpen(true)}>
        <Ban /> Block
      </Button>
      <ReportDialog
        open={reportOpen}
        onOpenChange={setReportOpen}
        target={reportTarget}
        targetLabel={reportLabel}
      />
      <Dialog open={blockOpen} onOpenChange={setBlockOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Block {personName}?</DialogTitle>
            <DialogDescription>
              You won't see each other's profiles or posts, and they can't send
              you requests. They won't be told.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="destructive"
              onClick={() => {
                actions.block(personId);
                setBlockOpen(false);
                toast.success(`${personName} is blocked.`);
                router.push(afterBlockHref);
              }}
            >
              Block
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
