"use client";

import { useState } from "react";
import { showSampleNotice } from "@/components/demo/sample-notice";
import { QuotePreview } from "@/components/messages/quote-preview";
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
import { DAILY_REQUEST_LIMIT } from "@/lib/rules/constants";
import type { RequestContext, RequestQuote } from "@/lib/rules/types";

const REASONS: Record<string, string> = {
  "signed-out": "Sign in to send message requests.",
  empty: "Write a message first.",
  unverified: "Verify your school email before contacting people.",
  incomplete: "Both profiles need the required fields filled in.",
  blocked: "You can't contact this person.",
  duplicate: "You already have an open request or chat with this person.",
  cooldown:
    "This person declined your last request. You can try again 30 days later.",
  "daily-limit": `You can send ${DAILY_REQUEST_LIMIT} new requests a day. Try again tomorrow.`,
};

export function RequestComposer({
  open,
  onOpenChange,
  toId,
  toName,
  context,
  quote,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  toId: string;
  toName: string;
  context: RequestContext;
  // A photo or prompt answer from their profile this request replies to.
  quote?: RequestQuote;
}) {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Say hi to {toName}</DialogTitle>
          <DialogDescription>
            You can send one message. {toName} can accept, delete or block it.
            You can chat once they accept.
          </DialogDescription>
        </DialogHeader>
        {quote ? <QuotePreview quote={quote} /> : null}
        <Textarea
          aria-label="Your message"
          rows={4}
          placeholder="Say hi and why you think you'd get along…"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        {error ? (
          <p role="alert" className="text-destructive text-sm">
            {error}
          </p>
        ) : null}
        <DialogFooter>
          <Button
            onClick={() => {
              const result = actions.sendRequest(
                toId,
                message,
                quote && context.type === "profile"
                  ? { ...context, quote }
                  : context,
              );
              if (!result.ok) return setError(REASONS[result.reason]);
              setMessage("");
              setError("");
              onOpenChange(false);
              showSampleNotice(`an email would let ${toName} know`);
            }}
          >
            Send request
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
